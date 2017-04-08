# Copyright (C) 2004-2005 Ross Burton <ross@burtonini.com>
#               2005-2007 Canonical
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

import sys
import gdbm
import gconf
import errno
import os
import os.path

from optparse import OptionParser

class ActivationStyle:
    # Ideally this base class would be in AppInstall or Menu or some
    # such, but that would involve doing `import AppInstall' before we've
    # decided to actually run it, which is too slow for the time between a
    # user clicking on a file and us saying we can't open it.  So we have
    # a full one here and another smaller dummy version in Menu.py too.

    def __init__(self):
        self.selectFilter = None
        self.menuFilter = None
        self.isInstallerOnly = False

    def isSpecific(self):
        " return True if we are we in a not-normal mode "
        return False
    def menuCacheName(self):
        """ Each activation-mode can have a different cached menu
            This is useful for e.g. codec activation style because
            there are only very few codecs so it makes sense to read
            only the subset of the menu with codec information
        """
        return "menu.p"
    def searchTerms(self):
        return None
    def isApproved(self, component, package):
        return True
    def userApprovedNotify(self):
        pass
    def changesSuccessfulNotify(self):
        pass
    def quitHook(self):
        pass
    def modifyUserInterface(self, app):
        pass
    def getMenuFilter(self):
        return self._menu_filter
    def preRun(self):
        return True
    def autoClose(self):
        " auto close on successful install/remove "
        return False

class SearchActivationStyle(ActivationStyle):
    def __init__(self, dictname, options):
        self._dn = dictname
        self._cachedir = options.cachedir
        self._userapproved = False
        self._changessuccessful = False
        self.menuFilter = None

        # read the packages whitelist (from the files)
        dict = {}
        for d in (options.datadir, '/etc/gnome-app-install'):
            try: f = open(d+'/packages-whitelist')
            except IOError, e:
                if e.errno == errno.ENOENT: continue
                raise
            for l in f:
                v = l.strip()
                if v.startswith('#'): continue
                dict[v] = True
        self._wl_packages = dict

        # read the component whitelist (from gconf)
        try:
            client = gconf.client_get_default()
            l = client.get_list("/apps/gnome-app-install"+
                                "/mime-whitelist-components",
                                gconf.VALUE_STRING)
        except gobject.GError, e:
            # default to "main" if gconf is not available
            print "Error in gconf: %s" % e
            l = ["main"]
        dict = {}
        for v in l: dict[v] = True
        self._wl_components = dict

        db_name = self._cachedir+'/gai-'+self._dn+'-map.gdbm'
        self._db = gdbm.open(db_name, 'rfu')

    def menuCacheName(self):
        return "mime_menu.p"

    def lookup(self,string):
        # look up our entry and bomb if not found
        try: value = self._db[string]
        except KeyError: value = ''

        unapproved = False
        for e in value.split():
            (component,package) = e.split('/',1)
            if self.isApproved(component,package): return (True,True,None,None)
            unapproved = True

        if unapproved: (abbrev,msg) = (
            _("no suitable application"),
            _("No application suitable for automatic installation is"
              " available for handling this kind of file."))
        else: (abbrev,msg) = (
            _("no application found"),
            _("No application is known for this kind of file."))

        return (False, unapproved, abbrev, msg)

    def isApproved(self, component, package):
        return (self._wl_components.has_key(component) or
            self._wl_packages.has_key(package))
    def isSpecific(self): return True
    def userApprovedNotify(self): self._userapproved = True
    def changesSuccessfulNotify(self): self._changessuccessful = True
    def modifyUserInterface(self, app):
        app.scrolledwindow_left.hide()
        app.label_progress.set_markup("<big><b>%s</b></big>\n\n%s" %
                                      (_("Searching for appropriate "
                                         "applications"),
                                       _("Please wait. This might take a "
                                         "minute or two.")))

