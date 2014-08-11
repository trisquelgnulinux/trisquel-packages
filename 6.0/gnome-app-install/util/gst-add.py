#!/usr/bin/python

import warnings
warnings.filterwarnings("ignore", "apt API not stable yet", FutureWarning)
import apt
import string
import sys

cache = apt.Cache()

for fname in sys.argv[1:]:
    
    # get the packagename
    content = []
    for line in open(fname):
        content.append(line)
        if line.startswith("X-AppInstall-Package"):
            pkgname = line.split("=")[1].strip()

    # calc the gst elements
    pkg = cache[pkgname]
    if not pkg.candidateRecord:
        continue
    s = str(pkg.candidateRecord)
    encoder=[]
    decoder=[]
    element=[]
    urisource=[]
    version=""
    for line in s.split("\n"):
        # skip lines that are not key/value
        if line == "" or line.startswith(" ") or line.startswith("\t"):
            continue
        line = line.rstrip()
        # split string
        (key, value) = string.split(line, ":", maxsplit=1)
        if key == "Gstreamer-Decoders":
            decoder = value.split(";")
        elif key == "Gstreamer-Elements":
            element = value.split(",")
        elif key == "Gstreamer-Encoders":
            encoder = value.split(";")
        elif key == "Gstreamer-Uri-Sources":
            urisource = value.split(",")
        elif key == "Gstreamer-Version":
            version = value.strip()
    # skip if we don't have a version
    if not version:
        print "WARNING: no g-s-t data for %s" % pkgname
        continue
    # gen output string
    s=""
    for elm in encoder:
        s+="%s:encoder-%s;" % (version, elm.strip())
    for elm in decoder:
        s+="%s:decoder-%s;" % (version, elm.strip())
    for elm in element:
        s+="%s:element-%s;" % (version, elm.strip())
    for elm in urisource:
        s+="%s:urisource-%s;" % (version, elm.strip())
    
    # write it back
    out = open(fname,"w")
    for line in content:
        if line.startswith("X-AppInstall-Codecs"):
            line="X-AppInstall-Codecs=%s\n" % s
        out.write(line)
    
