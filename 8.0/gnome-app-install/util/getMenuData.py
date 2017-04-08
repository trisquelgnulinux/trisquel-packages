#! /usr/bin/env python
#
# (c) 2005-2007 Canonical, GPL
# Authors:
#  Michael Vogt
#
#
# FIXME: strip "TryExec" from the extracted menu files (and noDisplay)
#        
# TODO:
# - emacs21 ships it's icon in emacs-data, deal with this
# - some stuff needs to be blacklisted (e.g. gnome-about)
# - lots of packages have there desktop file in "-data", "-comon" (e.g. anjuta)
# - lots of packages have multiple desktop files for the same application
#   abiword, abiword-gnome, abiword-gtk

print """
#
# DEPRECATED in favor of the archive-crawler
# https://code.edge.launchpad.net/~mvo/archive-crawler/mvo
#
"""

import os
import tarfile
import sys
import apt
import apt_pkg
import apt_inst
#import xdg.Menu
import os.path
import re
import tempfile
import subprocess
import string
import shutil
import urllib
import logging
import fnmatch
import glob


# these globals here suck
tmpdir =  tempfile.mkdtemp()
blacklist = "blacklist.cfg"
blacklist_desktop = "blacklist_desktop.cfg"
renamecfg = "rename.cfg"
annotatecfg = "annotate.cfg"
codecs_foradditional = { }

# packages we have already seen 
pkgs_seen = set()

# pkgs that shouldn't be written (e.g. gnome-about)
pkgs_blacklisted = set()

# desktop files that are not wanted
desktop_blacklist = set()

# a mapping to transform certain detections to a new name
# (e.g.abiword-plugins -> abiword-gnome)
pkgs_transform = {}

# a mapping from desktop file to a list of free annotations that will
# be added to the desktop file (useful for e.g. X-AppInstall-Replaces
desktop_annotate = {}

# a dictionary with "$arch" -> set() of packages mapping
# this makes it easy to analyse what packages are only
# available in certain arches
pkgs_per_arch = {}

# pkg to desktop file mapping (this assumes that for a packagename
# is uniq across architecutures)
pkgs_to_desktop = {}

# all supported arches
SUPPORTED_ARCHES = ("i386","amd64","powerpc")
#SUPPORTED_ARCHES = ("i386")

def getMemberFromAr(arFile, member):
  """ helper to extract the files """
  dataPath = tmpdir
  olddir = os.getcwd()
  os.chdir(dataPath)
  command = ["ar","x",arFile, member]
  subprocess.call(command)
  memberpath = dataPath+"/"+member
  os.chdir(olddir)
  if os.path.exists(memberpath):
    return memberpath
  else:
    return None


def extract_icon(tarfile, iconName, newIconName):
  extractName = iconName
  if iconName.startswith('/'):
    extractName = iconName[1:]
  try:
    iconFile = tarfile.extractfile(extractName)
    outicon = open(newIconName, "w")
    outicon.write(iconFile.read())
    outicon.close()
    iconFile.close()
    logging.debug("wrote iconfile '%s' (from '%s') " % (os.path.basename(outicon.name),iconName))
    return True
  except Exception,e:
    # we may sometimes get very confusing errors from tarfile here
    # (like 'filename None not found' from xmms) - this usually means something is strange in the
    # tarball eg. xmms.xpm is a symlink to the (non-existant) xmms_mini.xpm
    logging.error("ERROR: Icon '%s' for could not be obtained: %s " % (iconName,e))
  return False

def search_icon(tarfile, iconName, outputdir):
  if iconName == None:
    logging.warning("search_icon() called with no icon name")
    return (False, None)

  # a iconName can be a single name or a full path
  # if it is a single name, look into a icon-theme path (usr/share/icons/hicolor) and then into usr/share/pixmaps
  # if it is a full path just look for this

  # this is the "full-path" case
  # FIXME: there are (some) icons that are not full pathes like "/usr/.../"
  #        but "zapping/zapping.png"
  if "/" in iconName:
    newIconName = iconName.replace("/", "_")
    res = extract_icon(tarfile, iconName, os.path.join(outputdir,"icons",newIconName))
    return (res, newIconName)
  
  # this is the "get-it-from-a-icontheme" case, look into icon-theme hicolor and usr/share/pixmaps

  # search path (ordered by importance)
  search_dirs = ["usr/share/icons/hicolor/48x48",
                 "usr/share/icons/hicolor/64x64",
                 "usr/share/icons/hicolor/128x128",
                 "usr/share/pixmaps",
                 "usr/share/icons/hicolor/32x32",
                 "usr/share/icons/hicolor/22x22",
                 "usr/share/icons/hicolor/16x16",
		 "usr/share/icons"
                 ]
  # extensions (ordered by importance)
  pixmaps_ext = ["", ".png",".xpm",".svg"]

  for d in search_dirs:
    for name in tarfile.getnames():
      if d in name:
        for ext in pixmaps_ext:
          if name.endswith(iconName+ext):
            res = extract_icon(tarfile, name, os.path.join(outputdir,"icons", os.path.basename(name)))
            return (res, None)
  logging.warning("no icon: '%s' could be found" % iconName)
  return (False, None)


