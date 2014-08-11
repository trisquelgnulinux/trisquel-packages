# (c) 2005 Canonical, GPL

from SimpleGtkbuilderApp import SimpleGtkbuilderApp
import gtk
import gobject
import os
from Util import *


from widgets.AppListView import AppListView

class DialogMultipleApps(SimpleGtkbuilderApp):

    def __init__(self, datadir, parent, multiple_items_list, name, remove):
        SimpleGtkbuilderApp.__init__(self, path=datadir+"/gnome-app-install.ui")
        self.store = gtk.ListStore(gobject.TYPE_STRING,
                                   gobject.TYPE_PYOBJECT,
                                   gobject.TYPE_INT)
        for elm in multiple_items_list:
            self.store.append((elm.name, elm, 0))
        self.dialog_multiple_apps.set_transient_for(parent)
        # Setup the application list
        self.treeview_apps = AppListView(style=1)
        self.scrolledwindow_multiple_apps.add(self.treeview_apps)
        self.treeview_apps.set_headers_visible(False)
        self.treeview_apps.set_model(self.store)
        self.treeview_apps.show()
        # Create the dialog message text
        if remove == True:
            header = (_("Remove %s and bundled applications?") % name)
            msg = _("%s is part of a software collection. If you remove "
                    "%s, you will remove all bundled applications as well.") %\
                  (name, name)
            label = _("_Remove All")
        else:
            header = (_("Install %s and bundled applications?") % name)
            msg = _("%s is part of a software collection. If you install "
                    "%s, you will install all bundled applications as well.") %\
                  (name, name)
            label = _("_Install All")
        self.label_multiple.set_markup("<b><big>%s</big></b>\n\n%s" %\
                                       (header, msg))
        self.button_multiple_action.set_label(label)

    def run(self):
        return self.dialog_multiple_apps.run()

    def hide(self):
        self.dialog_multiple_apps.hide()
