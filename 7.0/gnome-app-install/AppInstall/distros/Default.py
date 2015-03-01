from AppInstall.Menu import SHOW_ALL, SHOW_ONLY_SUPPORTED, SHOW_ONLY_FREE, SHOW_ONLY_MAIN, SHOW_ONLY_PROPRIETARY, SHOW_ONLY_THIRD_PARTY, SHOW_ONLY_INSTALLED

import subprocess

class Distribution(object):
    def __init__(self):
        # Dictonary of all available filters with corresponding choser name
        # and tooltip
        # The installed filter will be automatically added in non-installer mode
        # The primary and secondary filters are separated
        self.filters_primary = {
            SHOW_ALL : (_("All"),"")
            }
        self.filters_secondary = {}
        # List of components whose applications should not be installed
        # before asking for a confirmation
        self.components_ask = []
        # Dictonary that provides dialog messages that are shown,
        # before a component gets activated or when it requires to be confirmed
        self.components_activation = {
            None : [_("Enable the installation of software from the %s "
                      "component of your Distribution?"),
                    _("%s is not officially supported with security "
                      "updates.")],
              }
        self.dependencies_map = []
        self.comp_depend_map = {}

    def get_components_ask(self):
        """
        Returns a list of components whose applications should not be installed
        before asking for a confirmation
        """
        return self.components_ask

    def get_codec_information_link(self):
        """
        Returns a link and a description to additional codec releated
        information or possibilities, e.g. a link to a petition against
        software patents or a shop to purchase codecs, just as the distro
        pleases
        """
        return (None, None)

    def get_components_ask_msgs(self):
        """
        Returns a dictonary that provides dialog messages that are shown,
        before a component gets activated or when it requires to be confirmed
        """ 
        return self.components_activation

    def get_codename(self):
        """
        Return the distribution codename of the current running distro
        as returned by lsb_release
        """
        if not hasattr(self ,"codename"):
            self.codename = subprocess.Popen(["lsb_release","-c","-s"],stdout=subprocess.PIPE).communicate()[0].strip()
        return self.codename

    def get_distro_release(self):
        """
        Return the distribution release of the current running distro
        as returned by lsb_release
        """
        if not hasattr(self ,"distro_release"):
            self.distro_release = subprocess.Popen(["lsb_release","-r","-s"],stdout=subprocess.PIPE).communicate()[0].strip()
        return self.distro_release

    def get_maintenance_status(self, app, cache):
        """ 
        return a string that gives information about the mainainance
        status of the the given app
        """
        return ""

    def get_comp_dependencies(self, comp):
        if self.comp_depend_map.has_key(comp):
            return self.comp_depend_map[comp]
        else:
            return []

    def get_app_emblems(self, app, cache):
        return []

    def get_progress_label(self):
        return _("<big><b>Checking installed and available applications</b></big>"+"\n")

if __name__ == "__main__":
    d = Distribution()
    print "code: '%s'" % d.get_codename()
