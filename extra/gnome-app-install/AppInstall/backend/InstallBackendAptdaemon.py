# (c) 2005-2009 Canonical, GPL
#

import gobject
import gtk

from aptdaemon import client
from aptdaemon.enums import *
from aptdaemon.gtkwidgets import (AptErrorDialog, 
                                  AptProgressDialog, 
                                  AptMessageDialog)

from InstallBackend import InstallBackend


class InstallBackendAptdaemon(InstallBackend):
    """The abstract backend that can install/remove packages"""

    def commit(self, add, remove):
        """Commit a list of package adds and removes"""
        self.ac = client.AptClient()
        t = self.ac.commit_packages(list(add), [], list(remove), [], [],
                                    exit_handler=self._on_exit)
        dia = AptProgressDialog(t, parent=self.window_main)
        dia.run()
        dia.hide()
        self._show_messages(t)

    def update(self):
        """Run a update to refresh the package list"""
        self.ac = client.AptClient()
        t = self.ac.update_cache(exit_handler=self._on_exit)
        dia = AptProgressDialog(t, parent=self.window_main, terminal=False)
        dia.run()
        dia.hide()
        self._show_messages(t)

    def _on_exit(self, trans, exit):
        if exit == EXIT_FAILED:
            d = AptErrorDialog(trans.get_error(), parent=self.window_main)
            d.run()
            d.hide()

    def _show_messages(self, trans):
        while gtk.events_pending():
            gtk.main_iteration()
        for msg in trans._messages:
            d = AptMessageDialog(msg.enum, msg.details, parent=self.window_main)
            d.run()
            d.hide()