def tarfile_extract_orlog(dataFile, path):
  try:
    file = dataFile.extractfile(path)
  except KeyError, e:
    logging.error("Failed to extract '%s' from '%s' (%s)" %
                     (path, dataFile.name, e))
    return None
  return file

def writeMetaData(outfile, pkgname, section, codecs):
  outfile.write("X-AppInstall-Package=%s\n" % pkgname)
  outfile.write("X-AppInstall-Section=%s\n" % section)
  if codecs:
    outfile.write("X-AppInstall-Codecs=%s\n" % ';'.join(codecs))
  outfile.write("\n")
  return True

def getFiles(dataPath, pkgname, section, outputdir):
  """ actually extract the files from a data.tar.gz of a package """
  try:
    os.makedirs(os.path.join(outputdir, "icons"))
  except OSError:
    pass

  try:
    dataFile = tarfile.open(dataPath)
  except:
    logging.error("Couldn't open tarball. Package: '%s'" % dataPath)
    return

  desktopPaths = []
  
  # get the available desktop files
  try:
    for filename in dataFile.getnames():
      if (filename.endswith(".desktop") and 
         not os.path.basename(filename) in desktop_blacklist and 
          "usr/share/applications" in filename):
        desktopPaths.append(filename)
  except:
    logging.error("Choked on tarball. Package: '%s'" % package)
    return # too many bad debs. take this line out if you fix that

  # and look for any codec support list
  codecs = set()
  for filename in dataFile.getnames():
    if not (fnmatch.fnmatch(filename, 'usr/share/gstreamer-*/plugin-info/*.supported') or fnmatch.fnmatch(filename, './usr/share/gstreamer-*/plugin-info/*.supported')): continue
    codecsfile = tarfile_extract_orlog(dataFile,filename);
    if not codecsfile:
      continue
    logging.debug("reading codec list file %s" % filename)
    for line in codecsfile.readlines():
      line = string.strip(line)
      if ';' in line:
        logging.warning("Codec string '%s' from '%s' in '%s' contains ';'" %
                        (line, filename, dataFile.name))
        continue
      codecs.add(line)

  # look at the desktop files
  for path in desktopPaths:
    desktopfile = tarfile_extract_orlog(dataFile, path)
    if not desktopfile: continue
    # new location for the desktopfile
    desktop = os.path.join(outputdir, os.path.basename(path))
    # extract the icon
    iconName = None
    newIconName = None
    for line in desktopfile.readlines():
      line = string.strip(line)
      if line.startswith("Icon="):
        iconName = line[line.index("=")+1:]
        logging.debug("Package '%s' needs icon '%s'" % (pkgname, iconName))
    (res, newIconName) = search_icon(dataFile, iconName, outputdir)

    # now check for supicious pkgnames (FIXME: make this not hardcoded)
    if "-common" in pkgname or "-data" in pkgname:
      logging.warning("'%s' looks wrong, trying to correct" % pkgname)
      pkg = cache[pkgname]
      parentpkg = pkgname[0:pkgname.rindex("-")]
      if cache.has_key(parentpkg):
        logging.warning("Corrected to '%s'" % parentpkg)
        pkgname = parentpkg

    # now write out the file
    arch = apt_pkg.Config.Find("APT::Architecture")
    logging.debug("Writing desktop file '%s' for arch '%s'" % (desktopfile.name, arch))
    outfile = open(desktop, "w")
    desktopfile.seek(0)
    written=False
    desktop_section = ""
    for line in desktopfile.readlines():
      if newIconName != None and line.startswith("Icon="):
        # Using the file extension is not themable
        if os.path.splitext(newIconName)[1] != "":
            line = "Icon=%s\n" % os.path.splitext(newIconName)[0]
        else:
            line = "Icon=%s\n" % newIconName
      if not line.endswith("\n"):
        line += "\n"
      # if a new section starts, write the metadata now
      if desktop_section == "[Desktop Entry]" and not written:
        writeMetaData(outfile, pkgname, section, codecs)
        written=True
      outfile.write(line)
      if line.startswith("["):
        desktop_section = line.strip()
    if not written:
      writeMetaData(outfile, pkgname, section, codecs)
      
    desktopfile_name = os.path.basename(desktopfile.name)
    if desktop_annotate.has_key(desktopfile_name):
      logging.info("adding annontate '%s' for '%s'" % (desktop_annotate[desktopfile_name], desktopfile_name))
      for a in desktop_annotate[desktopfile_name]:
        outfile.write("%s\n" % a.strip())
    outfile.close()
    if not pkgs_to_desktop.has_key(pkgname):
      pkgs_to_desktop[pkgname] = []
    pkgs_to_desktop[pkgname].append(os.path.basename(outfile.name))

    # close the desktop file
    desktopfile.close()

  if codecs:
    try: codecs_foradditional[pkgname] &= codecs
    except KeyError: codecs_foradditional[pkgname] = codecs

