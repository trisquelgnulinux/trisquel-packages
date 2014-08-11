
import Default

from AppInstall.Menu import SHOW_ALL, SHOW_ONLY_SUPPORTED, SHOW_ONLY_FREE, SHOW_ONLY_MAIN, SHOW_ONLY_PROPRIETARY, SHOW_ONLY_THIRD_PARTY, SHOW_ONLY_INSTALLED
from AppInstall.Util import *

import datetime
import locale

from gettext import gettext as _

class Distribution(Default.Distribution):

    def __init__(self):
        Default.Distribution.__init__(self)
        # Dictonary of all available filters with corresponding choser name
        # and tooltip
        # The installed filter will be automatically added in non-installer mode
        # The primary and secondary filters are separated
        self.filters_primary = {
            SHOW_ALL : (_("All available applications"), ""),
            SHOW_ONLY_FREE : (_("All Open Source applications"), ""),
            }
        self.filters_secondary = {
            SHOW_ONLY_SUPPORTED : (_("Canonical-maintained applications"), ""),
            SHOW_ONLY_THIRD_PARTY :(_("Third party applications"), ""),
            }
        # List of components whose applications should not be installed
        # before asking for a confirmation
        self.components_ask = ["universe", "multiverse"]
        # Dictonary that provides dialog messages that are shown,
        # before a component gets activated or when it requires to be confirmed
        self.components_activation = {
            # Fallback
            None : [_("Enable the installation of software from the %s "
                      "component of Ubuntu?"),
                    # %s is the name of the component
                    _("%s is not officially supported with security "
                      "updates.")],
            "main" : [_("Enable the installaion of officially "
                        "supported Ubuntu software?"),
                      # %s is the name of the application
                      _("%s is part of the Ubuntu main distribution. "
                        "Canonical Ltd. provides support and security "
                        "updates, which will be enabled too.")],
            "universe" : [_("Enable the installation of community maintained "
                            "software?"),
                          # %s is the name of the application
                          _("%s is maintained by the Ubuntu community. "
                            "The Ubuntu community provides support and "
                            "security updates, which will be enabled too.")],
            "multiverse" : [_("Enable the installation of unsupported and "
                              "restricted software?"),
                            # %s is the name of the application
                            _("The use, modification and distribution of %s "
                              "is restricted by copyright or by legal terms in "
                              "some countries.")]
              }

        self.dependencies_map = [
            # KDE
            (("kdelibs5","python-kde4","libqtgui4"),
            # %s is the name of an application
             None,
             "application-kde"),
            # GNOME
            (("libgnome2-0","python-gnome2","libgtk2.0-0","python-gtk2"),
            # %s is the name of an application
             None, 
             "application-gnome"),
            # XUBUNTU
            # FIXME: get an icon from xubuntu
            (("libxfce4util4",),
            # %s is the name of an application
             None,
             None)]

        self.comp_depend_map = { "universe":["main"],
                                 "multiverse":["main", "universe"]}

    def get_app_emblems(self, app, cache):
        # A short statement about the freedom, legal status and level of
        # support of the application
        emblems = []
        icon_name = None
        tooltip = None
        if app.channel.endswith("-partner") and app.supported:
            tooltip = _("%s is provided by a third party vendor "
                        "from the Canonical partner repository.") % app.name
            icon_name = "application-partner"
            emblems.append((icon_name, tooltip))
        elif app.component == "main" or app.supported:
            tooltip = _("Canonical Ltd. provides technical support and "
                        "security updates for %s") % app.name
            icon_name = "application-supported"
            emblems.append((icon_name, tooltip))
        elif app.thirdparty or app.channel:
            tooltip = ("%s is provided by a third party vendor "
                       "and is therefore not an official part "
                       "of Ubuntu. The third party vendor is "
                       "responsible for support and security "
                       "updates.") % app.name
            icon_name = "application-proprietary"
            emblems.append((icon_name, tooltip))
        if app.component == "universe":
            tooltip =_("This application is provided by the "
                       "Ubuntu community.")
            icon_name = "application-community"
            emblems.append((icon_name, tooltip))
        if app.component == "multiverse" or app.thirdparty:
            tooltip = _("The use, modification and distribution "
                        "of %s is restricted by copyright or by "
                        "legal terms in some countries.") % app.name
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
        icon_name = None
        tooltip = None
        return emblems

    def get_codec_information_link(self):
        url = "https://codecs.canonical.com"
        label = _("Buy Licensed Plug-ins...")
        return (label, url)

    def get_maintenance_status(self, app, cache):

        # try to figure out the support dates of the release and make
        # sure to look only for stuff in "Ubuntu" and "distro_codename"
        # (to exclude stuff in ubuntu-updates for the support time 
        # calculation because the "Release" file time for that gets
        # updated regularly)
        releasef = get_release_filename_for_pkg(cache, app.pkgname, 
                                                "Ubuntu", self.get_codename())
        time_t = get_release_date_from_release_file(releasef)
        # check the release date and show support information
        # based on this
        if time_t:
            release_date = datetime.datetime.fromtimestamp(time_t)
            #print "release_date: ", release_date
            now = datetime.datetime.now()
            release_age = (now - release_date).days
            #print "release age: ", release_age

            # mvo: we do not define the end date very precisely
            #      currently this is why it will just display a end
            #      range
            (support_end_year, support_end_month) = get_maintenance_end_date(release_date, 18)
            support_end_month_str = locale.nl_langinfo(getattr(locale,"MON_%d" % support_end_month))
             # check if the support has ended
            support_ended = (now.year >= support_end_year and 
                             now.month > support_end_month)
            if app.component == "main":
                if support_ended:
                    return _("Canonical does no longer provide "
                             "updates for %s in Ubuntu %s. "
                             "Updates may be available in a newer version of "
                             "Ubuntu.") % (app.name, self.get_distro_release())
                else:
                    return _("Canonical provides critical updates for "
                             "%(appname)s until %(support_end_month_str)s "
                             "%(support_end_year)s.") % {'appname' : app.name,
                                                         'support_end_month_str' : support_end_month_str,
                                                         'support_end_year' : support_end_year}
            elif app.component == "restricted":
                if support_ended:
                    return _("Canonical does no longer provide "
                             "updates for %s in Ubuntu %s. "
                             "Updates may be available in a newer version of "
                             "Ubuntu.") % (app.name, self.get_distro_release())
                else:
                    return _("Canonical provides critical updates supplied "
                             "by the developers of %(appname)s until "
                             "%(support_end_month_str)s "
                             "%(support_end_year)s.") % {'appname' : app.name,
                                                         'support_end_month_str' : support_end_month_str,
                                                         'support_end_year' : support_end_year}
               

        return _("") % app.name

