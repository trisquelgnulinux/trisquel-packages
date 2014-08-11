import sys
import glob
import os
import os.path
import re
import sys

from optparse import OptionParser

import gdbm

os.unsetenv("DISPLAY")

try:
    import xdg.DesktopEntry
except ImportError, e:
    print "WARNING: can not import xdg.DesktopEntry, aborting"
    sys.exit(0)

try:
    from CoreMenu import *
except ImportError, e:
    print "Can't import AppInstall.CoreMenu, aborting"
    sys.exit(0)


def generate_mime_map(desktop_dir, cache_dir):
    dicts = { 'mime':{}, 'codec':{} }

    def record_provider(de, cp, defield,dictname):
	try: keys = de.get(defield, list=True)
        except keyError: return
	if not keys: return
	dict = dicts[dictname]
	for key in keys:
            # gst-caps support
            if dictname == 'codec' and ',' in key:
                key = key.split(",")[0]
	    try:
                l = dict[key]
            except KeyError:
                l = []; dict[key] = l
            l.append(cp)

    for fn in glob.glob(os.path.join(desktop_dir, 'desktop/*.desktop')):
        try:
            de = xdg.DesktopEntry.DesktopEntry(fn)
        except Exception, e:
            print >>sys.stderr, "bad .desktop file: %s: %s" % (fn, e)
        try:
            component = de.get('X-AppInstall-Section')
            package = de.get('X-AppInstall-Package')
        except KeyError:
            continue
	cp = component+"/"+package
	record_provider(de, cp, 'MimeType','mime')
	record_provider(de, cp, 'X-AppInstall-Codecs','codec')

    for (dictname,dict) in dicts.iteritems():
	g = gdbm.open(os.path.join(cache_dir,
			"gai-"+dictname+"-map.gdbm"),'nfu')
	for (key,l) in dict.iteritems():
	    g[key] = ' '.join(l)
	g.sync()
	g.close()
	os.chmod(os.path.join(cache_dir, "gai-"+dictname+"-map.gdbm"), 0644)

def generate_menu_cache(desktop_dir, cache_dir):
    # the regular menu cache
    menu = CoreApplicationMenu(desktop_dir)
    menu.createMenuCache(cache_dir)
    # now the codec/mime menu_cache
    codec_pickle = {}
    mime_pickle = {}
    icons_pickle = {}
    for cat in menu.pickle:
        for item in menu.pickle[cat]:
            if item.codecs != ['']:
                if not codec_pickle.has_key(cat):
                    codec_pickle[cat] = []
                codec_pickle[cat].append(item)
            if item.mime != []:
                if not mime_pickle.has_key(cat):
                    mime_pickle[cat] = []
                mime_pickle[cat].append(item)
            if item.iconname != '':
                icons = icons_pickle.get(item.pkgname) or []
                if not item.iconname in icons:
                    icons.append(item.iconname)
                icons_pickle[item.pkgname] = icons
    cPickle.dump(mime_pickle, open('%s/mime_menu.p' % cache_dir,'w'), 2)
    os.chmod('%s/mime_menu.p' % cache_dir, 0644)
    cPickle.dump(codec_pickle, open('%s/codec_menu.p' % cache_dir,'w'), 2)
    os.chmod('%s/codec_menu.p' % cache_dir, 0644)
    cPickle.dump(icons_pickle, open('%s/pkgname_icons.p' % cache_dir,'w'), 2)
    os.chmod('%s/pkgname_icons.p' % cache_dir, 0644)

def main():
 	parser = OptionParser()
  	parser.add_option ("-d", "--desktop-dir", action="store",
                       dest="desktop_dir", 
 					   default="/usr/share/app-install",
                       help="Directory that contains the desktop files "
                            "of the applications")
  	parser.add_option ("-c", "--cache-dir", action="store",
                       dest="cache_dir", 
 					   default="/var/cache/app-install",
                       help="Directory where the data should be cached in")
	(options, args) = parser.parse_args()
	for path in (options.desktop_dir, options.cache_dir):
		if not os.path.isdir(path):
			print "%s is not a valid directory" % path
			sys.exit(1)
	print "Caching application data..."
	try:
		generate_menu_cache(options.desktop_dir, options.cache_dir)
		print "Generating mime/codec maps..."
		generate_mime_map(options.desktop_dir, options.cache_dir)
	except IOError:
		print "You must run this program with administrator privileges."\
				"(eg. sudo update-app-instal)"
