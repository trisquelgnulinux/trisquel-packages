# (c) 2005 Canonical, GPL

from SimpleGtkbuilderApp import SimpleGtkbuilderApp
import gtk
import gobject
import os

from Util import *
from widgets.AppListView import AppListView

class DialogPendingChanges(SimpleGtkbuilderApp):
    def __init__(self, datadir, parent, to_add, to_rm):
        SimpleGtkbuilderApp.__init__(self, path=datadir+"/gnome-app-install.ui")
        self.add_store = gtk.ListStore(gobject.TYPE_STRING,
                                       gobject.TYPE_PYOBJECT,
                                       gobject.TYPE_INT)
        self.remove_store = gtk.ListStore(gobject.TYPE_STRING,
                                          gobject.TYPE_PYOBJECT,
                                          gobject.TYPE_INT)
        for elm in to_add:
            self.add_store.append([elm.name, elm, 0])
        for elm in to_rm:
            self.remove_store.append([elm.name, elm ,0])
        self.dialog_pending_changes.realize()
        self.dialog_pending_changes.set_transient_for(parent)
        self.button_confirm_changes.grab_default()
        self.dialog_pending_changes.window.set_functions(gtk.gdk.FUNC_MOVE)
        # Setup the app list viewers
        self.treeview_add = AppListView(style=1)
        self.treeview_remove = AppListView(style=1)
        self.scrolledwindow_add.add(self.treeview_add)
        self.scrolledwindow_remove.add(self.treeview_remove)
        self.treeview_add.set_headers_visible(False)
        self.treeview_remove.set_headers_visible(False)
        self.treeview_add.set_model(self.add_store)
        self.treeview_remove.set_model(self.remove_store)
        self.treeview_add.show()
        self.treeview_remove.show()

    def run(self):
        if len(self.add_store) == 0:
            self.vbox_add.hide()
        if len(self.remove_store) == 0:
            self.vbox_remove.hide()
        return self.dialog_pending_changes.run()

    def hide(self):
        self.dialog_pending_changes.hide()
