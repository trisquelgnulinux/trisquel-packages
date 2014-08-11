import pango
import gtk
import gobject
(COL_CAT_NAME,
 COL_CAT_ITEM) = range(0,2)


from math import log
from xml.sax.saxutils import escape

def xmlescape(s):
    if s==None:
        return ""
    else:
        return escape(s)

# Columns of the packages store
(COL_NAME,
 COL_ITEM,
 COL_POPCON) = range(3)

(STYLE_ALL, STYLE_DESC, STYLE_INSTALL) = range(3)

class AppListView(gtk.TreeView, gobject.GObject):
    __gsignals__ = {"toggled":(gobject.SIGNAL_RUN_FIRST,
                               gobject.TYPE_NONE,
                               (gobject.TYPE_PYOBJECT,))}
    def __init__(self, cache=None, menu=None, icons=None, style=STYLE_ALL):
        self.cache = cache
        self.menu = menu

        self.desc_cache = {}

        self.__gobject_init__()
        gtk.TreeView.__init__(self)
        self.set_rules_hint(True)
        if icons == None:
            self.icons = gtk.icon_theme_get_default()
        else:
            self.icons = icons
        # Add a fake liststore to the packages list, so that the headers
        # are already seen during start up
        fake_applications = gtk.ListStore(gobject.TYPE_INT,
                                          gobject.TYPE_STRING,
                                          gobject.TYPE_PYOBJECT,
                                          gobject.TYPE_INT)
        fake_applications.set_sort_column_id(COL_NAME, gtk.SORT_ASCENDING)
        self.set_model(fake_applications)

        self.stars = self._get_stars()

        # popcon renderer
        renderer_popcon = gtk.CellRendererPixbuf()
        renderer_popcon.set_property("xpad", 4)
        column_app_popcon = gtk.TreeViewColumn(_("Popularity"), 
                                               renderer_popcon)
        column_app_popcon.set_sizing(gtk.TREE_VIEW_COLUMN_FIXED)
        column_app_popcon.set_sort_column_id(COL_POPCON)
        column_app_popcon.set_cell_data_func(renderer_popcon, 
                                             self._popcon_view_func)
        column_app_popcon.set_fixed_width(108)
        self.column_app_popcon = column_app_popcon

        # check boxes
        renderer_status = gtk.CellRendererToggle()
        renderer_status.connect('toggled', self._on_toggled)
        renderer_status.set_property("xalign", 0.5)
        renderer_status.set_property("yalign", 0.5)
        column_app_status = gtk.TreeViewColumn("")
        column_app_status.set_sizing(gtk.TREE_VIEW_COLUMN_FIXED)
        column_app_status.pack_start(renderer_status, False)
        column_app_status.set_cell_data_func (renderer_status, 
                                              self._toggle_cell_func)
        # FIXME: we need to react on theme changes
        width = renderer_status.get_size(self)[2] + 8
        column_app_status.set_fixed_width(width)

        # Application column (icon, name, description)
        column_app = gtk.TreeViewColumn(_("Application"))
        column_app.set_sizing(gtk.TREE_VIEW_COLUMN_FIXED)
        column_app.set_expand(True)
        column_app.set_sort_column_id(COL_NAME)
        # The icon
        renderer_app_icon = gtk.CellRendererPixbuf()
        column_app.pack_start(renderer_app_icon, False)
        column_app.set_cell_data_func(renderer_app_icon, 
                                      self._icon_cell_func)
        # app name and description
        renderer_app = gtk.CellRendererText()
        renderer_app.set_property("ellipsize", pango.ELLIPSIZE_END)
        column_app.pack_start(renderer_app, True)
        column_app.set_cell_data_func(renderer_app, 
                                      self._package_view_func)

        if style == STYLE_ALL:
            self.append_column(column_app_status)
            self.append_column(column_app)
            self.append_column(column_app_popcon)
        elif style == STYLE_DESC:
            self.append_column(column_app)
        elif style == STYLE_INSTALL:
            self.append_column(column_app_status)
            self.append_column(column_app)

        self.set_fixed_height_mode(True)

    def hook(self, cache, menu):
        self.cache = cache
        self.menu = menu

    def _get_stars(self):
        """
        Return a prerendered list of rating stars pixbufs
        """
        stars = []
        try:
            pixbuf_star = self.icons.load_icon("gnome-app-install-star", 16, 0)
        except gobject.GError:
            pixbuf_star = self.icons.load_icon(gtk.STOCK_MISSING_IMAGE, 16, 0)
        for i in range(5):
            starlets = gtk.gdk.Pixbuf(gtk.gdk.COLORSPACE_RGB, True,
                                     8, 96, 16) # depth, width, height
            starlets.fill(0x0)
            for l in range(i+1):
                pixbuf_star.copy_area(0,0,        # from
                                      16,16,      # size
                                      starlets,   # to-pixbuf
                                      20 * l, 0)  # dest
            stars.append(starlets)
        return stars

    def _popcon_view_func(self, cell_layout, renderer, model, iter):
        """
        Create a pixmap showing a row of stars representing the popularity
        of the corresponding application
        """
        (name, item, popcon) = model[iter]
        rank = 0
        if item.popcon > 0:
            rank = int(5 * log(item.popcon) / log(self.menu.popcon_max + 1))
        renderer.set_property("pixbuf", self.stars[rank])

    def _package_view_func(self, cell_layout, renderer, model, iter):
        app = model.get_value(iter, COL_ITEM)
        app_name = model.get_value(iter, COL_NAME)
        if self.desc_cache.has_key(app_name):
            (name, desc) = self.desc_cache[app_name]
        else:
            name = xmlescape(app.desktop_entry.getName())
            desc = xmlescape(app.desktop_entry.getComment())
            # KDE stores the comment in the GerneicName
            if desc == "":
                desc = xmlescape(app.desktop_entry.get('GenericName'))
            self.desc_cache[app_name] = (name, desc)
        if self.menu:
            future = app.toInstall
            current = self.menu.itemIsInstalled(app)
        else:
            future = None
            current = None

        if current != future:
            markup = "<b>%s</b>\n<small><b>%s</b></small>" % (name, desc)
        else:
            markup = "%s\n<small>%s</small>" % (name, desc)
        renderer.set_property("markup", markup)

    def _toggle_cell_func(self, column, cell, model, iter):
        menuitem = model.get_value(iter, COL_ITEM)
        cell.set_property("active", menuitem.toInstall)
        if menuitem.architectures and \
           self.cache.getArch() not in menuitem.architectures:
            cell.set_property("activatable", False)
        else:
            cell.set_property("activatable", True)

    def _icon_cell_func(self, column, cell, model, iter):
        menuitem = model.get_value(iter, COL_ITEM)
        if menuitem == None or menuitem.iconname == None:
            cell.set_property("pixbuf", None)
            cell.set_property("visible", False)
            return
        try:
            icon = self.icons.load_icon(menuitem.iconname, 24, 0)
            # work around bug #209072 even if we ask for a 24px
            # icon, we sometimes get outrages big ones - 256x256
            if icon and (icon.get_height() > 24 or icon.get_width() > 24):
                #print "WARNING: scaling down ", menuitem.iconname
                icon = icon.scale_simple(24,24,gtk.gdk.INTERP_BILINEAR)
        except gobject.GError:
            try:
                icon = self.icons.load_icon("applications-other", 24, 0)
            except gobject.GError:
                icon = self.icons.load_icon(gtk.STOCK_MISSING_IMAGE, 24, 0)
        cell.set_property("pixbuf", icon)
        cell.set_property("visible", True)

    def _on_toggled(self, widget, path):
        model = self.get_model()
        (name, item, popcon) = model[path]
        self.emit("toggled", item)
