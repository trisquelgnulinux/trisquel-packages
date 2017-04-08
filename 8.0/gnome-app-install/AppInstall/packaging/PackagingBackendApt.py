import glob
import os
import os.path
import stat
import apt

from Errors import *

class PackagingBackendApt(object):

    def __init__(self):
        pass

    def addonCD(self, addon_cd, progress):
        cd_desktopdir = os.path.join(addon_cd,"app-install")
        if not os.path.exists(cd_desktopdir):
            raise AddonCdromError, _("Could not find required directory '%s'" % cd_desktopdir)
        try:
            cdrom = apt.cdrom.Cdrom(progress=progress,
                                    mountpoint=addon_cd)
            if not cdrom.inSourcesList:
                cdrom.add()
        except SystemError, e:
            raise AddonCdromError, e

    def isCacheOutdated(self, gconfclient):
        " check if the cache we have is outdated for some reason "
        # we init with the last time the cache dialog was updated to protect
        # against:
        # problem: what can happen is that the sources.list is modified
        #          but we only get I-M-S hits and the mtime of the Packages
        #          files do not change
        time_cache = gconfclient.get_int("/apps/gnome-app-install/cache_dialog_time")
        for f in glob.glob("/var/lib/apt/lists/*Packages"):
            mt = os.stat(f)[stat.ST_MTIME]
            ct = os.stat(f)[stat.ST_CTIME] 
            if mt > time_cache:
               time_cache = mt
            if ct > time_cache:
               time_cache = ct
        if not os.path.exists("/etc/apt/sources.list"):
            return False
        time_source = os.stat("/etc/apt/sources.list")[stat.ST_MTIME]
        for f in glob.glob("/etc/apt/sources.list.d/*.list"):
            mt = os.stat(f)[stat.ST_MTIME]
            ct = os.stat(f)[stat.ST_CTIME]
            if mt > time_source:
                time_source = mt
            if ct > time_source:
                time_source = ct
        #print "cache:  ", time_cache
        #print "source: ", time_source
        if time_cache < time_source:
            return True
        return False
