#!/usr/bin/env python
#
# print the popcon data as a graph with x = pkgnr, y=popcon-value
#

from optparse import OptionParser
from heapq import heappush, heappop, nlargest
import glob
import sys

sys.path.insert(0, "../")
from AppInstall.Cache import MyCache  

def gatherPopconData(menudir):
    popcon = {}
    for dentry in glob.glob("%s/*.desktop" % menudir):
        pkgname = None
        pop = None
        for line in open(dentry):
            if line.startswith("X-AppInstall-Package"):
                pkgname = line.strip().split("=")[1]
            elif line.startswith("X-AppInstall-Popcon="):
                pop = int(line.strip().split("=")[1])
            if pkgname != None and pop != None:
                popcon[pkgname] = pop
    return popcon

def pkgDependsOn(cache, pkgname, depends_name, seen):
    #print "pkgDependsOn(): ",pkgname,depends_name
    if not cache.has_key(pkgname):
        return False
    pkg = cache[pkgname]
    candver = cache._depcache.GetCandidateVer(pkg._pkg)
    if candver == None:
        return False
    dependslist = candver.DependsList
    for dep in dependslist.keys():
        if dep == "Depends" or dep == "PreDepends" or dep == "Recommends":
            # get the list of each dependency object
            for depVerList in dependslist[dep]:
                for z in depVerList:
                    # get all TargetVersions of
                    # the dependency object
                    for tpkg in z.AllTargets():
                        if tpkg.ParentPkg.Name in seen:
                            continue
                        if depends_name == tpkg.ParentPkg.Name:
                            return True
                        seen.add(tpkg.ParentPkg.Name)
                        if pkgDependsOn(cache, tpkg.ParentPkg.Name, 
                                        depends_name, seen):
                            return True
    return False

def dependency_of_meta(pkg):
    for meta in ["ubuntu-desktop","ubuntu-standard","ubuntu-minimal",
                 "kubuntu-desktop"]:
        if (pkgDependsOn(cache, meta,pkg, set())):
            return True
    return False

def analyze(popcon, cache, num):
    heap = []
    for pkg in popcon:
        heappush(heap, (popcon[pkg], pkg))
    # hm, nlargest is not enough here because we also 
    # do filtering
    #largest = nlargest(10, heap)
    i = 0
    for (score, pkg) in sorted(heap, reverse=True):
        if dependency_of_meta(pkg):
            continue
        print score, pkg
        i+=1
        if i > num:
            break

if __name__ == "__main__":
    print "analyze what packages are most popular but not part of the "
    print "default install"
    print ""
    # FIXME: to fix this warning the pkg needs its own sources.list
    #        and cache.update()
    print "WARNING: the data filter will be done against the "
    print "meta-packages that are in the sources.list in *this* "
    print "system."

    parser = OptionParser()
    parser.add_option("-d", "--direcroty", dest="dir",
                      default="/usr/share/app-install/desktop",
                      help="directory for the menu-data")
    parser.add_option("-n", "--number", dest="output_num",
                      default=20,
                      help="number pkgs to output")
    (options, args) = parser.parse_args()

    # get a cache
    cache = MyCache()
    popcon = gatherPopconData(options.dir)
    analyze(popcon,cache, options.output_num)
