# (c) 2005 Canonical, GPL

from SimpleGtkbuilderApp import SimpleGtkbuilderApp

import gtk
import gobject
import os

from AppInstall import gettext
ngettext = gettext.ngettext

from Util import *

from widgets.AppListView import AppListView

class AppListViewComplete(AppListView):
    def __init__(self, cache=None, menu=None, icons=None, executable=False):
        AppListView.__init__(self, style=1)
        self.executable = executable
        self.connect("row-activated", self.on_row_activated)
    def set_executable(self, value):
        self.executable = value
    def on_row_activated(self, treeview_packages, path, column):
        if self.executable != True:
            return False
        if os.getuid() == 0:
            return False
        store = self.get_model()
        treeiter = store.get_iter(path)
        (name, item, popcon) = store[treeiter]
        cmd_parts = []
        command = item.execCmd
        terminal = item.needsTerminal
        if command == "": return
        for part in command.split():
            while True:
                # two consecutive '%' characters represent an actual '%'
                if len(part) >= 2 and part[:2] == '%%':
                    cmd_parts.append('%')
                    part = part[2:]
                    continue
                # we're running the command without any options, so strip 
                # out placeholders
                if part[0] == '%': break
                # if the last part was an actual '%', we don't want to join 
                # it with a space, so do it by hand
                if cmd_parts[-1:] == '%':
                    part = '%' + part
                    cmd_parts[-1:] = part
                    break
                cmd_parts.append(part)
                break
        
        if terminal:
            command = " ".join(cmd_parts)
            command = "gnome-terminal --command=\"" + command + "\""
            cmd_parts = command.split()
        
        # run program
        os.spawnvp(os.P_NOWAIT, cmd_parts[0], cmd_parts)