def processDeb(debPath, pkgname, section,
               outputdir=os.path.join(os.getcwd(), "menu-data")):
  """ extract the desktop file and the icons from a deb """
  logging.debug("processing: %s" % debPath)
  datafile = getMemberFromAr(debPath, "data.tar.gz")
  if datafile == None:
    logging.error("error geting data.tar.gz from %s" % debPath)
    return
  getFiles(datafile, pkgname, section, outputdir)
  os.remove(datafile)

def inspectDeb(filename):
  """ check if the deb is interessting for us (our arch etc) """
  #logging.debug("inspectDeb '%s'"% filename)
  m = re.match(".*/(.*)_(.*)_(.*).deb", filename)
  pkgname = m.group(1)
  ver = m.group(2)
  # fix the quoting
  ver = urllib.unquote(ver)
  pkgarch = m.group(3)
  
  # certain pkgs are blacklisted
  if pkgname in pkgs_blacklisted:
    logging.warning("skipping blacklisted pkg: '%s'" % pkgname)
    return
  if pkgs_transform.has_key(pkgname):
    logging.warning("transforming '%s' to '%s'" % (pkgname, pkgs_transform[pkgname]))
    pkgname = pkgs_transform[pkgname]

  # not for our arch
  if pkgarch != "all" and arch != pkgarch:
    #logging.debug("Skipping because of not-for-us arch '%s'" % pkgarch)
    return
    
  # check if the deb is in the current distro at all
  candVer = "xxx"
  if cache.has_key(pkgname):
    candVer = cache[pkgname].candidateVersion
    # strip the epoch
    if candVer and ":" in candVer:
      candVer = candVer.split(":")[1]
  if candVer != ver:
    #logging.debug("Skipping because '%s' it's not in our distro release"%pkgname)
    return

  # add it to the arch-table now, even if it might be known already
  pkgs_per_arch[pkgarch].add(pkgname)
  # we have seen this package already (probably for a different arch)    
  if pkgname in pkgs_seen:
    #logging.debug("Skipping because we have it in pkgs_seen")
    return
  
  # valid deb
  section = cache[pkgname].section
  if not "/" in section:
    component = "main"
  else:
    component = section[0:section.find("/")]
  #print "%s in: %s" % (filename, component)
  logging.debug("Found interessting deb '%s' in section '%s'" % (filename, component))

  # found somethat worth looking at
  processDeb(filename, pkgname, component)
  pkgs_seen.add(pkgname)

def dir_walk(cache, dirname, names):
  #print "Looking at: %s" % dirname
  #logging.debug("Entering dir: '%s' " % dirname)
  for filename in names:
    if filename.endswith(".deb"):
      inspectDeb(dirname+"/"+filename)



