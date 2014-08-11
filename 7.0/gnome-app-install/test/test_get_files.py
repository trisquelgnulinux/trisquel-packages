#!/usr/bin/python

import os
import sys
import subprocess
sys.path.append('../util/')

from getMenuData import *
from addPopconData import *

if __name__ == "__main__":

    subprocess.call(["./get_debs.sh"])

    # test for correct desktop file writing
    processDeb(os.getcwd()+"/brasero_0.5.2-0ubuntu1_i386.deb",
               pkgname="brasero",
               section="universe",
               outputdir="result/")
    # test correct popcon-data merging
    popcon = "popcon_data.txt"
    downloadPopcon("http://popcon.ubuntu.com/by_vote", popcon)
    popcon_data = extractPopconData(popcon)
    mergePopconData("result/", popcon_data)

    # test if everything X-AppInstall releated is in the [desktop entry]
    for line in open("result/brasero.desktop"):
        if line.startswith("["):
            desktop_section = line.strip()
        if line.startswith("X-AppInstall"):
            assert(desktop_section == "[Desktop Entry]")
    print "done"

    
