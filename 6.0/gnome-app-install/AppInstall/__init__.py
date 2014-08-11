# Install gettext as _ into the built-in namespace.
import gettext as _gettext
gettext = _gettext.translation('gnome-app-install', fallback=True)
gettext.install()
