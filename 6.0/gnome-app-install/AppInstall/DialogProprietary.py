# (c) 2005 Canonical, GPL

from SimpleGtkbuilderApp import SimpleGtkbuilderApp
import gtk
import gobject
import os

from BrowserView import GtkHtml2BrowserView as BrowserView

class DialogProprietary(SimpleGtkbuilderApp):

    def __init__(self, datadir, parent, item):
        SimpleGtkbuilderApp.__init__(self,
                                     path=datadir+"/gnome-app-install.ui",
                                     root="dialog_proprietary")
        # Create the text of the dialog
        if item.isv:
            vendor = item.isv
        else:
            vendor = item.channel
        header = _("Enable the installation of software "
                   "from %s?") % vendor
        body = _("%s is provided by a third party vendor.") % item.name
        internet = _("You need a working internet connection to continue.")
        msg = "<b><big>%s</big></b>\n\n%s\n\n%s" % (header, body, internet)

        self.browser = BrowserView()
        self.vbox_custom.pack_start(self.browser)
        self.dialog_proprietary.set_transient_for(parent)
        self.dialog_proprietary.realize()
        self.dialog_proprietary.window.set_functions(gtk.gdk.FUNC_MOVE)
        self.label_proprietary.set_markup(msg)
        self.item = item
        self.button_add_channel.set_label(_("_Enable"))

    def run(self):
        if self.item.licenseUri:
            msg = self.label_proprietary.get_label()
            msg += "\n\n"
            msg += _("The application comes with the following license "
                     "terms and conditions. Click on the "
                     "'Enable' button to accept them:")
            self.label_proprietary.set_markup(msg)
            self.tooltips = gtk.Tooltips()
            self.tooltips.set_tip(self.button_add_channel, \
                                  _("Accept the license terms and install "\
                                    "the software"))
            self.browser.show()
            self.browser.loadUri(self.item.licenseUri)
        else:
            self.browser.hide()
        self.button_add_channel.grab_default()
        return self.dialog_proprietary.run()

    def hide(self):
        self.dialog_proprietary.hide()

if __name__ == "__main__":
    # test with e.g.
    # python DialogProprietary.py karmic-partner /usr/share/app-install/channels/karmic-partner.eula 
    #
    import sys

    class Item(object):
        pass
    
    item = Item()
    item.channel = sys.argv[1]
    item.licenseUri = sys.argv[2]
    item.isv = None
    item.name = "foo"
    dia = DialogProprietary("../data/", None, item)
    dia.run()
