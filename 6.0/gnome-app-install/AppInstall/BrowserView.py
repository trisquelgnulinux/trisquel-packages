# (c) 2005 Canonical, GPL


import gtk
#import gtkhtml2
import urllib
import urlparse
import gobject
import time
import subprocess

class BrowserView(object):
    """ abstract browser interface for AppInstall, the requirements are
        very light, it must only support loading a html page for now
     """
    def loadUri(self, uri):
        pass

class DumpBrowserView(gtk.ScrolledWindow):
    def __init__(self):
        gtk.ScrolledWindow.__init__(self)
        self.set_policy(gtk.POLICY_AUTOMATIC, gtk.POLICY_AUTOMATIC)
        self.set_shadow_type(gtk.SHADOW_IN)
        self.view = gtk.TextView()
        self.add(self.view)
        self.view.show_all()
    def loadUri(self,uri):
        parts = urlparse.urlparse(uri)
        if parts[0] != "file":
            return False
        f = open(parts[2])
        buf = self.view.get_buffer()
        buf.set_text(f.read())
        return True

# import gtkmozembed
# class MozEmbedBrowserView(gtkmozembed.MozEmbed):
#     def __init__(self):
#         gtkmozembed.MozEmbed.__init__(self)
#     def loadUri(self, uri):
#         self.load_url(uri)
        

class GtkHtml2BrowserView(gtk.ScrolledWindow):
    __gsignals__ = {
        'submit': (gobject.SIGNAL_RUN_LAST,
                     gobject.TYPE_NONE,
                     (gobject.TYPE_STRING,
                      gobject.TYPE_STRING,
                      gobject.TYPE_STRING))
        }

    # FIXME: this stuff is not threaded
    # the problem is that for threading and/or async read support
    # we need a URLOpener() that returns a object that can do
    # async read()
    # To do this, we need a e.g. GnomeVfsWorker that reacts on
    # read(), keeps the gtk_stuff runing and can be canceled

    def __init__(self):
        gtk.ScrolledWindow.__init__(self)
        self.set_policy(gtk.POLICY_AUTOMATIC, gtk.POLICY_AUTOMATIC)
        self.set_shadow_type(gtk.SHADOW_IN)
        self.view = gtkhtml2.View()
        self.view.show()
        self.currentUri = None
        self._opener = urllib.FancyURLopener()
        self.document = gtkhtml2.Document()
        self.document.connect('request_url', self._request_url)
        self.view.set_document(self.document)
        self.add(self.view)
        self.document.connect('link_clicked', self.linkClicked)
        self.document.connect('submit', self.submit)

    def linkClicked(self, document, link):
        subprocess.Popen(["/usr/bin/gnome-open",link])

    def submit(self, document, action, method, value):
        """A html form in the app description is used to add required
           repositories. So send the corresponding signal"""
        self.emit("submit", action, method, value)

    def loadUri(self, uri):
        #print "loadUri(%s)" % uri
        self.content = None
        if uri == "about:blank":
            self.document.clear()
            return

        # load it
        try:
            f = self._open_uri(uri)
        except (OSError, IOError):
            print "failed to open", uri
            self.content = _("Failed to open '%s'") % uri
            return
        self.currentUri = self._resolve_uri(uri)
        self.headers = f.info()
        self.content = f.read()
        self.document.open_stream('text/html')
        self.document.write_stream(self.content)
        self.document.close_stream()
        
    def _open_uri(self, uri):
        #print "_resolv_uri: %s " % uri
        uri = self._resolve_uri(uri)
        return self._opener.open(uri)
    def _resolve_uri(self, uri):
        if self._is_relative_to_server(uri):
            return urlparse.urljoin(self.currentUri, uri)
        return uri
    def _request_url(self, document, url, stream):
        f = self._open_uri(url)
        stream.write(f.read())
    def _is_relative_to_server(self, url):
        parts = urlparse.urlparse(url)
        if parts[0] or parts[1]:
            return False
        return True

gobject.type_register(GtkHtml2BrowserView)


if __name__ == "__main__":
    win = gtk.Window()

    view = GtkHtml2BrowserView()
    view.set_size_request(600,400)
    win.add(view)
    win.show_all()
    view.loadUri("http://www.skype.com/company/legal/eula/")


    gtk.main()
