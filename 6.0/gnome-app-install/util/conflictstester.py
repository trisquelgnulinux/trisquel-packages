#!/usr/bin/python

import glob
import apt

pkgs = set()
for f in glob.glob("../menu-data/*.desktop"):
    for line in open(f):
        if line.startswith("X-AppInstall-Package="):
            pkgs.add(line.split("=")[1].strip())

#print pkgs
cache = apt.Cache()
for pkgname in pkgs:
    if not cache.has_key(pkgname):
        print "Warning: can't install '%s'" % pkgname
        continue
    current = set([p.name for p in cache if p.markedInstall])
    pkg = cache[pkgname]
    try:
        pkg.markInstall()
    except SystemError, e:
        print "can't install: ", pkg.name
    new = set([p.name for p in cache if p.markedInstall])
    #if not pkg.markedInstall or len(new) < len(current):
    if not (pkg.isInstalled or pkg.markedInstall):
        print "Can't install: %s" % pkg.name
    if len(current-new) > 0:
        print "Installing '%s' caused removals %s" % (pkg.name, current - new)
