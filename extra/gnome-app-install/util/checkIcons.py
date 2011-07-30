#!/usr/bin/env python2.4

import sys
import string
import os

basedir = sys.argv[1]


# go over the icon dir
icons_in_icon_dir = set()
for file in os.listdir(basedir+"/icons"):
    if file.endswith(".png") or file.endswith(".xpm") or file.endswith(".svg"):
        icons_in_icon_dir.add(file)

# go over the desktop files
icons_in_desktop_files = set()
for file in os.listdir(basedir):
    if not file.endswith(".desktop"):
        continue
    for line in open(basedir+"/"+file).readlines():
      line = string.strip(line)
      if line.startswith("Icon="):
        iconName = line[line.index("=")+1:]
        if os.path.split(iconName)[0] != '':
            iconName = iconName.replace("/", "_")
        icons_in_desktop_files.add(iconName)


#print "Icons in icon dir but not refered in desktop files:"
used_icons = set()
for icon in icons_in_desktop_files:
    if icon in icons_in_icon_dir:
        used_icons.add(icon)
    elif icon+".png" in icons_in_icon_dir:
        used_icons.add(icon+".png")
    elif icon+".xpm" in icons_in_icon_dir:
        used_icons.add(icon+".xpm")
    elif icon+".svg" in icons_in_icon_dir:
        used_icons.add(icon+".svg")
for elm in (icons_in_icon_dir - used_icons):
    print elm