class CodecSearchActivationStyle(SearchActivationStyle):
    def __init__(self, options, args):
       SearchActivationStyle.__init__(self, 'codec', options)
       self._codecs = []
       self._args = args
       self.options = options
       # Points to the SHOW_ALL filter, importing Menu would take too much time
       self.menuFilter = 0
       self.isInstallerOnly = True

    def _parseArgs(self):
        " helper that tries to decode the commandline"
        for arg in self._args:
            # we get a string like this:
            #gstreamer.net|0.10|totem|DivX MPEG-4 Version 5 decoder|decoder-video/x-divx, divxversion=(int)5 (DivX MPEG-4 Version 5 decoder)
            try:
                (origin,version,app,descr,search_token) = arg.split("|")
            except ValueError, e:
                sys.stderr.write("invalid commandline '%s' (%s)\n" % (arg, e))
                return False
            self.addSearchTerm("%s:%s" % (version, search_token))
        return True
    
    def preRun(self):
        if self._parseArgs():
            if not askConfirmation(_("Search for suitable codec?"),
                            _("The required software to play this "
                              "file is not installed. You need to install "
                              "suitable codecs to play "
                              "media files. Do you want to search for a codec "
                              "that supports the selected file?\n\n"
                              "The search will also include software which is not "
                              "officially supported."),
                            self.options.transient_for):
                sys.exit(4)
        else:
            import gtk
            abbrev = _("Invalid commandline")
            msg = _("'%s' does not understand the commandline argument '%s'" % (sys.argv[0], self._args))
            dlg = gtk.MessageDialog(None,
                                    gtk.DIALOG_MODAL,
                                    gtk.MESSAGE_ERROR, gtk.BUTTONS_OK,
                                    abbrev)
            dlg.format_secondary_text(msg)
            dlg.run()
            dlg.destroy()
            sys.exit(1)
        return True

    def modifyUserInterface(self, app):
        import gtk
        import distros

        SearchActivationStyle.modifyUserInterface(self, app)

        app.textview_description.show_message("", 
          _("Some countries allow patents on software, and freely "
            "redistributable software like Ubuntu cannot pay for patent "
            "licenses. If you are in "
            "one of these jurisdictions, you can buy licensed media playback "
            "plug-ins from the Canonical Store. Otherwise, select a free "
            "plug-in above to install it."))
        app.button_help.hide()
        app.treeview_packages.set_headers_visible(False)
        app.treeview_packages.column_app_popcon.set_visible(False)

        #FIXME: second message needs some love
        app.label_progress.set_markup("<big><b>%s</b></big>\n\n%s" %
                                      (_("Searching for appropriate "
                                         "codecs"),
                                       _("Please wait. This might take a "
                                         "minute or two.")))
        app.hbox_search_show.hide()
        app.button_ok.set_label(_("_Install"))
        app.window_main.set_title(_("Install Media Plug-ins"))
        app.window_main.set_property("default_width", 500)
        app.window_main.set_property("default_height", 400)
        col = app.treeview_packages.get_column(1)
        col.set_title(_("Codec"))
        model = app.treeview_packages.get_model()
        model.set_sort_column_id(2, gtk.SORT_DESCENDING)
        # add codec link
        distro = distros.get_distro()
        (label, url) = distro.get_codec_information_link()
        if (label is not None) and (url is not None):
            button = gtk.Button(label)
            button.uri = url
            button.connect("clicked", self.uri_clicked)
            button.show()
            app.hbox_help.pack_end(button)

    def uri_clicked(self, button):
        import subprocess
        for opener in ["gnome-open", "sensible-browser", 
                       "xdg-open", "x-www-browser"]:
            for d in os.environ["PATH"].split(":"):
                if os.path.exists(os.path.join(d,opener)):
                    print "found ", opener
                    subprocess.call([opener,button.uri])
                    return

    def menuCacheName(self):
        return "codec_menu.p"

    def addSearchTerm(self, string):
        #print "addSearchTerm: ", string
        # we split the string here for the gstreamer caps support
        # we get something like:
        #  'decoder-video/x-indeo, indeoversion=(int)3'
        # and we will only compare the first bit as the later requires
        # more python-gst support and that is slow. but we want to
        # give the user fast results (even if we sometimes come up
        # with a window saying "no applications found"
        string = string.replace(", ",",")
        #Skip the description from the search token
        string = string.split(" ")[0]
        self._codecs.append(string)
        (ok,unapproved,abbrev,msg) = self.lookup(string.split(",")[0])
        if ok: return
        print >>sys.stderr, abbrev
        #sys.exit(9 - unapproved)
        sys.exit(1)
        
    def searchTerms(self): return self._codecs
    def selectFilter(self, menu): return menu._codecMatch

    def quitHook(self):
       if not self._userapproved:
               #print >>sys.stderr, _("additional codec installation declined")
               #sys.exit(3)
               sys.exit(4)
       if not self._changessuccessful:
               #print >>sys.stderr, _("additional codec installation failed")
               sys.exit(2)

    def autoClose(self):
        " auto close the app on successful codec installs "
        return True