class DialogComplete(SimpleGtkbuilderApp):
    def __init__(self, datadir, parent, to_add, to_rm, cache, auto_close=False):
        def add_apps_to_store(apps, store):
            for app in apps:
                store.append([app.name, app, 0])

        SimpleGtkbuilderApp.__init__(self,
                                path=datadir+"/gnome-app-install.ui")
        self.cache = cache
        self.auto_close = auto_close
        self.store = gtk.ListStore(gobject.TYPE_STRING,
                                   gobject.TYPE_PYOBJECT,
                                   gobject.TYPE_INT)
        if parent:
            self.window_complete.set_transient_for(parent)
        self.treeview = AppListViewComplete()
        self.scrolledwindow_complete.add(self.treeview)
        self.treeview.set_headers_visible(False)
        self.treeview.set_model(self.store)
        self.treeview.show()
        # Identify failed and exectuable applications and extras
        # (stuff without execCmd lines like codecs)
        failed_apps = []
        failed_extras = []
        installed_apps = []
        installed_extras = []  
        self.install_failures = False
        for app in to_add:
            pkg = app.pkgname
            available = cache.has_key(pkg)
            installed = available and cache[pkg].is_installed
            if not available:
                if app.execCmd != "":
                    failed_apps.append(app)
                else:
                    failed_extras.append(app)
            elif not installed:
                 if app.execCmd != "":
                    failed_apps.append(app)
                 else:
                    failed_extras.append(app)
            elif installed and app.execCmd != '':
                installed_apps.append(app)
            elif installed and app.execCmd == '':
                installed_extras.append(app)
        for app in to_rm:
            pkg = app.pkgname
            if self.cache.has_key(pkg) and self.cache[pkg].is_installed:
                if app.execCmd != "":
                    failed_apps.append(app)
                else:
                    failed_extras.append(app)
        # record if anything failed (for auto_close)
        if failed_extras or failed_apps:
                self.install_failures = True
        # Connect the signals
        self.button_complete_retry.connect("clicked",
                                           self.on_button_retry_clicked)
        self.button_complete_more.connect("clicked",
                                          self.on_button_more_clicked)
        self.button_complete_close.connect("clicked",
                                           self.on_button_close_clicked)
        self.window_complete.connect("delete-event",
                                     self.on_delete)
        # Adjust the dialog text
        if (len(failed_apps) > 0 or len(failed_extras) > 0) and len(to_rm) == 0:
            if len(failed_extras) > 0:
                header = _("Software installation failed")
                body = _("There has been a problem during the installation "
                         "of the following pieces of software.")
                self.button_complete_more.set_label(_("Add/Remove More Software"))
            else:
                header = _("Application installation failed")
                body = _("There has been a problem during the installation "
                         "of the following applications.")
            add_apps_to_store(failed_apps, self.store)
            add_apps_to_store(failed_extras, self.store)
            self.image_complete_icon.set_from_stock(gtk.STOCK_DIALOG_ERROR,
                                                    gtk.ICON_SIZE_DIALOG)
            self.button_complete_retry.show()
        elif (len(failed_apps) > 0 or len(failed_extras)> 0) and\
             len(to_add) == 0:
            if len(failed_extras) > 0:
                header = _("Software could not be removed")
                body = _("There has been a problem during the removal "
                         "of the following pieces of software.")
                self.button_complete_more.set_label(_("Add/Remove More Software"))
            else:
                header = _("Not all applications could be removed")
                body = _("There has been a problem during the removal "
                         "of the following applications.")
            add_apps_to_store(failed_apps, self.store)
            add_apps_to_store(failed_extras, self.store)
            self.image_complete_icon.set_from_stock(gtk.STOCK_DIALOG_ERROR,
                                                    gtk.ICON_SIZE_DIALOG)
            self.button_complete_retry.show()
        elif len(failed_extras) > 0 or len(failed_apps) > 0:
            #FIXME: perhaps separate widgets would make more sence
            if len(failed_extras) > 0:
                header = _("Installation and removal of software failed")
                body = _("There has been a problem during the installation or "
                         "removal of the following pieces of software.")
                self.button_complete_more.set_label(_("Add/Remove More Software"))
            else:
                header = _("Installation and removal of applications failed")
                body = _("There has been a problem during the installation or "
                         "removal of the following applications.")
            add_apps_to_store(failed_apps, self.store)
            add_apps_to_store(failed_extras, self.store)
            self.button_complete_retry.show()
            self.image_complete_icon.set_from_stock(gtk.STOCK_DIALOG_ERROR,
                                                    gtk.ICON_SIZE_DIALOG)
        elif len(installed_apps) > 0:
            header = ngettext(_("New application has been installed"),
                              _("New applications have been installed"),
                              len(installed_apps))
            add_apps_to_store(installed_apps, self.store)
            # we do not support launching apps when runing as root
            if os.getuid() == 0:
                body = _("To start a newly installed application, "
                         "choose it from the applications menu.")
            else:
                body = _("To start a newly installed application "
                         "double click on it.")
                self.treeview.set_executable(True)
        elif len(installed_extras) > 0:
            header = _("Software has been installed successfully")
            body = _("Do you want to install or remove further " \
                     "software?")
            self.scrolledwindow_complete.hide()
            self.button_complete_more.set_label(_("Add/Remove More Software"))
        else:
            header = _("Applications have been removed successfully")
            body = _("Do you want to install or remove further " \
                     "applications?")
            self.scrolledwindow_complete.hide()
        self.label_complete.set_markup("<b><big>%s</big></b>\n\n%s" % (header,
                                                                       body))

    def run(self):
        if (self.auto_close and self.install_failures == False):
            return gtk.RESPONSE_CLOSE
        self.window_complete.show()
        gtk.main()
        return self._response
    def _finish(self):
        self.window_complete.hide()
        gtk.main_quit()
    def on_button_close_clicked(self, button):
        self._response = gtk.RESPONSE_CLOSE
        self._finish()
    def on_button_retry_clicked(self, button):
        self._response = 1
        self._finish()
    def on_button_more_clicked(self, button):
        self._response = 2
        self._finish()
    def on_delete(self, widget, event):
        self._response = gtk.RESPONSE_CLOSE
        self._finish()
        return gtk.TRUE

if __name__ == "__main__":
    from AppInstall.CoreMenu import CoreApplicationMenu
    from AppInstall.DialogComplete import DialogComplete
    import gtk
    import apt
    import cPickle
    import pdb

    cache = apt.Cache()
    progress = apt.progress.OpTextProgress()
    to_add = []

    datadir = "/usr/share/app-install"
    desktopdir = "/usr/share/app-install"
    cachedir = "/var/cache/app-install"

    treeview_categories = gtk.TreeView()
    treeview_packages = gtk.TreeView()

    menu = CoreApplicationMenu(datadir)
    menu.pickle = cPickle.load(open("/var/cache/app-install/menu.p"))

    available = []
    available_extras = []
    installed = []
    installed_extras = []

    print menu.pickle.keys()
    for app in menu.pickle[menu.pickle.keys()[0]]:
        if cache.has_key(app.pkgname) and cache[app.pkgname].is_installed:
            if app.execCmd:
                installed.append(app)
            else:
                installed_extras.append(app)
        else:
            if app.execCmd:
                available.append(app)
            else:
                available_extras.append(app)
    to_rm = []
    while True:
        pdb.set_trace()
        dia = DialogComplete(datadir, None, to_add, to_rm, cache)
        dia.run()
