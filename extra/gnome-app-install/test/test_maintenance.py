#!/usr/bin/python

import sys
sys.path.insert(0, '../')

import unittest
import apt

import AppInstall.distros.Ubuntu 
from AppInstall.CoreMenu import Application
from AppInstall.Util import *

class TestMaintenance(unittest.TestCase):
    def setUp(self):
        self.distro = AppInstall.distros.Ubuntu.Distribution()
        self.cache = apt.Cache()
        self.fakeapp_main = Application("fake-main")
        self.fakeapp_main.pkgname = "apt"
        self.fakeapp_main.component = "main"
        self.fakeapp_restricted = Application("fake-restricted")
        self.fakeapp_restricted.pkgname = "foo"
        self.fakeapp_restricted.component = "restricted"
        self.fakeapp_universe = Application("fake-universe")
        self.fakeapp_universe.pkgname = "2vcard"
        self.fakeapp_universe.component = "universe"
    def testMaintenance(self):
        s = self.distro.get_maintenance_status(self.fakeapp_main, self.cache)
        self.assert_(s.startswith("Canonical provides critical updates"))
        s = self.distro.get_maintenance_status(self.fakeapp_universe, self.cache)
        self.assert_(s.startswith("Canonical does not provide updates"))
        s = self.distro.get_maintenance_status(self.fakeapp_restricted, self.cache)
        self.assert_(s.startswith("Canonical provides critical updates supplied"))
    def testGetReleaseFile(self):
        n = get_release_filename_for_pkg(self.cache, "bash")
        self.assertEqual(n, "/var/lib/apt/lists/archive.ubuntu.com_ubuntu_dists_intrepid_Release")
        self.assertEqual(get_release_date_from_release_file("data/fake_Release"),
                                                            1219160565)

if __name__ == '__main__':
    unittest.main()