class MimeSearchActivationStyle(SearchActivationStyle):
    def __init__(self, options, uri, duri):
        SearchActivationStyle.__init__(self, 'mime', options)
        self._uri = uri
        self._duri = duri
        self._string = options.mime_type
        self.isInstallerOnly = True

    def preRun(self):
        (ok,unapproved,abbrev,msg) = self.lookup(self._string)
        if ok: return True

        if self._uri:
            import gtk
            import os.path

            #TRANSLATORS: %s represents a file path
            header = _("\"%s\" cannot be opened") % os.path.basename(self._duri)
            dlg = gtk.MessageDialog(None, gtk.DIALOG_MODAL,
                gtk.MESSAGE_ERROR, gtk.BUTTONS_CLOSE, header)
            dlg.format_secondary_text(msg)
            dlg.set_title(header)
            dlg.run()
            dlg.destroy()
            print >>sys.stderr, abbrev
            sys.exit(6)
        else:
            print >>sys.stderr, "not offering packages for %s" % self._string
            if unapproved:
                print >>sys.stderr, "only unapproved: %s" % self._string
                sys.exit(5)
            else:
                print >>sys.stderr, "no entry in mime map"
                sys.exit(4)

    def searchTerms(self): return [self._string]
    def selectFilter(self, menu): return menu._mimeMatch

    def quitHook(self):
        if self._uri and self._changessuccessful:
            import gnomevfs
            gnomevfs.url_show(self._uri)

    def modifyUserInterface(self, app):
        import xdg.Mime
        import os.path
        import gtk
        mime = xdg.Mime.lookup(self._string)
        SearchActivationStyle.modifyUserInterface(self, app)
        app.label_progress.set_markup("<big><b>%s</b></big>\n\n%s" %
                                      (_("Searching for appropriate "
                                         "applications"),
                                       _("A list of applications that can "
                                         "handle documents of the type '%s' "
                                         "will be created") % mime.get_comment()))
        app.button_ok.set_label(_("_Install"))
        if self._uri:
            #TRANSLATORS: %s represents a file path
            app.window_main.set_title(_("Install applications to open \"%s\"")\
                                      % os.path.basename(self._duri))
        else:
            app.window_main.set_title(_("Install applications"))
        app.window_main.set_property("default_width", 500)
        model = app.treeview_packages.get_model()
        model.set_sort_column_id(2, gtk.SORT_DESCENDING)

def askConfirmation(summary, msg, transient_for=None):
    import gtk
    dlg = gtk.MessageDialog(None, gtk.DIALOG_MODAL,
                            gtk.MESSAGE_QUESTION, gtk.BUTTONS_CANCEL,
                            summary)
    dlg.format_secondary_text(msg)
    btn = dlg.add_button(_("_Search"), gtk.RESPONSE_YES)
    btn.grab_focus()
    if not transient_for:
        dlg.set_title(summary)
    if transient_for:
        parent = gtk.gdk.window_foreign_new(transient_for)
        if parent:
            dlg.realize()
            dlg.window.set_transient_for(parent)
    res = dlg.run()
    dlg.destroy()
    while gtk.events_pending():
        gtk.main_iteration()
    if res == gtk.RESPONSE_YES:
        return True
    return False

