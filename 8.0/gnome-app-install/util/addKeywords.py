#!/usr/bin/env python
# (c) 2005-2007 Canonical, GPL
# Authors:
#  Michael Vogt


import os
import sys
import string
import glob
import urllib
from optparse import OptionParser

def extractKeywordsData(keywords_file):
    keywords_dict = {}
    for line in map(string.strip, open(keywords_file)):
        (pkgname, keywords) = line.split(":")
        keywords_dict[pkgname] = keywords
    return keywords_dict

def mergeKeywordsData(menudir, keyword_data):
    for dentry in glob.glob("%s/*.desktop" % menudir):
        pkgname = None
        for line in open(dentry):
            if line.startswith("X-AppInstall-Package"):
                pkgname = line.strip().split("=")[1]
                if not keyword_data.has_key(pkgname):
                    pkgname = None
        if not pkgname is None:
            print "Updating '%s' with keyword data for '%s'" % (dentry,pkgname)
            content = []
            for line in open(dentry):
                if not line.startswith("X-AppInstall-Keywords="):
                    content.append(line)
                if line.startswith("X-AppInstall-Package"):
                    content.append("X-AppInstall-Keywords=%s\n" % keyword_data[pkgname])
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
    parser.add_option("-d", "--direcroty", dest="dir",
                      default="./menu-data",
                      help="directory for the menu-data")
    (options, args) = parser.parse_args()

    # filename
    keywords_file = "keywords.def"

    # extract the data, keywords_data is a dictionary with
    # (pkgname -> value) 
    keywords_data = extractKeywordsData(keywords_file)

    # merge popcon data
    mergeKeywordsData(options.dir, keywords_data)
    

    
