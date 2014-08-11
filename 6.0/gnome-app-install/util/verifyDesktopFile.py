#! /usr/bin/env python
#
# (c) 2005-2007 Canonical, GPL
# Authors:
#  Michael Vogt

import apt
import apt_pkg
import glob
import string
import sys
import optparse
import os

def check_icon(iconname, dir):
    if "/" in iconname:
        iconname = iconname.replace("/","_")
    for ext in ["", ".png", ".xpm"]:
        icon = dir +"/icons/" + iconname + ext
        if os.path.exists(icon):
            break
    else:
        print "WARNING: Icon: '%s' not found" % iconname

def verifyDir(dir):
    # dir
    seen = {}

    cache = apt.Cache(apt.progress.OpTextProgress())
    group = apt_pkg.GetPkgActionGroup(cache._depcache)
    for f in glob.glob(options.dir+"/*.desktop"):
        pkg_found = False
        comp = None
        pkg = None
        for line in open(f).readlines():
            if line.startswith("Icon="):
                icon = string.strip(line).split("=")[1]
                check_icon(icon, dir)
            if line.startswith("X-AppInstall-Section"):
                comp = string.strip(line).split("=")[1]
            if line.startswith("X-AppInstall-Package"):
                pkg_found = True
                pkg = string.strip(line).split("=")[1]
                if not seen.has_key(pkg):
                    seen[pkg] = f
                else:
                    pass
                    #print "Warning: pkg '%s' seen before in %s (working on %s)" % (pkg, seen[pkg], f)
                if "-data" in pkg or "-common" in pkg:
                    print "Warning: suspicious pkg name: %s in %s" % (pkg,f)
                if options.verbose == True:
                    print "Checking: '%s'" % pkg

                # is it available at all
                if not cache.has_key(pkg):
                    print "Error: '%s' is not avaialble in the cache (%s)" % (pkg,f)
                    continue

                # can we install it
                try:
                    cache[pkg].markInstall(autoFix=True)
                except SystemError, (strerror):
                    if options.verbose == True:
                        print "apt error for pkg '%s': '%s'" % (pkg, strerror)
                if cache._depcache.BrokenCount > 0:
                    print "Warning: installing '%s' results in broken cache" % pkg
                elif cache._depcache.DelCount > 0:
                    print "Warning: installing '%s' results in removals" % pkg

                # clean the cache
		cache._depcache.Init()
                assert cache._depcache.BrokenCount == 0
                assert cache._depcache.DelCount == 0
        # has the desktop file the needed line?
        if not pkg_found:
            print "Error: no X-AppInstall-Package found in '%s'" % f
        if not "Categories=" in open(f).read():
	    print "Error: no Categories found in '%s'" % f
        #print "%s (%s %s)" % (pkg, comp, cache[pkg].section)
        if comp != None:
            if cache.has_key(pkg):
                pkg_comp = string.split(cache[pkg].section,"/")
                if len(pkg_comp) == 1:
                    pkg_comp = "main"
                else:
                    pkg_comp = pkg_comp[0]
                if pkg_comp != comp:
                    print "Error: '%s' is in wrong component (is: '%s', should: '%s')" % (pkg, comp, pkg_comp)
        else:
            print "Error: '%s' has no component '%s'" % (f, comp)


def verifyFeaturedFile(file):
    cache = apt.Cache(apt.progress.OpTextProgress())
    for line in open(file):
        pkg = string.strip(line)
        if not cache.has_key(pkg):
            print "ERROR: can't find '%s' in cache" % pkg
            continue
        if "universe" in cache[pkg].section:
            print "WARNING: '%s' is a universe package" % pkg

if __name__ == "__main__":
    parser = optparse.OptionParser()
    parser.add_option("-v", "--verbose", dest="verbose",
                      action="store_true", default="False",
                      help="be verbose")
    parser.add_option("-d", "--direcroty", dest="dir",
                      default=None,
                      help="directory for the menu-data")
    parser.add_option("-f","--featured", dest="featured",
                      default=None,
                      help="featrued.txt file that should be checked")
    (options, args) = parser.parse_args()

    if options.dir == None and options.featured == None:
        print "need a menu-data directory (-d option) or featured file (-f)"
        sys.exit(1)

    if options.dir != None:
        verifyDir(options.dir)

    if options.featured != None:
        verifyFeaturedFile(options.featured)
