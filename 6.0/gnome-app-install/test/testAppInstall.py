#!/usr/bin/python

import sys
sys.path.insert(0, '../')

import unittest
from AppInstall.activation import ActivationStyle
from AppInstall.update import *
from AppInstall.AppInstall import AppInstall as App

import gobject
import gtk

class FakeOptions(object):
    def __init__(self):
        self.datadir = "data"
        self.desktopdir = "test/data"
        self.cachedir = "test/data/cache"
        self.transient_for = None
        self.addon_cd = None
        self.mime_type = None
        self.test_mode = True

class TestAppCache(unittest.TestCase):
    def testUpdate(self):
        options = FakeOptions()
        generate_menu_cache(options.desktopdir, options.cachedir)
        generate_mime_map(options.desktopdir, options.cachedir)

class TestAppInstall(unittest.TestCase):
    def setUp(self):
        options = FakeOptions()
        style = ActivationStyle()
        style.preRun()
        self.app = App(options, style)
    def testRun(self):
        gobject.timeout_add(100, gtk.main_quit)
        self.app.run()
    def tearDown(self):
        self.app.window_main.destroy()
        del(self.app)

if __name__ == '__main__':
    unittest.main()