if __name__ == "__main__":

  logging.basicConfig(level=logging.DEBUG,
                      filename="menu-data-extract.log",
                      format='%(asctime)s %(levelname)s %(message)s',
                      filemode='w')

  try:
    pooldir = sys.argv[1]
  except:
    print "Usage: getMenuData.py pooldir"
    sys.exit()

  # run this once for each arch, it will skip packages already seen
  pkgs_per_arch["all"] = set()
    
  if os.path.exists(blacklist):
    logging.info("using blacklist: '%s'" % blacklist)
    for line in open(blacklist).readlines():
      line = line.strip()
      if line != "" and not line.startswith("#"):
        logging.debug("blacklisting: '%s'" % line.strip())
        pkgs_blacklisted.add(line.strip())

  if os.path.exists(blacklist_desktop):
    logging.info("using blacklist desktop: '%s'" % blacklist_desktop)
    for line in open(blacklist_desktop).readlines():
      line = line.strip()
      if line != "" and not line.startswith("#"):
        logging.debug("blacklisting (desktop file): '%s'" % line.strip())
        desktop_blacklist.add(line.strip())

  if os.path.exists(renamecfg):
    logging.info("using rename: '%s'" % renamecfg)
    for line in open(renamecfg).readlines():
      line = line.strip()
      if line != "" and not line.startswith("#"):
        (oldname,newname) = string.split(string.strip(line))
        logging.debug("renaming: %s -> %s" % (oldname,newname))
        pkgs_transform[oldname] = newname

  if os.path.exists(annotatecfg):
    logging.info("using annotates: '%s'" % annotatecfg)
    for line in open(annotatecfg):
      line = line.strip()
      if line != "" and not line.startswith("#"):
        (desktopfile,annotations_str) = string.split(line,":")
        annotations = annotations_str.split(",")
        logging.debug("annotations: '%s': %s" % (desktopfile,annotations))
        desktop_annotate[desktopfile] = annotations
    
  for arch in SUPPORTED_ARCHES:
    # fake a $arch machine
    # FIXME: we want arch-independent stuff in the long run
    #        e.g. for Mac-On-Linux (MoL)
    apt_pkg.Config.Set("APT::Architecture",arch)
    apt_pkg.Config.Set("Dir::state","./apt/")
    apt_pkg.Config.Set("Dir::Etc","./apt")

    # init the set for the given arch
    pkgs_per_arch[arch] = set()

    try:
      os.makedirs("apt/lists/partial")
    except OSError:
      pass

    logging.info("Starting extraction in %s for %s" % (pooldir,arch))
    cache = apt.Cache(apt.progress.OpTextProgress())
    try:
      prog = apt.progress.TextFetchProgress() 
    except:
      prog = apt.progress.FetchProgress()

    # update the cache
    cache.update(prog)
    cache.open(apt.progress.OpTextProgress())


    # now do the postmans walk!
    os.path.walk(pooldir, dir_walk, cache)

  # now analyze the result
  #logging.debug(pkgs_per_arch)
  #only_in_i386 = pkgs_per_arch["i386"] - (pkgs_per_arch["powerpc"]|pkgs_per_arch["amd64"])
  #logging.debug("only on i386: %s" % only_in_i386)
  #only_in_amd64 = pkgs_per_arch["amd64"] - (pkgs_per_arch["powerpc"]|pkgs_per_arch["i386"])
  #logging.debug("only on amd64: %s" % only_in_amd64)
  #only_in_powerpc = pkgs_per_arch["powerpc"] - (pkgs_per_arch["amd64"]|pkgs_per_arch["i386"])
  #logging.debug("only on powerpc: %s" % only_in_powerpc)

  # now add the architecture information
  arch_specific = set()
  for pkg in pkgs_seen:
    arches = []
    if not pkg in pkgs_per_arch["all"]:
      for arch in SUPPORTED_ARCHES:
        if not pkg in pkgs_per_arch[arch]:
          arch_specific.add(pkg)
        else:
          arches.append(arch)
          
    if pkg in arch_specific:
      str="X-AppInstall-Architectures=%s\n" % ",".join(arches)
      if not pkgs_to_desktop.has_key(pkg):
        logging.debug("Skipping arch-specific pkg '%s' with no desktop file" % pkg)
        continue
      for f in pkgs_to_desktop[pkg]:
        dfile = "menu-data/"+f
        if os.path.exists(dfile):
          logging.debug("adding arch-specifc information to %s (%s)" % (dfile,arches))
          open(dfile,"a").write(str)
        else:
          logging.error("can't find desktopfile for: %s (%s)" % (pkg,dfile))

  # edit the codec lists into the entries in menu-data-additional
  logging.debug("adding codecs: '%s'", codecs_foradditional)
  seen = set()
  for filename in glob.glob('menu-data-additional/*.desktop'):
    lines = []
    file = open(filename)
    pkgname = None
    for line in file:
      line = string.strip(line)
      if re.match("^X-AppInstall-Codecs\s*=", line): continue
      lines.append(line)
      m = re.match("^X-AppInstall-Package\s*=\s*(\S+)\s*$", line)
      if m: pkgname = m.group(1)
    file.close()
    if not pkgname:
      logging.warning("file '%s' doesn't specify an X-AppInstall-Package" %
                      filename)
      continue
    try:
      codecs = codecs_foradditional[pkgname]
    except KeyError:
      continue
    logging.debug("adding codec info to '%s' " % pkgname)
    lines.append("X-AppInstall-Codecs=%s" % ';'.join(codecs))
    seen.add(pkgname)
    new_file = open(filename+'.tmp', 'w');
    for line in lines: print >>new_file, line
    new_file.close()
    os.rename(filename+'.tmp', filename)

  missing = set(codecs_foradditional.keys())-seen
  if len(missing) > 0:
    logging.warning("Packages with codecs but no data in menu-data-additonal: %s" % missing)
      
  # be nice, clean-up
  if tmpdir != None and tmpdir != "":
    shutil.rmtree(tmpdir)