class XULExtensionsActivationStyle(MimeSearchActivationStyle):
    def __init__(self, options):
        MimeSearchActivationStyle.__init__(self, options, uri=None, duri=None)
        self._string = "application/x-debian-xul-extension-%s" % \
                       options.xul_extensions.lower()

    # all extensions are in universe but are maintained security wise by
    # the firefox team (see #267392)
    def isApproved(self, component, package):
        return True

    def quitHook(self):
        if self._changessuccessful:
            print >>sys.stderr, "changed extensions"
            sys.exit(0)
        else:
            print >>sys.stderr, "did not change anything"
            sys.exit(1)

    def modifyUserInterface(self, app):
        SearchActivationStyle.modifyUserInterface(self, app)
        app.label_progress.set_markup("<big><b>%s</b></big>\n\n%s" %
                                      (_("Searching for extensions"),
                                       _("Extensions allow you to add new "
                                         "features to your application.")))
        app.window_main.set_title(_("Install/Remove Extensions"))
        col = app.treeview_packages.get_column(1)
        col.set_title(_("Extension"))

    def preRun(self):
        return True

def main():
    parser = OptionParser()
    parser.add_option("", "--mime-type",
                      default=None,
                      action="store", type="string", dest="mime_type",
                      help="Show only applications that handle the given "
                           "file type")
    parser.add_option("", "--transient-for",
                      default=None,
                      action="store", type="int", dest="transient_for",
                      help="Start as a child window of the given window (Only "
                           "needed by developers")
    parser.add_option("", "--data-dir",
                      default="/usr/share/gnome-app-install",
                      action="store", type="string", dest="datadir",
                      help="Load data from the given directory (Only needed "
                           "by developers)")
    parser.add_option("", "--desktopdir",
                      default="/usr/share/app-install",
                      action="store", type="string", dest="desktopdir",
                      help="Read the desktop files from the given directory "
                           "(Only needed by developers)")
    parser.add_option("", "--cachedir",
                      default="/var/cache/app-install",
                      action="store", type="string", dest="cachedir",
                      help="Use the given directory for the cache (Only "
                           "needed by developers)")
    parser.add_option("", "--xul-extensions",
                      default=None,
                      action="store", type="string", dest="xul_extensions",
                      help="Start as installer for XUL extensions")
    parser.add_option("", "--addon-cd",
                      default=None,
                      action="store", type="string", dest="addon_cd",
                      help="Start as installer for an addon cd")
    parser.add_option("", "--selftest", action="store_true",
                      dest="selftest", help="Perform self tests (Only needed "
                                            "by developers)")
    parser.add_option("", "--profile", action="store", type="string",
                      dest="profile", default=None,
                      help="Store profiling data in the given file "
                           "(Only needed by developers)")
    parser.add_option("", "--test-mode", action="store_true", dest="test_mode",
                      help="Run in a sepcial test mode"
                           "(Only needed by developers)")
    (options, args) = parser.parse_args()

    if options.selftest:
        from AppInstall.AppInstallApp import AppInstallApp
        app = AppInstall(options, ActivationStyle())
        while True:
            model = app.treeview_packages.get_model()
            it = model.get_iter_root()
            (name, item, popcon) = model[it]
            app.applyChanges([item], [])

    # activation style
    if sys.argv[0].split("/")[-1] == "gstreamer-codec-install":
        style = CodecSearchActivationStyle(options, args)
    elif options.mime_type:
        #FIXME: What is an uri, duri?
        uri = None
        duri = None
        if len(args) > 1:
            uri = args[0]
            duri = args[1]
        elif len(args) > 0:
            uri = args[0]
            duri = uri
        style = MimeSearchActivationStyle(options, uri, duri)
    elif options.xul_extensions:
        style = XULExtensionsActivationStyle(options)
    else:
        style = ActivationStyle()

    if style.preRun():
        # We have already bombed out if the quick test fails.  We do this
        #  import only now so that quick tests are really quick.
        from AppInstall.AppInstallApp import AppInstallApp
        #FIXME: could be easily made simpler, talk with aptoncd author 
        #       before any api changes
        app = AppInstallApp(options, style)
        if options.profile:
            import hotshot
            prof = hotshot.Profile(options.profile)
            print prof.runcall(app.run)
            prof.close()
        else:
            app.run()
