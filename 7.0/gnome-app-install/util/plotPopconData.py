#!/usr/bin/env python
#
# print the popcon data as a graph with x = pkgnr, y=popcon-value
#

from optparse import OptionParser
import glob
from heapq import heappush, heappop
import gd
from math import log, log10, floor
  
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

def plotPopcon(popcon, outfile):
    log_basis = 10
    y_scale = 10
    popcon_max = max(popcon.values())
    size = (len(popcon), 5*y_scale)
    heap = []
    # get a sorted version
    for pkg in popcon:
        heappush(heap, (popcon[pkg], pkg))
    # now print the ranking
    ranks = { 1: 0,
              2: 0,
              3: 0,
              4: 0,
              5: 0,
              6: 0}
    while heap:
        (pop, pkg) = heappop(heap)
        rank = 0
        #rank = int((5 * pop / popcon_max))
        if pop > 0:
            rank = 5*log(pop,log_basis)/log(popcon_max, log_basis)
        ranks[int(rank)+1] += 1
    for i in ranks:
        print i,ranks[i]

    # allocate image data
    img = gd.image(size)
    img.colorAllocate((255,255,255))
    # draw it
    i = 0
    last_rank = 0
    heap = []
    # get a sorted version
    for pkg in popcon:
        heappush(heap, (popcon[pkg], pkg))
    while heap:
        (pop, pkg) = heappop(heap)
        rank = 1
        if pop > 0:
            #pop = int(log(pop,log_basis))+1
            rank = int(5*log(pop,log_basis)/log(popcon_max, log_basis))+1
        img.line((i-1, size[1]-(last_rank*y_scale)),
                 (i, size[1]-(rank*y_scale)),
                 1)
        i+=1
        last_rank = rank
    img.writePng(outfile)

if __name__ == "__main__":
    parser = OptionParser()
    parser.add_option("-d", "--direcroty", dest="dir",
                      default="../menu-data",
                      help="directory for the menu-data")
    parser.add_option("-f", "--file", dest="file",
                      default="popcon.png",
                      help="filename of the output plot")
    (options, args) = parser.parse_args()
    popcon = gatherPopconData(options.dir)
    plotPopcon(popcon, options.file)
