#!/usr/bin/env python
#
# print the popcon data as a graph with x = pkgnr, y=popcon-value
#

from optparse import OptionParser
import glob
import xdg
import os
import os.path
import apt

from AppInstall.CoreMenu import CoreApplicationMenu

from xml.sax.saxutils import unescape

if __name__ == "__main__":
    parser = OptionParser()
    parser.add_option("-s", "--srcdir", dest="srcdir",
                      default="/usr/share/app-install/desktop/",
                      help="directory for the menu-data")
    parser.add_option("-d", "--destdir", dest="destdir",
                      default="output",
                      help="dir for the output")
    (options, args) = parser.parse_args()

    # get a cache
    cache = apt.Cache()

    # read menu
    menu = CoreApplicationMenu(options.srcdir)
    root = xdg.Menu.parse(os.path.join(options.srcdir, "applications.menu"))
    menu._populateFromEntry(root)

    # output per section
    index_file = open(os.path.join(options.destdir,"sections.txt"),"w")
    sections = menu.pickle.keys()
    sections.sort()
    for section in sections:
        name = unescape(section.name)
        index_file.write("%s\n" % name)
        section_file = open(os.path.join(options.destdir,name+".txt"),"w")
        for app in menu.pickle[section]:
            if not cache.has_key(app.pkgname):
                print "ERROR: can't find '%s' in apt cache" % app.pkgname
                continue
            section_file.write("%s (%s) %s %s\n\n" % (
                app.name.encode('utf-8'),
                app.pkgname, cache[app.pkgname].candidateVersion,
                cache[app.pkgname].description.encode('utf-8')) )
                               
