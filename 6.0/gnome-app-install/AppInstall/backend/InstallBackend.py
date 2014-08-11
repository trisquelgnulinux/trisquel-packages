# (c) 2005-2009 Canonical, GPL
#

class InstallBackend(object):
    """The abstract backend that can install/remove packages"""
    def __init__(self, window_main, addon_cd=None):
        """init backend
        takes a gtk main window as parameter

        takes a optional addon_cd parameter to know at what path
        the addon CD is mounted
        """
        self.window_main = window_main
        self.addon_cd = addon_cd

    def commit(self, add, remove):
        """Commit a list of package adds and removes"""

    def update(self):
        """Run a update to refresh the package list"""


