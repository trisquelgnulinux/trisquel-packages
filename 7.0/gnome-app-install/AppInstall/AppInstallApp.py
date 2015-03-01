# coding: utf-8
#
# Copyright (C) 2004-2005 Ross Burton <ross@burtonini.com>
#               2005-2007 Canonical
#               2006 Sebastian Heinlein
# Authors:
#  Ross Burton
#  Michael Vogt
#  Sebastian Heinlein
#  Ian Jackson
#  Niran Babalola
#
# This program is free software; you can redistribute it and/or modify it under
# the terms of the GNU General Public License as published by the Free Software
# Foundation; either version 2 of the License, or (at your option) any later
# version.
#
# This program is distributed in the hope that it will be useful, but WITHOUT
# ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
# FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more
# details.
#
# You should have received a copy of the GNU General Public License along with
# this program; if not, write to the Free Software Foundation, Inc., 59 Temple
# Place, Suite 330, Boston, MA 02111-1307 USA

# Don't forget to disbale this :)
#import pdb
import gtk
import gtk.gdk
import gobject
import gconf
import pango
from math import log


from widgets.SearchEntry import SearchEntry
from widgets.AppDescView import AppDescView
from widgets.AppListView import AppListView

import gc
import stat
import glob
import re
import subprocess
import tempfile
import warnings
import os
import sys
from datetime import datetime
import distros

import dbus
import dbus.service
import dbus.glib
import time

from warnings import warn
warnings.filterwarnings("ignore", "ICON:.*", UserWarning)
warnings.filterwarnings("ignore", "apt API not stable yet", FutureWarning)
import apt
import apt_pkg

# from update-manager, needs to be factored out
from aptsources.sourceslist import SourcesList, is_mirror

# internal imports
from DialogComplete import DialogComplete
from DialogPendingChanges import DialogPendingChanges
from DialogMultipleApps import DialogMultipleApps
from DialogProprietary import DialogProprietary
from Menu import ApplicationMenu

from SimpleGtkbuilderApp import SimpleGtkbuilderApp
from Progress import GtkOpProgressWindow, GtkCdromProgress, GtkMainIterationProgress 
from Util import *

from packaging.Cache import MyCache, ThreadedCache

from Menu import (SHOW_ALL,
                  SHOW_ONLY_SUPPORTED,
                  SHOW_ONLY_FREE,
                  SHOW_ONLY_MAIN,
                  SHOW_ONLY_PROPRIETARY,
                  SHOW_ONLY_THIRD_PARTY,
                  SHOW_ONLY_INSTALLED)

from Menu import (COL_CAT_NAME,
                  COL_CAT_ITEM,
                  COL_CAT_PIXBUF)

import backend
import packaging

class AppInstallDbusControler(dbus.service.Object):
    """ this is a helper to provide the AppInstallIFace """
    def __init__(self, parent, bus_name,
                 object_path='/org/freedesktop/AppInstallObject'):
        dbus.service.Object.__init__(self, bus_name, object_path)
        self.parent = parent

    @dbus.service.method('org.freedesktop.AppInstallIFace')
    def bringToFront(self):
        self.parent.window_main.present()
        return True
    
