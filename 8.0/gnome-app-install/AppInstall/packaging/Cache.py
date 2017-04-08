# (c) 2005-2007 Canonical - GPL
#
# Authors:
#  Michael Vogt

import warnings
warnings.filterwarnings("ignore", "apt API not stable yet", FutureWarning)
import apt
import os
import threading


class ThreadedCache(threading.Thread):
    def __init__(self, parent, progress):
        threading.Thread.__init__(self)
        self.parent = parent
        self.progress = progress
        self.cache = None
    def run(self):
        self.cache = MyCache(self.progress)
       

class MyCache(apt.Cache):
    def __init__(self, progress=None):
        apt.Cache.__init__(self, progress)
        # cache the arch we use
        pipe = os.popen("dpkg --print-architecture")
        self._arch = pipe.read().strip()
        del pipe
        #assert self._depcache.broken_count == 0
    
    def pkgDependsOn(self, pkgname, depends_name):
        """ check if a given pkg depends on a given dependencie """
        if not self.has_key(pkgname):
            return False
        pkg = self[pkgname]
        candver = self._depcache.get_candidate_ver(pkg._pkg)
	if candver == None:
		return False
	dependslist = candver.depends_list
	for dep in dependslist.keys():
            if dep == "Depends" or dep == "PreDepends" or dep == "Recommends":
                # get the list of each dependency object
                for depVerList in dependslist[dep]:
                    for z in depVerList:
                        # get all TargetVersions of
                        # the dependency object
                        for tpkg in z.all_targets():
                            if depends_name == tpkg.parent_pkg.name:
                                return True
        return False
    def clean(self):
        self._depcache.init()
        # FIXME: those assert may be a bit too strong,
        # we may just rebuild the cache if something is
        # wrong
        if self._depcache.broken_count > 0:
            print " ".join([pkg.name for pkg in self if self._depcache.is_now_broken(pkg._pkg)])
            # desperately try again to init the damm cache
            self._depcache.Init()
        if self._depcache.del_count > 0:
            print " ".join([pkg.name for pkg in self if pkg.marked_delete])
            # desperately try again to init the damm cache
            self._depcache.Init()
        # broken packages can happen (e.g. when java install is canceled)
        # ignore it
        #assert self._depcache.broken_count == 0
        assert self._depcache.del_count == 0

    def getArch(self):
        """ Return the cpu architecture of the system"""
        return self._arch
    def getDependantAutoDeps(self, to_rm):
        """ return the installed automatic dependencies for the selected set
            of packages that are going to be removed """
        auto_deps = set()
        for pkg in to_rm:
            self[pkg].mark_delete()
        for pkg in self:
            if not pkg.marked_delete and self._depcache.is_garbage(pkg._pkg):
                #print "%s is garbage" % pkg.name
                for rm_package in to_rm:
                    # check if pkg.name is a dependency of rm_package
                    if self.pkgDependsOn(rm_package, pkg.name):
                        print "%s is garbage and a dep of %s" % (pkg.name, rm_package)
                        auto_deps.add(pkg.name)
        #print auto_deps
        return auto_deps
    
