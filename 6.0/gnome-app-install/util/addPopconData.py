#!/usr/bin/env python
# (c) 2005-2007 Canonical, GPL
# Authors:
#  Michael Vogt


import os
import sys
import glob
import urllib
from optparse import OptionParser


def downloadPopcon(uri, destfile):
    print "Downloading popcon data"
    res = urllib.urlretrieve(uri, destfile)
    #print res


def extractPopconData(filename):
    res = {}
    for line in open(filename):
        if line.startswith("#"):
            continue
        # we split until we reach the "------" line where we stop
        try:
            (rank, name, inst, vote, old, recent, files, maint) = line.split(None,7)
            # mvo: we use inst as the indicator (because we do not have enough
            #      data to use vote
            res[name] = vote
        except ValueError:
            break
    return res

def mergePopconData(menudir, popcon_data):
    for dentry in glob.glob("%s/*.desktop" % menudir):
        pkgname = None
        for line in open(dentry):
            if line.startswith("X-AppInstall-Package"):
                pkgname = line.strip().split("=")[1]
                if not popcon_data.has_key(pkgname):
                    print "WARNING: no popcon data for '%s'" % pkgname
                    pkgname = None
        if not pkgname is None:
            print "Updating '%s' with popcon data for '%s'" % (dentry,pkgname)
            content = []
            for line in open(dentry):
                if not line.startswith("X-AppInstall-Popcon="):
                    content.append(line)
                if line.startswith("X-AppInstall-Package"):
                    content.append("X-AppInstall-Popcon=%s\n" % popcon_data[pkgname])
            if not content[-1].endswith("\n"):
                content[-1] += "\n"
            f = open(dentry,"w")
            f.write("".join(content))
            f.close()

if __name__ == "__main__":
    parser = OptionParser()
    parser.add_option("-v", "--verbose", dest="verbose",
                      action="store_true", default="False",
                      help="be verbose")
    parser.add_option("-p", "--popcon-uri", dest="popcon_uri",
                      default="http://popcon.ubuntu.com/by_vote",
                      help="download location for the popcon data")
    parser.add_option("-d", "--direcroty", dest="dir",
                      default="../menu-data",
                      help="directory for the menu-data")
    (options, args) = parser.parse_args()

    # filename
    popcon = "popcon_data.txt"
    # download it
    downloadPopcon(options.popcon_uri, popcon)

    # extract the data, popcon data is a dictionary with
    # (pkgname -> value) where big values are better
    popcon_data = extractPopconData(popcon)

    # merge popcon data
    mergePopconData(options.dir, popcon_data)
    

    
