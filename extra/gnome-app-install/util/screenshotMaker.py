#!/usr/bin/python

import os
import os.path
import sys
import string
import time
import optparse
import subprocess
import copy
import tempfile
import apt
import glob

TIMEOUT=10

# FIXME:
# * add timeout 
# blacklist: orca, python2.5
#

def check_apps():
    l = ["/usr/bin/apt-get",
         "/usr/bin/convert",
         "/usr/bin/xvfb-run",
         "/usr/bin/xwd",
         ]
    for prog in l:
        if not os.path.exists(prog):
            print "Missing: %s" % prog
            return False
    return True

def take_screenshot(execCmd, outfile):
    p = subprocess.Popen(["xvfb-run",
                          "--server-args= -screen 0 1024x768x24",
                          "-f",os.path.expanduser("~/.Xauthority"),
                          "-w","5",
                            execCmd])
    # wait for the app to startup
    time.sleep(TIMEOUT)
    tmp = tempfile.NamedTemporaryFile()
    env = copy.copy(os.environ)
    env["DISPLAY"] = ":99"
    ret = subprocess.call(["xsetroot", "-solid", "red"], env=env)
    ret = subprocess.Popen(["gnome-settings-daemon"], env=env)
    time.sleep(5)
    ret = subprocess.call(["xwd", "-root", "-out", tmp.name], env=env)
    ret = subprocess.call(["convert", tmp.name, "-trim", outfile])
    time.sleep(1)
    ret = subprocess.call(["killall","Xvfb"])
    p.wait()
    return True

def process_dir(d):
    res = True
    for f in glob.glob(d+"/*.desktop"):
        print "Processing file: ",f
        res &= process_desktop_file(f)
    return res

def process_desktop_file(f):
    res = False
    execCmd = None
    package = None

    if not os.path.exists(f):
        return False

    for line in map(string.strip, open(f).readlines()):
        if line.startswith("X-AppInstall-Package="):
            package = line.split("=")[1]
        if line.startswith("Exec="):
            execCmd = line.split("=")[1]
            if (execCmd == "gksu" or
                execCmd == "gksudo"):
                print "%s needs gksu/gksudo" % f
                return False
            if " " in execCmd:
                execCmd = execCmd.split()[0]
    if package is None or execCmd is None:
        print "No package or exec line found?!? %s" % f
        return False
    outfile = "screenshots/%s.png" % os.path.basename(f)
    if cache.has_key(package) and cache[package].isInstalled:
        res = take_screenshot(execCmd, outfile)
        return res
    return False
    # FIXME:
    # install the package
    # res = take_screenshot(execCmd, outfile)
    # autoremove the package again
    # return res

if __name__ == "__main__":

    # kill old Xvfbs
    subprocess.call(["killall","Xvfb"])

    cache = apt.Cache()

    parser = optparse.OptionParser()
    parser.add_option("-v", "--verbose", dest="verbose",
                      action="store_true", default="False",
                      help="be verbose")
    parser.add_option("-d", "--direcroty", dest="dir",
                      default=None,
                      help="directory for the menu-data")
    parser.add_option("-f", "--file", dest="file",
                      default=None,
                      help="menu-data desktop file")
    (options, args) = parser.parse_args()

    if options.dir == None and options.file == None: 
        print "need a menu-data file (-f) or directory (-d option) "
        sys.exit(1)

    if not check_apps():
        sys.exit(1)

    if options.dir:
        process_dir(options.dir)
    if options.file:
        process_desktop_file(options.file)
