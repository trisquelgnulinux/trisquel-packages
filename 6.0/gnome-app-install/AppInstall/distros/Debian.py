from AppInstall.distros import Default
from AppInstall.Menu import SHOW_ALL


class Distribution(Default.Distribution):

    def __init__(self):
        Default.Distribution.__init__(self)
        # Dictonary of all available filters with corresponding choser name
        # and tooltip
        # The installed filter will be automatically added in non-installer mode
        # The primary and secondary filters are separated
        self.filters_primary = {
            SHOW_ALL : (_("All available applications"), ""),
            }
        self.filters_secondary = {}
        # List of components whose applications should not be installed
        # before asking for a confirmation
        self.components_ask = ["contrib", "non-free"]
        # Dictonary that provides dialog messages that are shown,
        # before a component gets activated or when it requires to be confirmed
        self.components_activation = {
            # Fallback
            None : [_("Enable the installation of software from %s?"),
                    # %s is the name of the component
                    _("%s is not officially supported with security "
                      "updates.")],
            "main" : [_("Enable the installation of officially "
                        "supported Debian software?"),
                      # %s is the name of the application
                      _("%s is part of the Debian distribution. "
                        "Debian provides support and security "
                        "updates, which will be enabled too.")],
        }

        self.dependencies_map = [
            # KDE
            (("kdelibs5","python-kde4","libqtgui4"),None,"application-kde"),
            # GNOME
            (("libgnome2-0","python-gnome2","libgtk2.0-0","python-gtk2"),
             None,"application-gnome"),
            # XFCE (FIXME: get an icon)
            (("libxfce4util4",),None,None)
        ]

        self.comp_depend_map = { "contrib":["main","non-free"],
                                 "non-free": ["main"]}

    def get_app_emblems(self, app, cache):
        # A short statement about the freedom, legal status and level of
        # support of the application
        emblems = []
        icon_name = None
        tooltip = None
        if app.component == "main":
            tooltip = _("Debian provides support and security updates for"
                        " %s") % app.name
            icon_name = "application-supported"
            emblems.append((icon_name, tooltip))
        else:
            tooltip = _("%s is not an official part of Debian.") % app.name
            icon_name = "application-proprietary"
            emblems.append((icon_name, tooltip))

        # Add an emblem corresponding to the dependencies of the app
        if cache.has_key(app.pkgname):
            for (deps, tooltip, icon_name) in self.dependencies_map:
                for dep in deps:
                    if cache.pkgDependsOn(app.pkgname, dep):
                        if type(tooltip) == str:
                            tooltip = tooltip % app.name
                        emblems.append((icon_name, tooltip))
                        break
        return emblems

    def get_codec_information_link(self):
        return (None,None)

    def get_maintenance_status(self, app, cache):
        return ""

    def get_progress_label(self):
        return _("<big><b>Checking installed and available applications</b>"
                 "</big>\n\n"
                 "Debian offers you a large variety of applications that you "
                 "can install on your system.")