class AppInstallApp(SimpleGtkbuilderApp):

    def __init__(self, options, activation_style):
        #FIXME: we have to disable dbus for the testing infrastructure,
        #       since it runs already in the main loop
        if not options.test_mode:
            self.setupDbus()

        self.search_timeout_id = 0
        self.activation_style = activation_style

        self.distro = distros.get_distro()

        # setup a default icon
        self.icons = gtk.icon_theme_get_default()
        try:
            gtk.window_set_default_icon(self.icons.load_icon("gnome-app-install", 32, 0))
        except gobject.GError:
            pass

        SimpleGtkbuilderApp.__init__(self, path=options.datadir+"/gnome-app-install.ui")

        self.channelsdir = options.desktopdir+"/channels"       
        self.datadir = options.datadir
        self.cachedir = options.cachedir
        self.desktopdir = options.desktopdir

        # the GdkWindow of the transient parent
        self.transient_for = None
        if options.transient_for:
            self.transient_for = gtk.gdk.window_foreign_new(options.transient_for)
            if self.transient_for:
                self.window_main.realize()
                self.window_main.window.set_transient_for(self.transient_for)

        # sensitive stuff
        self.button_ok.set_sensitive(False)

        # are we sorting by popcon
        self.sort_by_ranking = False

        # setup the gconf backend
        self.config = gconf.client_get_default()
        self.config.add_dir ("/apps/gnome-app-install", gconf.CLIENT_PRELOAD_NONE)

        # Tooltips
        self.tooltips = gtk.Tooltips()
        self.tipmap = {}

        # Sexy search entry
        self.search_entry = SearchEntry(self.icons)
        self.search_hbox.add(self.search_entry)
        self.search_entry.connect("terms-changed", self._perform_search)
        self.search_entry.show()

        self.treeview_packages = AppListView(self.icons)
        self.scrolled_window.add(self.treeview_packages)
        self.treeview_packages.show()

        self.textview_description = AppDescView()
        self.scrolled_description.add(self.textview_description)
        self.scrolled_description.set_policy(gtk.POLICY_AUTOMATIC, 
                                             gtk.POLICY_AUTOMATIC)
        msg = _("To install an application check the box next to the "
                "application. Uncheck the box to remove "
                "the application.") + "\n"
        msg += _("To perform advanced tasks use the "
                 "Synaptic package manager.")
        header = _("Quick Introduction")
        self.textview_description.show_message(header, msg)
        self.textview_description.show()

        # create the treeview
        self.setupTreeview()

        # seen flags
        # FIXME: make those @properties that are auto-syned with gconf
        self.components_seen = self.config.get_list("/apps/gnome-app-install/components_seen", "string")

        # combobx with filters for the application list
        filter_to_restore = self.config.get_int("/apps/gnome-app-install/filter_applications")
        if filter_to_restore not in range(7):
            filter_to_restore = 0
        list_filters = gtk.ListStore(gobject.TYPE_STRING,
                                     gobject.TYPE_BOOLEAN,
                                     gobject.TYPE_STRING,
                                     gobject.TYPE_INT)
        self.combobox_filter.set_model(list_filters)
        filter_renderer = gtk.CellRendererText()
        self.combobox_filter.pack_start(filter_renderer)
        # Prepare a set of filters
        filters = []
        # Load the primary filters of the distro
        sorted_keys = self.distro.filters_primary.keys()
        sorted_keys.sort()
        for filter in sorted_keys:
            filters.append((self.distro.filters_primary[filter][0],
                            False,
                            self.distro.filters_primary[filter][1],
                            filter))
        # Load the secondary filters of the distro if available and add
        # a separator
        if self.distro.filters_secondary:
            filters.append(("separator", True, "separator", -1))
            sorted_keys = self.distro.filters_secondary.keys()
            sorted_keys.sort()
            for filter in sorted_keys:
                filters.append((self.distro.filters_secondary[filter][0],
                                False,
                                self.distro.filters_secondary[filter][1],
                                filter))
        # Do not show the installed applications filter in installer only mode
        if not self.activation_style.isInstallerOnly:
            filters.extend([("separator", True, "separator", -1),
                            (_("Installed applications only"), False, 
                             _("Show only applications "\
                               "that are installed on your computer"), 
                             SHOW_ONLY_INSTALLED)])
        for (desc, sep, tooltip, filter) in filters:
            list_filters.append((desc, sep, tooltip, filter))
            self.combobox_filter.set_row_separator_func(self.separator_filter)
            self.combobox_filter.set_cell_data_func(filter_renderer, 
                                                    self.tooltip_on_filter)
            if filter == filter_to_restore:
                self.combobox_filter.set_active(len(list_filters) - 1)
                self.tooltips.set_tip(self.eventbox_filter, tooltip)

        # connect the changed signal of the combobox
        self.combobox_filter.connect("changed", self.on_combobox_filter_changed)

        if self.activation_style.isSpecific():
            self.activation_style.modifyUserInterface(self)
        else:
            # Restore the last state of the main window
            maximized = self.config.get_bool("/apps/gnome-app-install/state/window_maximized")
            height = self.config.get_int("/apps/gnome-app-install/state/window_height")
            width = self.config.get_int("/apps/gnome-app-install/state/window_width")
            if type(maximized) == bool and maximized == True:
                self.window_main.maximize()
            elif type(width) == int and type(height) == int and \
                 width > 0 and height > 0:
                self.window_main.set_property("default_width", width)
                self.window_main.set_property("default_height", height)

        if not self.transient_for:
            self.window_main.show()

        # get packaging backend before addon cd
        self.packaging_backend = packaging.backend_factory()

        # check for addon cd and move desktopdir to it
        # FIXME: test if the CD is for the right architecture/release
        self.addon_cd = options.addon_cd
        self.addonCD()

        # ... and open the cache
        self.updateCache(filter_to_restore)

        self.textview_description.hook(self.cache, 
                                       self.menu, 
                                       self.icons,
                                       self.tooltips,
                                       self.distro)
        self.treeview_packages.hook(self.cache,
                                    self.menu)

        # move to "All" category per default
        self.treeview_categories.set_cursor((0,))

        # this is a set() of packagenames that contain multiple applications
        # if a pkgname is in the set, a dialog was already displayed to the
        # user about this (ugly ...)
        self.multiple_pkgs_seen = set()
        self.window_main.show()

        # create a worker that does the actual installing etc
        self.install_backend = backend.backend_factory(self.window_main, options.addon_cd)

        # Make things responsible
        self.treeview_packages.connect("toggled",
                                       self.on_install_toggle)
        self.treeview_packages.connect("row-activated",
                                       self.on_treeview_packages_row_activated)
        self.treeview_packages.connect("cursor-changed",
                                       self.on_treeview_packages_cursor_changed)
        # now check if the cache is up-to-date
        if not options.test_mode:
            if (self.packaging_backend.isCacheOutdated(self.config) and
                self.askReloadOnOutdatedCache()):
                    self.reloadSources()
                    self.config.set_int("/apps/gnome-app-install/cache_dialog_time", int(time.time()))
            
        # make sure the focus is rigth
        if gtk.REALIZED & self.search_entry.flags():
            self.search_entry.grab_focus()
        else:
            self.treeview_packages.grab_focus()

    def error(self, summary, msg):
        " helper to show a error msg "
        d = gtk.MessageDialog(parent=self.window_main,
                              flags=gtk.DIALOG_MODAL,
                              type=gtk.MESSAGE_ERROR,
                              buttons=gtk.BUTTONS_CLOSE)
        d.set_title("")
        d.set_markup("<big><b>%s</b></big>\n\n%s" % (summary, msg))
        d.realize()
        d.window.set_functions(gtk.gdk.FUNC_MOVE)
        d.run()
        d.destroy()

    def askReloadOnOutdatedCache(self):
        " ask if software sources should be reloaded on outdated cache"
        self.dialog_cache_outdated.set_transient_for(self.window_main)
        self.dialog_cache_outdated.realize()
        self.dialog_cache_outdated.window.set_functions(gtk.gdk.FUNC_MOVE)
        res = self.dialog_cache_outdated.run()
        self.dialog_cache_outdated.hide()
        if res == gtk.RESPONSE_YES:
            return True
        return False

    def addonCD(self):
        """ check for addon cd and if available and not yet added
            add itadd addon cd
        """
        if self.addon_cd is None:
            return
        try:
            self.window_main.set_sensitive(False)
            self.setBusy(True)
            if self.packaging_backend.addonCD(self.addon_cd, 
                                              GtkCdromProgress(self)):
                self.desktopdir=cd_desktopdir
                self.cachedir=None
        except packaging.AddonCdromError, e:
            print "Error while adding addon CD:\n%s" % e
            header = _("Error reading the addon CD")
            msg = _("The addon CD may be corrupt ")
            self.error(header, msg)
            sys.exit(1)


    def separator_filter(self, model, iter, user_data=None):
        """Used to draw a spearator in the combobox for the filters"""
        return model.get_value(iter, 1)

    def setupDbus(self):
        """ this sets up a dbus listener if none is installed alread """
        # check if there is another g-a-i already and if not setup one
        # listening on dbus
        dbus.mainloop.glib.DBusGMainLoop(set_as_default=True)
        try:
            bus = dbus.SessionBus()
        except:
            print "warning: could not initiate dbus"
            return
        try:
            proxy_obj = bus.get_object('org.freedesktop.AppInstall', '/org/freedesktop/AppInstallObject')
            iface = dbus.Interface(proxy_obj, 'org.freedesktop.AppInstallIFace')
            iface.bringToFront()
            #print "send bringToFront"
            sys.exit(0)
        except dbus.DBusException, e:
            #print "no listening object (%s) "% e
            try:
                bus_name = dbus.service.BusName('org.freedesktop.AppInstall',bus)
                self.dbusControler = AppInstallDbusControler(self, bus_name)
            except Exception, e:
                print "can't init dbus"
                return

    def setBusy(self, flag):
        """ Show a watch cursor if the app is busy for more than 0.3 sec.
            Furthermore provide a loop to handle user interface events """
        if self.window_main.window is None:
            return
        if flag == True:
            self.window_main.window.set_cursor(gtk.gdk.Cursor(gtk.gdk.WATCH))
        else:
            self.window_main.window.set_cursor(None)
        while gtk.events_pending():
            gtk.main_iteration()

    def on_combobox_filter_changed(self, combobox):
        """The filter for the application list was changed"""
        self.setBusy(True)
        active = combobox.get_active()
        model = combobox.get_model()
        iter = model.get_iter(active)
        filter_new = model.get_value(iter, 3)
        if filter_new in range(7):
            self.config.set_int("/apps/gnome-app-install/filter_applications", 
                                filter_new)
            self.refilter(filter=filter_new)
        tooltip = model.get_value(iter, 2)
        self.tooltips.set_tip(self.eventbox_filter, tooltip)
        self.setBusy(False)

    def refilter(self, filter=None, terms=None, model=None):
        """
        Applies the given filter or search terms to the menu filter and provides
        a visual feedback for empty results
        """
        if filter != None:
            self.menu.filter = filter
        if terms != None:
            self.menu.searchTerms = terms
        self.menu._refilter(model)
        if len(self.menu.treeview_packages.get_model()) == 0:
             self.show_no_results_msg()
             self.treeview_packages.set_sensitive(False)
        else:
             self.treeview_packages.set_sensitive(True)
             self.menu.treeview_packages.set_cursor(0)
 
    def on_window_main_key_press_event(self, widget, event):
        #print "on_window_main_key_press_event()"
        # from /usr/include/gtk-2.0/gdk/gdkkeysyms.h
        GDK_q = 0x071
        if (event.state & gtk.gdk.CONTROL_MASK) and event.keyval == GDK_q:
            self.on_window_main_delete_event(self.window_main, None)

    def error_no_indexfiles(self):
        """ show an error message that no index files could be found
        """
        header = _("The list of applications is not available")
        msg = _("Click on 'Reload' to load it. To reload the "
                "list you need a working internet connection. ")
        d = gtk.MessageDialog(parent=self.window_main,
                              flags=gtk.DIALOG_MODAL,
                              type=gtk.MESSAGE_INFO)
        d.add_buttons(gtk.STOCK_REFRESH, gtk.RESPONSE_YES,
                      gtk.STOCK_CLOSE, gtk.RESPONSE_CLOSE)
        d.set_title("")
        d.set_markup("<big><b>%s</b></big>\n\n%s" % (header, msg))
        d.realize()
        d.window.set_functions(gtk.gdk.FUNC_MOVE)
        res = d.run()
        d.destroy()
        if res == gtk.RESPONSE_YES:
            self.reloadSources()
        

    def error_not_available(self, item):
         """Show an error message that the application cannot be installed"""
         header = _("%s cannot be installed on your "
                    "computer type (%s)") % (item.name,
                                             self.cache.getArch())
         msg = _("Either the application requires special hardware features "
                 "or the vendor decided to not support your computer type.")
         self.error(header, msg)

    def tooltip_on_filter(self, cell_view, cell_renderer, model, iter):
        """
        Show a disclaimer in the tooltips of the filters
        """
        id = model.get_path(iter)[0]
        item_text = model.get_value(iter, 0)
        item_disclaimer = model.get_value(iter, 2)
        cell_renderer.set_property('text', item_text)
        # see LP#87727, no idea why we are sometimes called with
        # this kind of cell_view argument
        if isinstance(cell_view, gtk.TreeViewColumn):
            return
        cell_parent = cell_view.get_parent()
        if (isinstance(cell_parent, gtk.MenuItem) 
            and (cell_parent not in self.tipmap 
                 or self.tipmap[cell_parent] != item_disclaimer)):
            self.tipmap[cell_parent] = item_disclaimer
            self.tooltips.set_tip(cell_parent, item_disclaimer)

    def canNotInstallApp(self, pkg):
        """ helper that displays a message if the package can not
            be installed """
        sum = _("Cannot install '%s'") % pkg
        msg = _("This application conflicts with other "
               "installed software. To install '%s' "
               "the conflicting software "
               "must be removed first.\n\n"
               "Switch to the 'synaptic' package manager to resolve this "
               "conflict.") % pkg
        self.error(sum, msg)
        # reset the cache
        # FIXME: a "pkgSimulateInstall,remove"  thing would
        # be nice
        self.cache.clean()
        return False

    def _ensureInArchive(self, item):
        """ check and make sure the package is in available archive """
        pkg = item.pkgname
        if not (self.cache.has_key(pkg) and 
                self.cache[pkg].candidate.downloadable):
            # first test if we have usable index files
            haveAtLeastOneIndex = False
            for m in self.cache._list.List:
                if m.URI.startswith("cdrom:"):
                    continue
                for index in m.IndexFiles:
                    if index.HasPackages and index.Exists:
                        haveAtLeastOneIndex = True
                        break
            if not haveAtLeastOneIndex:
                self.error_no_indexfiles()
                return False
            # then test if the file is not available in those
            for it in self.cache._cache.FileList:
                if (it.Component != "" and it.Component == item.component and
                    it.Archive != "" and 
                    it.Archive == self.distro.get_codename()):
                    self.error_not_available(item)
                    return False
            # check if we have the package in the cache
            self.saveState()
            if not self.addChannel(item):
                #FIXME: we need a visual feedback here
                return False
            self.restoreState()
        return True

    def tryRemove(self, item):
        #print "tryRemove", item.pkgname
        self.cache.clean()
        pkg = item.pkgname
        # check if removal can be done
        self.cache[pkg].mark_delete(auto_fix=False)
        if self.cache._depcache.broken_count > 0:
            sum = _("Cannot remove '%s'") % pkg
            msg = _("One or more applications depend on %s. "
                    "To remove %s and the dependent applications, "
                    "use the Synaptic package manager.") % (pkg, pkg)
            self.error(sum, msg)
            self.cache.clean()
            return False
        self.cache.clean()
        return True

    def tryInstall(self, item):
        #print "tryInstall", item.pkgname
        pkg = item.pkgname
        self.cache.clean()
        # check if it can be installed savely
        apt_error = False

        # get a action group to speed up the calculation
        group = apt_pkg.ActionGroup(self.cache._depcache)
        # reapply the state of installs
        (to_add, to_rm) = self.menu.getChanges()
        for app in to_add:
            self.cache[app.pkgname].mark_install()
        del group

        # now install the new pkg
        try:
            self.cache[pkg].mark_install(auto_fix=True)
        except SystemError, e:
            apt_error = True
        except KeyError:
            self.error_not_available(item)
            return False
        # first check if the package savely replaces a
        # existing one
        if (self.cache._depcache.del_count > 0 and
            self.cache._depcache.broken_count == 0 and
            not apt_error):
            if not hasattr(item, "replaces"):
                return self.canNotInstallApp(pkg)
            item_replaces = set(item.replaces)
            removals = set([pkg.name for pkg in self.cache.getChanges() if pkg.marked_delete])
            if item_replaces != removals:
                return self.canNotInstallApp(pkg)
            else:
                # mark the save replace here
                for r in item_replaces:
                    try:
                        apps = self.menu.pkg_to_app[r]
                        for app in apps:
                            app.toInstall = False
                    except KeyError, e:
                        pass
                self.treeview_packages.queue_draw()

        # check if we do not conflict with something
        for app in to_add:
            if not self.cache[app.pkgname].marked_install:
                apt_error = True
        # then check for real errors
        if apt_error or self.cache._depcache.broken_count > 0:
            return self.canNotInstallApp(pkg)
        return True
       
    def tryKeep(self, item):
        #print "tryKeep", item.pkgname
        # see if we have replaces and if so, apply them
        if hasattr(item, "replaces"):
            for r in item.replaces:
                apps = self.menu.pkg_to_app[r]
                for app in apps:
                    app.toInstall = not app.toInstall
            self.treeview_packages.queue_draw()
        return True

    def _confirm_source_activation(self, item, need_internet=True):
        """
        Ask the user if a specified componet of the distribution 
        should be enabled
        """
        primary=""
        secondary=""
        dia = gtk.MessageDialog(parent=self.window_main,
                                type=gtk.MESSAGE_QUESTION,
                                buttons=gtk.BUTTONS_CANCEL)
        messages = self.distro.get_components_ask_msgs()
        if item.component:
            if messages.has_key(item.component):
                (primary, secondary) = messages[item.component]
            else:
                (primary, secondary) = messages[None]
                primary = primary % item.component
        elif item.channel:
            if item.isv:
                vendor = item.isv
            else:
                vendor = item.channel
            primary = _("Enable the installation of software "
                        "from %s?") % vendor
            secondary = _("%s is provided by a third party vendor. The third "
                          "party vendor is responsible for support and "
                          "security updates.")
        if need_internet:
            secondary += "\n\n%s" % _("You need a working internet connection "
                                      "to continue.")
        dia.set_markup("<b><big>%s</big></b>" % primary)
        dia.format_secondary_markup(secondary % item.name)
        dia.add_button(_("_Enable"), gtk.RESPONSE_OK)
        ret = dia.run()
        dia.hide()
        if ret == gtk.RESPONSE_OK:
            return True
        else:
            return False

    # install toggle on the treeview
    def on_install_toggle(self, widget, item):
        #print "on_install_toggle: %s %s" % (renderer, path)
        self.setBusy(True)
        pkg = item.pkgname

        # see what should be done
        want_install = not item.toInstall
        is_installed = self.cache.has_key(pkg) and self.cache[pkg].is_installed
        
        install = want_install and not is_installed
        remove =  not want_install and is_installed
        keep = (want_install and is_installed or
                not want_install and not is_installed)
        assert(install ^ remove ^ keep)

        # give a first time warning on universe/multiverse package
        # installs (because we enable unverse/multiverse by default now)
        if install:
            if not self._ensureInArchive(item):
                self.setBusy(False)
                return False

        # see if it can be done without breaking the cache
        if install and not self.tryInstall(item):
            self.setBusy(False)
            return False
        elif remove and not self.tryRemove(item):
            self.setBusy(False)
            return False
        elif keep and not self.tryKeep(item):
            self.setBusy(False)
            return False
            
        # the status of the selected package
        status = item.toInstall
        # check if the package provides multiple desktop applications
        if len(self.menu.pkg_to_app[item.pkgname]) > 1:
            apps = self.menu.pkg_to_app[item.pkgname]
            # hack: redraw the treeview (to update the toggle icons after the
            #       tree-model was changed)
            self.treeview_packages.queue_draw()
            # show something to the user (if he hasn't already seen it)
            if not item.pkgname in self.multiple_pkgs_seen:
                dia = DialogMultipleApps(self.datadir, self.window_main,
                                         apps, item.name,
                                         self.cache[pkg].is_installed)
                rt = dia.run()
                dia.hide()
                self.multiple_pkgs_seen.add(item.pkgname)
                if rt != gtk.RESPONSE_OK:
                    self.setBusy(False)
                    return
            for app in apps:
                 app.toInstall = not status
        else:
            # invert the current selection
            item.toInstall = not status
        self.button_ok.set_sensitive(self.menu.isChanged())
        self.setBusy(False)

    def addChannel(self, item):
        """Ask for confirmation to add the missing channel or
           component of the current selected application"""
        if item.thirdparty and item.channel:
            dia = DialogProprietary(self.datadir, self.window_main, item)
            res = dia.run()
            dia.hide()
            # the user canceld
            if res != gtk.RESPONSE_OK:
                return False
        else:
            if not self._confirm_source_activation(item):
                # the user canceld
                return False
        # let us go
        if item.component:
            if item.component in self.distro.get_components_ask():
                self.components_seen.append(item.component)
                self.config.set_list("/apps/gnome-app-install/components_seen",
                                     "string", self.components_seen)
            #FIXME: Should raise an error
            if not self.enableComponent(item.component):
                return False

            # Also enable further components that are required
            for dep in self.distro.get_comp_dependencies(item.component):
                for it in self.cache._cache.FileList:
                    if it.Component != "" and it.Component == dep:
                        break
                else:
                    if not self.enableComponent(dep):
                        return False
        elif item.channel:
            if not self.enableChannel(item.channel):
                return False
        else:
            # should never happen
            print "ERROR: addChannel() called without channel or component"
            return False
        # now do the reload
        self.reloadSources()
        return True

    def setupTreeview(self):
        def _icon_cell_func(column, cell, model, iter):
            menuitem = model.get_value(iter, COL_ITEM)
            if menuitem == None or menuitem.iconname == None:
                cell.set_property("pixbuf", None)
                cell.set_property("visible", False)
                return
            try:
                icon = self.icons.load_icon(menuitem.iconname, 24, 0)
            except gobject.GError:
                try:
                    icon = self.icons.load_icon("applications-other", 24, 0)
                except gobject.GError:
                    icon = self.icons.load_icon(gtk.STOCK_MISSING_IMAGE, 24, 0)
            cell.set_property("pixbuf", icon)
            cell.set_property("visible", True)

        # categories
        column_cat = gtk.TreeViewColumn("")
        # icons
        renderer_cat_icon = gtk.CellRendererPixbuf()
        column_cat.pack_start(renderer_cat_icon, False)
        column_cat.set_cell_data_func(renderer_cat_icon, _icon_cell_func)
        # categoriy name
        renderer_cat_name = gtk.CellRendererText()
        renderer_cat_name.set_property("scale", 1.0)
        column_cat.pack_start(renderer_cat_name, True)
        column_cat.add_attribute(renderer_cat_name, "markup", COL_CAT_NAME)
        self.treeview_categories.append_column(column_cat)
        self.treeview_categories.set_search_column(COL_CAT_NAME)

    def saveState(self):
        """ save the current state of the app """
        # store the pkgs that are marked for removal or installation
        (self.to_add, self.to_rm) = self.menu.getChanges()
        (self.cursor_categories_path,x) = self.treeview_categories.get_cursor()
        model = self.treeview_packages.get_model()
        (packages_path, x) = self.treeview_packages.get_cursor()
        if packages_path:
            it = model.get_iter(packages_path)
            self.cursor_pkgname = model.get_value(it, COL_NAME)
        else:
            self.cursor_pkgname = None

    def restoreState(self):
        """ restore the current state of the app """
        # set category
        self.window_main.set_sensitive(False)
        self.treeview_categories.set_cursor(self.cursor_categories_path)
        model = self.treeview_packages.get_model()
        # reapply search
        #query = self.search_entry.get_text()
        #if query:
        #    self.on_search_timeout()
        # remark all packages that were marked for installation
        for item in self.to_add:
            if self.cache.has_key(item.pkgname):
                try:
                    self.cache[item.pkgname].mark_install(auto_fix=True)
                except SystemError:
                    continue
                # set the state of the corresponing apps
                apps = self.menu.pkg_to_app[item.pkgname]
                for app in apps:
                    app.toInstall = item.toInstall
        # remark all packages that were marked for removal
        for item in self.to_rm:
            if self.cache.has_key(item.pkgname):
                try:
                    self.cache[item.pkgname].mark_delete(auto_fix=True)
                except SystemError:
                    continue
                # set the state of the corresponing apps
                apps = self.menu.pkg_to_app[item.pkgname]
                for app in apps:
                    app.toInstall = item.toInstall
        # restore search
        search_term = self.search_entry.get_text()
        if len(search_term) > 0:
            self._perform_search(None, search_term)
        # find package
        for it in iterate_list_store(model,model.get_iter_first()):
            name = model.get_value(it, COL_NAME)
            # if the app correpsonds to the one selected before select it again
            if name == self.cursor_pkgname:
                path = model.get_path(it)
                self.treeview_packages.set_cursor(path)
                break
        self.window_main.set_sensitive(True)
        # redraw the treeview so that all check buttons are updated
        self.treeview_packages.queue_draw()

    def show_cache_error(self, exception=None):
        # show an error dialog if something went wrong with the cache
        header = _("Failed to check for installed and available applications")
        msg = _("This is a major failure of your software " 
                "management system. Please check for broken packages "
                "with synaptic, check the file permissions and "
                "correctness of the file '/etc/apt/sources.list' and "
                "reload the software information with: "
                "'sudo apt-get update' and 'sudo apt-get install -f'."
                )
        print exception
        self.error(header, msg)

    def updateCache(self, filter=SHOW_ONLY_SUPPORTED):
        self.window_main.set_sensitive(False)
        self.setBusy(True)

        # honor transient_for cmdline arguemnt
        self.window_main.realize()
        progress_transient_for = self.window_main
        if self.transient_for is not None:
            progress_transient_for = self.transient_for
        
        progress = GtkOpProgressWindow(self.builder,
                                       progress_transient_for,
                                       steps=[100],
                                       label=self.distro.get_progress_label())
        
        try:
            if not hasattr(self, "cache"):
                # a specific activation style needs the cache
                if self.activation_style.isSpecific():
                    self.cache = MyCache(GtkMainIterationProgress())
                else:
                    self.cache = None
                    #now = time.time()
                    loader = ThreadedCache(self, apt.progress.base.OpProgress())
                    # mvo: weehhh - calling start() takes nearly 1s on a fast
                    #               system :( - that is almost the time it
                    #               takes to load the cache
                    loader.start()
                    #print time.time()-now
            else:
                self.cache.open(progress)
                # Added for Trisquel since in 4.5 Slaine the progress window
                # failed to close.
                self.window_progress.hide()
        except Exception, e:
            self.show_cache_error(e)
            sys.exit(1)

        if not hasattr(self, "menu"):
            self.menu = ApplicationMenu(self.desktopdir,
                                        self.cachedir,
                                        self.cache,
                                        self.treeview_packages,
                                        progress, filter,
                                        activation_style=self.activation_style)
            
        self.treeview_categories.set_model(self.menu.get_categories_store())

        adj = self.scrolled_window.get_vadjustment()
        adj.set_value(0)

        # wait for the cache loader thread
        if not self.cache:
            # FIXME: show progress here instead of blocking
            loader.join()
            if not loader.cache:
                self.show_cache_error()
                sys.exit(1)
            self.cache = loader.cache
            self.menu.cache = loader.cache
        self.menu.refreshAfterCacheChange(progress)
        
        self.setBusy(False)
        self.button_ok.set_sensitive(False)
        self.window_main.set_sensitive(True)
    
    def ignoreChanges(self):
        """
        If any changes have been made, ask the user to apply them and return
        a value based on the status.
        Returns True if the changes should be thrown away and False otherwise
        """
        if not self.menu.isChanged():
            return True
        (to_add, to_rm) = self.menu.getChanges()
        # FIXME: move this set_markup into the dialog itself
        dia = DialogPendingChanges(self.datadir, self.window_main,
                                   to_add, to_rm)
        header =_("Apply changes to installed applications before closing?")
        msg = _("If you do not apply your changes they will be lost "\
                "permanently.")
        dia.label_pending.set_markup("<big><b>%s</b></big>\n\n%s" % \
                                     (header, msg))
        dia.button_ignore_changes.set_label(_("_Close Without Applying"))
        dia.button_ignore_changes.show()
        dia.dialog_pending_changes.realize()
        dia.dialog_pending_changes.window.set_functions(gtk.gdk.FUNC_MOVE)
        res = dia.run()
        dia.hide()
        return res

    
    # ----------------------------
    # Main window button callbacks
    # ----------------------------

    def on_button_help_clicked(self, widget):
        if os.path.exists("/usr/bin/yelp"):
            subprocess.Popen(["/usr/bin/yelp", "ghelp:gnome-app-install"])
        else:
            header = _("No help available")
            msg = _("To display the help, you need to install the "
                    "\"yelp\" application.")
            self.error(header, msg)

    def applyChanges(self, to_add, to_rm):
        """
        Install and remove the packages of the given applications and
        show a status dialog afterwards
        """
        self.setBusy(True)
        # Get the selections delta for the changes and apply them
        pkgs_add = set([item.pkgname for item in to_add])
        pkgs_rm = set([item.pkgname for item in to_rm])
        if len(pkgs_rm) > 0:
            additional_rm = self.cache.getDependantAutoDeps(pkgs_rm)
            pkgs_rm |= additional_rm
        ret = self.install_backend.commit(pkgs_add, pkgs_rm)
        # FIXME: needs to be tested on low end machines
        self.updateCache(filter=self.menu.filter)
        # Show window with newly installed programs
        dia = DialogComplete(self.datadir, self.window_main,
                             to_add, to_rm, self.cache,
                             self.activation_style.autoClose())
        response = dia.run()
        self.setBusy(False)
        self.activation_style.changesSuccessfulNotify()
        if response == gtk.RESPONSE_CLOSE:
            self.quit()
        elif response == 1:
            # The user has chosen to retry
            self.applyChanges(to_add, to_rm)
        self.refilter()

    def on_button_ok_clicked(self, button):
        (to_add, to_rm) = self.menu.getChanges()
        # show a confirmation dialog if we are in full mode
        if (self.activation_style.isInstallerOnly or 
            self.confirmChanges(to_add, to_rm)):
            self.activation_style.userApprovedNotify()
            self.applyChanges(to_add, to_rm)

    def confirmChanges(self, to_add, to_rm):
        """
        Show a dialog that asks the user to confirm the given changes
        """
        dia = DialogPendingChanges(self.datadir, self.window_main,
                                   to_add, to_rm)
        # FIXME: move this inside the dialog class, we show a different
        # text for a quit dialog and a approve dialog
        header = _("Apply the following changes?")
        msg = _("Please take a final look through the list of "\
                "applications that will be installed or removed.")
        dia.label_pending.set_markup("<big><b>%s</b></big>\n\n%s" % \
                                     (header, msg))
        res = dia.run()
        dia.hide()
        if res != gtk.RESPONSE_APPLY:
            # anything but ok makes us leave here
            return False
        else:
            return True

    def _perform_search(self, widget, query):
        """
        Filter and sort by rank being based on the entered terms. Otherwise 
        sort by name
        """
        self.setBusy(True)
        model = self.treeview_packages.get_model()
        if query.lstrip() != "":
            search_terms = query.lower().split(" ")
            self.sort_by_ranking = True
            search_terms = query.lower().split(" ")
            # Avoid to change the sorting if the user already changed it
            # for the current query
            if not model.has_default_sort_func():
                model.set_default_sort_func(self.menu._ranking_sort_func)
                model.set_sort_column_id(-1, gtk.SORT_ASCENDING)
        else:
            search_terms = []
            self.sort_by_ranking = False
            model.set_sort_column_id(COL_NAME, gtk.SORT_ASCENDING)
            model.set_default_sort_func(self.menu._name_sort_func)
        self.refilter(terms=search_terms)
        self.setBusy(False)

    def on_reload_activate(self, item):
        self.reloadSources()
        
    def on_button_cancel_clicked(self, item):
        self.quit()

    def reloadSources(self):
        self.window_main.set_sensitive(False)
        self.saveState()
        ret = self.install_backend.update()
        self.updateCache(filter=self.menu.filter)
        self.restoreState()
        self.window_main.set_sensitive(True)
        return ret

    def enableChannel(self, channel):
        """ enables a channel with 3rd party software """
        # enabling a channel right now is very easy, just copy it in place
        channelpath = "%s/%s.list" % (self.channelsdir,channel)
        channelkey = "%s/%s.key" % (self.channelsdir,channel)
        if not os.path.exists(channelpath):
            print "WARNING: channel '%s' not found" % channelpath
            return
        #shutil.copy(channelpath,
        #            apt_pkg.Config.FindDir("Dir::Etc::sourceparts"))
        cmd = ["gksu",
               "--desktop", "/usr/share/applications/gnome-app-install.desktop",
               "--",
               "install", "--mode=644","--owner=0",channelpath,
               apt_pkg.Config.FindDir("Dir::Etc::sourceparts")]
        subprocess.call(cmd)
        # install the key as well
        if os.path.exists(channelkey):
            cmd = ["gksu",
                   "--desktop",
                   "/usr/share/applications/gnome-app-install.desktop",
                   "--",
                   "apt-key", "add",channelkey]
            subprocess.call(cmd)
        return True

    def enableComponent(self, component):
        """ Enables a component of the current distribution
            (in a seperate file in /etc/apt/sources.list.d/$dist-$comp)
        """
        # sanity check
        if component == "":
            print "no repo found in enableRepository"
            return

        cmd = ["gksu", "--desktop",
               "/usr/share/applications/gnome-app-install.desktop",
               "--",
               "gnome-app-install-helper", "-e", component]
        try:
            output = subprocess.Popen(cmd,
                                      stdout=subprocess.PIPE).communicate()[0]
        except OSError, e:
            print >>sys.stderr, "Execution failed:", e
        #FIXME: Very ugly, but gksu doesn't return the correct exit states
        if output == "Enabled the %s component\n" % component:
            return True
        else:
            return False

    # ---------------------------
    # Window management functions
    # ---------------------------

    def on_window_main_delete_event(self, window, event):
        if window.get_property("sensitive") == False:
            return True
        if self.menu.isChanged():
            ret = self.ignoreChanges()
            if ret == gtk.RESPONSE_APPLY:
                (to_add, to_rm) = self.menu.getChanges()
                if not self.applyChanges(to_add, to_rm):
                    return True
            elif ret == gtk.RESPONSE_CANCEL:
                return True
            elif ret == gtk.RESPONSE_CLOSE:
                self.quit()
        self.quit()

    def on_window_main_destroy_event(self, data=None):
        #if self.window_installed.get_property("visible") == False:
        #    self.quit()
        self.quit()
            
    def quit(self):
        """
        Stores the state of the main window and quits the application
        """
        # Save the state of the main window
        if not self.activation_style.isSpecific():
            maximized = self.window_main.window.get_state() == gtk.gdk.WINDOW_STATE_MAXIMIZED
            self.config.set_bool("/apps/gnome-app-install/state/window_maximized", maximized)
            if not maximized:
                (width, height) = self.window_main.get_size()
                self.config.set_int("/apps/gnome-app-install/state/window_height", height) 
                self.config.set_int("/apps/gnome-app-install/state/window_width", width)
        # Allow the activation style to quit the application and send special
        # exit states
        self.activation_style.quitHook()
        sys.exit(0)

    def on_treeview_packages_row_activated(self, treeview, path, view_column):
        iter = treeview.get_model().get_iter(path)
        item = treeview.get_model().get_value(iter, COL_ITEM)
        # We have to do this check manually, since we don't know if the
        # corresponding CellRendererToggle is not activatable
        if (item.architectures and 
            self.cache.getArch() not in item.architectures):
            return False
        self.on_install_toggle(None, item)

    def on_treeview_categories_cursor_changed(self, treeview):
        """
        Show the applications that belong to the selected category and
        restore the previos sorting
        """
        #print "on_treeview_categories_cursor_changed"
        path = treeview.get_cursor()[0]
        iter = treeview.get_model().get_iter(path)
        (name, item, pix) = treeview.get_model()[iter]
        # show a busy cursor if the "all" category was selected
        if path == (0,):
            self.setBusy(True)
        # get the sorting of the current app store
        old_model = self.treeview_packages.get_model()
        (sort_column, sort_type) = old_model.get_sort_column_id()
        # if we are in search mode, set a default sort function and sort by it
        # if the previous store was sorted by it
        if self.sort_by_ranking:
            if sort_column == None:
                sort_column = -1
                sort_type = gtk.SORT_ASCENDING
            item.applications.set_default_sort_func(self.menu._ranking_sort_func)
        # if we are not in search mode, but the store still has got 
        # a search function remove it and sort by name if the it was 
        # sorted by the default function before
        elif item.applications.has_default_sort_func():
            if sort_column == None:
                sort_column = COL_NAME
                sort_type = gtk.SORT_ASCENDING
            # for anything but "All" use the sort func that does the
            # always on top sorting, we don't use it for all because
            # its a bit slow there
            if path != (0,):
                item.applications.set_default_sort_func(self.menu._name_sort_func)
            else:
                item.applications.set_default_sort_func(None)
        else:
            # this can happen if the user right-clicks on "all"
            # because we do not have a default sort function then
            # (for performance reasons)
            sort_column = -1
            sort_type = gtk.SORT_ASCENDING
        item.applications.set_sort_column_id(sort_column, sort_type)
        # hrm, figure out how to set it into the default sorting mode at
        # startup, this is certianly not the right solution
        item.applications.set_sort_column_id(-1, sort_type)
        # filter the apps
        self.refilter(model=item.applications)
        self.setBusy(False)

    def on_treeview_packages_cursor_changed(self, treeview):
        path = treeview.get_cursor()[0]
        iter = treeview.get_model().get_iter(path)

        (name, item, popcon) = treeview.get_model()[iter]
        self.textview_description.show_description(item)

    def show_no_results_msg(self):
        """ Give the user some hints if the search returned 
            no results"""
        buffer = self.textview_description.get_buffer()
        buffer.set_text("")
        # remove all old tags
        tag_table = buffer.get_tag_table()
        tag_table.foreach((lambda tag, table: table.remove(tag)), tag_table)
        # create a tag for the first line
        tag_header = buffer.create_tag("first-line",
                                       weight = pango.WEIGHT_BOLD,
                                       pixels_above_lines=6)
        msg = _("There is no matching application available.")
        iter = buffer.get_start_iter()
        buffer.insert_with_tags_by_name(iter, msg, "first-line")
        # If the filter combobox is available and the current filter is not a
        # primary filter we suggest to choose a primary filter 
        if self.combobox_filter.get_property("visible") == True:
            if self.menu.filter == SHOW_ONLY_INSTALLED or \
               self.menu.filter in self.distro.filters_secondary.keys():
                if len(self.distro.filters_primary) == 1:
                    #TRANSLATORS: %s represents a filter name
                    msg = _("To broaden your search, choose "
                            "\"%s\".") % self.distro.filters_primary[self.distro.filters_primary.keys()[0]][0]
                elif len(self.distro.filters_primary) == 2:
                    #TRANSLATORS: %s represents a filter name
                    msg = _("To broaden your search, choose "
                            "\"%s\" or \"%s\".") % \
                          (self.distro.filters_primary[self.distro.filters_primary.keys()[0]][0],
                           self.distro.filters_primary[self.distro.filters_primary.keys()[1]][0])
                else:
                    #TRANSLATORS: Show refers to the Show: combobox
                    msg = _("To broaden your search, choose a different "
                            "\"Show\" item.")
                buffer.insert_with_tags(iter, "\n%s" % msg)
        if self.treeview_categories.get_property("visible") == True and \
           self.treeview_categories.get_cursor()[0] != (0,):
            #TRANSLATORS: All refers to the All category in the left list
            msg = "\n%s" % _("To broaden your search, choose "
                             "'All' categories.")
            buffer.insert_with_tags(iter, msg)
       
# Entry point for testing in source tree
if __name__ == '__main__':
    app = AppInstall(os.path.abspath("menu-data"),
                     os.path.abspath("data"),
                     sys.argv)
    gtk.main()
