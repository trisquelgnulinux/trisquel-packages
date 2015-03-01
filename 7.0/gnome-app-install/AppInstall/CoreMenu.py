# (c) 2005-2007 Canonical - GPL
# (c) 2006-2007 Sebastian Heinlein
#
# Authors:
#  Michael Vogt
#  Sebastian Heinlein
#

import xdg.Menu
import sys
import os
import cPickle
import glob
from Util import *

class MenuItem(object):
    " base class for a object in the menu "
    def __init__(self, name, iconname="applications-other"):
        # the name that is displayed
        self.name = name
        # the icon that is displayed
        self.iconname = iconname
        self.icontheme = None
    def __repr__(self):
        return "MenuItem: %s" % self.name

class Category(MenuItem):
    """ represents a category """
    def __init__(self, parent, name, iconname="applications-other"):
        MenuItem.__init__(self, name, iconname)


class Application(MenuItem):
    """ this class represents a application """
    def __init__(self, name, iconname="applications-other"):
        MenuItem.__init__(self, name, iconname)
        # the apt-pkg name that belongs to the app
        self.pkgname = None
        # the desktop file comment
        self.comment = ""
        # mime type
        self.mime = None
        # exec
        self.execCmd = None
        # needsTerminal
        self.needsTerminal = False
        # component the package is in (main, universe)
        self.component = None
        # channel the pacakge is in (e.g. skype)
        self.channel = None
        # Name of the independent software vendor
        self.isv = None
        # states
        self.popcon = 1            # the raw popcon data
        self.rank = 1              # used by the ranking algo
        self.onTop = False         # show always on top (regardless of rank/name)
        # licence and support
        self.free = False
        self.licenseUri = None
        self.supported = False
        self.thirdparty = False
        self.architectures = []
        # textual menu path
        self.menupath = ""
        # install status
        self.toInstall = None

