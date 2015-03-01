import gtk
from ReleaseNotesViewer import ReleaseNotesViewer

import re
import urllib
import pango
import gobject

# The URL to a debshots instance (without trailing '/')
DEBSHOTS = "http://screenshots.debian.net"


def show_big_screenshot(eventbox, event, pkgname):
    """Show a big screenshot, in a window."""        
    res = urllib.urlretrieve("%s/screenshot/%s" % (DEBSHOTS, pkgname))
    # %s is the name of the package.
    win = gtk.Dialog(_("Screenshot of %s") % pkgname)
    image = gtk.image_new_from_file(res[0])
    image.show()
    win.vbox.add(image)
    win.add_button(gtk.STOCK_CLOSE, gtk.RESPONSE_CLOSE)
    win.run()
    win.destroy()

class AppDescView(ReleaseNotesViewer):
    def __init__(self):
        ReleaseNotesViewer.__init__(self)
        self.set_wrap_mode(gtk.WRAP_WORD)
        self.set_pixels_below_lines(3)
        self.set_right_margin(6)
        self.set_left_margin(6)
        atk_desc = self.get_accessible()
        atk_desc.set_name(_("Description"))

    def hook(self, cache, menu, icons, tooltips, distro):
        self.cache = cache
        self.menu = menu
        self.icons = icons
        self.tooltips = tooltips
        self.distro = distro

    def show_thumb(self, button, anchor, pkgname):
        """Show a thumbnail."""
        # TODO: Run in a parallel thread to not lock the UI.
        button.hide()
        res = urllib.urlretrieve("%s/thumbnail/%s" % (DEBSHOTS, pkgname))
        event = gtk.EventBox()
        image = gtk.image_new_from_file(res[0])
        event.connect("button-press-event", show_big_screenshot, pkgname)
        event.add(image)
        event.show_all()
        self.add_child_at_anchor(event, anchor)

    def show_description(self, item):
        """Collect and show some information about the package that 
           contains the selected application"""
        details = []
        clean_desc = ""
        short_desc = ""
        version = ""
        desktop_environment = ""
        icons = []
        homepage = ""
        style = self.get_style()

        
        if self.menu.itemAvailable(item):
            pkg = self.cache[item.pkgname]
            # Get the candidate version (fallback to pkg for older python-apt)
            candidate = getattr(pkg, 'candidate', pkg)
            homepage = candidate and candidate.homepage
            short_desc = candidate and candidate.summary
            clean_desc = self.cache[item.pkgname].versions[0].description
            
            if not clean_desc:
                clean_desc = item.comment
        else:
            msg = _("%s cannot be installed" % item.name)
            # check if we have seen the component
            for it in self.cache._cache.FileList:
                # FIXME: we need to exclude cdroms here. the problem is
                # how to detect if a PkgFileIterator is pointing to a cdrom
                if (it.Component != "" and it.Component == item.component) or\
                   (item.architectures and \
                    not self.cache.getArch() in item.architectures):
                    # warn that this app is not available on this plattform
                    details.append(_("%s cannot be installed on your "
                                     "computer type (%s). Either the "
                                     "application requires special "
                                     "hardware features or the vendor "
                                     "decided to not support your "
                                     "computer type.") % (item.name, 
                                     self.cache.getArch()))
                    break
            # check if it comes from a third party repository and
            # display message then
            if item.channel:
                details.append(_("%s is available in the third party software " 
                                 "channel '%s'. To install it, please "
                                 "click on the checkbox to activate the "
                                 "software channel.") % 
                               (item.name, item.channel))

        # mutliple apps per pkg check
        s = ""
        if self.menu.pkg_to_app.has_key(item.name) and \
           len(self.menu.pkg_to_app[item.name]) > 1:
            s = _("This application is bundled with "
                  "the following applications: ")
            apps = self.menu.pkg_to_app[item.name]
            s += ", ".join([pkg.name for pkg in apps])
            details.append(s)

        # init the textview that shows the description of the app
        buffer = self.get_buffer()
        buffer.set_text("")
        # remove all old tags
        tag_table = buffer.get_tag_table()
        tag_table.foreach((lambda tag, table: table.remove(tag)), tag_table)
        iter = buffer.get_start_iter()
        # we need the default font size for the vertically justification
        pango_context = self.get_pango_context()
        font_desc = pango_context.get_font_description()
        font_size = font_desc.get_size() / pango.SCALE
        if item.iconname == "":
            # justify the icon and the app name
            if font_size * pango.SCALE_LARGE > 32:
                icon_size = 32
                adjust_vertically = 0
            elif font_size * pango.SCALE_LARGE < 10:
                icon_size = 24
                adjust_vertically = (icon_size - font_size * pango.SCALE_LARGE)\
                                    /2
            else:
                icon_size = 32
                adjust_vertically = (icon_size - font_size * pango.SCALE_LARGE)\
                                    / 2
            tag_name = buffer.create_tag("app-icon",
                                         right_margin=6,
                                         pixels_above_lines=6)
            tag_name = buffer.create_tag("app-name",
                                         rise=adjust_vertically * pango.SCALE,
                                         pixels_above_lines=6,
                                         weight=pango.WEIGHT_BOLD,
                                         scale=pango.SCALE_LARGE)
            try:
                icon_pixbuf = self.icons.load_icon(item.iconname, icon_size, 0)
            except gobject.GError:
                try:
                    icon_pixbuf = self.icons.load_icon("applications-other", 
                                                       icon_size, 0)
                except gobject.GError:
                    icon_pixbuf = self.icons.load_icon(gtk.STOCK_MISSING_IMAGE,
                                                       icon_size, 0)
            buffer.insert_pixbuf(iter, icon_pixbuf)
            (start_iter, end_iter,) = buffer.get_bounds()
            buffer.apply_tag_by_name("app-icon", start_iter, end_iter)
            buffer.insert_with_tags_by_name(iter, " %s" % item.name, "app-name")
        else:
            tag_name = buffer.create_tag("app-name",
                                         weight=pango.WEIGHT_BOLD,
                                         pixels_above_lines=6,
                                         scale=pango.SCALE_LARGE)
            buffer.insert_with_tags_by_name(iter, "%s" % item.name, "app-name")

        emblems = self.distro.get_app_emblems(item, self.cache)
        if short_desc == "": 
            tag_name = buffer.create_tag("short-desc",
                                         weight=pango.WEIGHT_BOLD)
            buffer.insert_with_tags_by_name(iter,
                                            "\n%s" % short_desc,
                                            "short-desc")
            for emblem in emblems:
                # not all emblems have got an icon
                if not emblem[0]:
                    continue
                image_emblem = gtk.Image()
                image_emblem.set_from_icon_name(emblem[0],
                                                gtk.ICON_SIZE_MENU)
                image_emblem.set_pixel_size(16)
                event = gtk.EventBox()
                # use the base color of the textview for the image
                # FIXME: send the selected signal from the anchor 
                #        to the widget
                for state in [gtk.STATE_NORMAL, gtk.STATE_ACTIVE,
                              gtk.STATE_PRELIGHT, gtk.STATE_SELECTED,
                              gtk.STATE_INSENSITIVE]:
                    event.modify_bg(state,
                                    style.base[state])
                event.add(image_emblem)
                if emblem[1] != None:
                    self.tooltips.set_tip(event, emblem[1])
                buffer.insert(iter, " ")
                anchor = buffer.create_child_anchor(iter)
                self.add_child_at_anchor(event,
                                         anchor)
                event.show()
                image_emblem.show()

        buffer.insert(iter,"\n")
        anchor = buffer.create_child_anchor(iter)
        button = gtk.Button(_("Screenshot"))
        self.add_child_at_anchor(button, anchor)
        button.connect("clicked", self.show_thumb, anchor, item.pkgname)
        button.show()
        
        if clean_desc != "": 
            buffer.insert(iter, "\n%s" % clean_desc)
        if homepage:
            buffer.insert(iter, _("\nHomepage: %s\n") % homepage)
        if version != "":
            buffer.insert(iter, _("Version: %s (%s)") % (version, item.pkgname))
        if len(details) > 0:
            for x in details:
                buffer.insert(iter, "\n%s" % x)
        # add maintenance status
        #buffer.insert(iter, " ")
        #anchor = buffer.create_child_anchor(iter)
        #foo = gtk.Frame(self.distro.get_maintenance_status(item, self.cache))
        #foo.show()
        #self.add_child_at_anchor(foo, anchor)
        #buffer.create_tag("maint-status", 
        #                  scale_set=True,
        #                  scale=pango.SCALE_SMALL,
        #                  foreground="#888")
        #                  foreground_gdk=style.base[gtk.STATE_INSENSITIVE])
        #m = self.distro.get_maintenance_status(item, self.cache)
        #buffer.insert_with_tags_by_name(iter, "\n%s" % m, "maint-status")

    def show_message(self, header, msg):
        """ Show a quick introduction to gnome-app-install 
            in the description view"""
        buffer = self.get_buffer()
        buffer.set_text("")
        iter = buffer.get_start_iter()
        tag_header = buffer.get_tag_table().lookup("header")
        if not tag_header:
            tag_header = buffer.create_tag("header",
                                           scale = pango.SCALE_LARGE,
                                           weight = pango.WEIGHT_BOLD,
                                           pixels_above_lines=6)
        if header:
            buffer.insert_with_tags(iter, "%s\n" % header, 
                                    tag_header)
        buffer.insert(iter, msg)

    def clear_description(self):
        buffer = self.get_buffer()
        buffer.set_text("")
