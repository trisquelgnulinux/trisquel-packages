#!/usr/bin/python

import sys
sys.path.insert(0, '../')

import gobject
import gtk
import unittest
from AppInstall.activation import *
from AppInstall.AppInstall import AppInstall

class FakeOptions(object):
    def __init__(self):
        self.datadir = "data/"
        self.desktopdir = "test/data/desktop"
        self.cachedir = "test/data/cache"
        self.transient_for = None
        self.addon_cd = None
        self.mime_type = "text/plain"
        self.test_mode = True

class TestCodecSearch(unittest.TestCase):
    def setUp(self):
        options = FakeOptions()
        args = ['gstreamer|0.10|<unknown>|MPEG-1 Layer 3 (MP3) decoder|'
                'decoder-audio/mpeg, mpegversion=(int)1, layer=(int)3']
        #args = ['gstreamer|0.10|<unknown>|Flash Video decoder|'
        #       'decoder-video/x-flash-video, flvversion=(int)1']
        style = CodecSearchActivationStyle(options, args)
        style.isInstallerOnly = False
        style._parseArgs()
        self.app = AppInstall(options, style)

    def testHasItems(self):
        model = self.app.menu.treeview_packages.get_model()
        self.assert_(len(model) > 0,
                     "no codecs found")

    def testRun(self):
        gobject.timeout_add(100, gtk.main_quit)
        self.app.run()

    def tearDown(self):
        self.app.window_main.destroy()
        del(self.app)

if __name__ == '__main__':
    unittest.main()