class CoreApplicationMenu(object):
    """This class provides basic menu handling that is required to
       initialize the app-install cache"""

    debug = 0

    def __init__(self, datadir):
        self.menudir = datadir+"/desktop"
        # a set of seen desktop entries
        self.desktopEntriesSeen = set()
        # a dictonary that provides a mapping from a pkg to the
        # application names it provides
        self.pkg_to_app = {}
        # cache
        self.pickle = {}
	self.popcon_max = 10
        
    def createMenuCache(self, targetdir, fname="menu.p"):
        self.desktopEntriesSeen.clear()
        self.pkg_to_app.clear()
        for mpath in glob.glob(os.path.join(self.menudir, "*.menu")):
            menu = xdg.Menu.parse(mpath)
            self._populateFromEntry(menu)
        cPickle.dump(self.pickle, open('%s/%s' % (targetdir,fname),'w'), 2)

    def loadMenuCache(self, cpath):
        " load a menu cache from the given path"
        # pickle loading (even with cold cache) takes just 0,5s on my
        # system - as seen by "with ExecutionTime("pickle load"): )
        try:
            self.pickle = cPickle.load(open(cpath))
            return True
        except Exception, e:
            print "Failed to load the pickle cache: '%s'" % e
        return False

    def _populateFromEntry(self, node, parent=None, progress=None):
        # for some reason xdg hiddes some entries, but we don't like that
        for entry in node.getEntries(hidden=True):
            self._dbg(2, "entry: %s" % (entry))
            if isinstance(entry, xdg.Menu.Menu):
                # we found a toplevel menu
                name = xmlescape(entry.getName())
                self._dbg(1, "we have a sub-menu %s " % name)
                item = Category(self, name, entry.getIcon())
                #print "adding: %s" % name
                self.pickle[item] = []
                self._populateFromEntry(entry, item,  progress=progress)
            elif isinstance(entry, xdg.Menu.MenuEntry):
                # more debug output
                #self._dbg(3, node.getPath() + "/\t" + entry.DesktopFileID + "\t" + entry.DesktopEntry.getFileName())
                # we found a application
                name = xmlescape(entry.DesktopEntry.getName())
                #self._dbg(1, "we have a application %s (%s) " % (name,entry.DesktopFileID))
                if name and entry.DesktopEntry.hasKey("X-AppInstall-Package"):
                    self._dbg(2,"parent is %s" % parent.name)

                    # check for duplicates, caused by e.g. scribus that has:
                    #   Categories=Application;Graphics;Qt;Office;
                    # so it appears in Graphics and Office
                    if entry.DesktopFileID in self.desktopEntriesSeen:
                        #print "already seen %s (%s)" % (name, entry)
                        continue
                    self.desktopEntriesSeen.add(entry.DesktopFileID)

                    item = Application(name)
                    # save the desktop entry to get the translations back later
                    item.desktop_entry = entry.DesktopEntry
                    pkgname = entry.DesktopEntry.get("X-AppInstall-Package")
                    item.pkgname = pkgname
                    # figure component and support status
                    item.component = entry.DesktopEntry.get("X-AppInstall-Section")
                    supported =  entry.DesktopEntry.get("X-AppInstall-Supported")
                    if supported != "":
                        item.supported = bool(supported)
                    else:
                        if item.component == "main" or \
                               item.component == "restricted":
                            item.supported = True
                    # check for free software
                    if item.component == "main" or item.component == "universe":
                        item.free = True
                    else:
                        item.free = False
                    # check for third party apps
                    item.channel = entry.DesktopEntry.get("X-AppInstall-Channel")
                    item.isv = entry.DesktopEntry.get("X-AppInstall-ISV")
                    thirdparty =  entry.DesktopEntry.get("X-AppInstall-Proprietary")
                    if thirdparty != "":
                        item.thirdparty = bool(thirdparty)
                        item.licenseUri = entry.DesktopEntry.get("X-AppInstall-LicenseUri")
                    # Supported architectures
                    archs = entry.DesktopEntry.get("X-AppInstall-Architectures", list=True)
                    if archs:
                        item.architectures.extend(archs)
                    # save replaces (e.g. totem-gstreamer replaces totem-xine)
                    replaces = entry.DesktopEntry.get("X-AppInstall-Replaces", list=True)
                    if replaces:
                        item.replaces = replaces
                    # Icon
                    item.iconname = entry.DesktopEntry.get("X-AppInstall-Icon", "") or entry.DesktopEntry.getIcon() or "applications-other"

                    if item.iconname.endswith(".png") or item.iconname.endswith(".xpm") or item.iconname.endswith(".svg"):
                    	item.iconname = item.iconname[:-4]
                    item.comment = entry.DesktopEntry.getComment()
                    item.keywords = entry.DesktopEntry.get('Keywords', list=True)
                    item.keywords.extend(entry.DesktopEntry.get('X-AppInstall-Keywords', list=True))
                    item.mime = entry.DesktopEntry.get('MimeType', list=True)
                    item.codecs = entry.DesktopEntry.get("X-AppInstall-Codecs").split(';')
                    item.patentBadness = entry.DesktopEntry.get("X-AppInstall-PatentBadness", type='boolean')
                    item.onTop = entry.DesktopEntry.get("X-AppInstall-AlwaysOnTop", type='boolean')
                    
                    # popcon data
                    popcon_str = entry.DesktopEntry.get("X-AppInstall-Popcon")
                    if popcon_str != "":
                        popcon = int(popcon_str)
                        item.popcon = popcon
                        if popcon > self.popcon_max:
                            self.popcon_max = popcon

                    item.execCmd = entry.DesktopEntry.getExec()
                    item.needsTerminal = entry.DesktopEntry.getTerminal()
                    # we map "Settings" to "Other" in the g-a-i GUI but 
                    # not in the real gnome-menu. so do not display a
                    # menu path here (FIXME: guess it from the category)
                    if not "Settings" in entry.DesktopEntry.getCategories():
                        item.menupath = [_("Applications"),parent.name]
                    else:
                        item.menupath = None
                    self.pickle[parent].append(item)
                elif name:
                    try:
                        print "Skipped %s: not associated with a package" % entry
                    except UnicodeEncodeError:
                        pass
                else:
                    try:
                        print "Skipped %s: does not include a menu name" % entry
                    except UnicodeEncodeError:
                        pass
 
            elif isinstance(entry, xdg.Menu.Header):
                print "got header"

    def _dbg(self, level, msg):
        """Write debugging output to sys.stderr."""
        if level <= self.debug:
            print >> sys.stderr, msg



