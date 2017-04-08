# DERIVATES: Please provide your own distro class and patch this statement
import os
from subprocess import Popen, PIPE
from Default import Distribution as _default

def get_distro():
    """
    Returns a distribution class instance that contains information and methods
    corresponding to the used distribution.

    You can override the chosen distribution by setting the environment
    variable 'DISTRO' to the name of a module in AppInstall.distros.
    """
    distributor = os.getenv('DISTRO', get_lsb_distributor())
    try:
        module = __import__("AppInstall.distros." + distributor, fromlist=["*"])
        return module.Distribution()
    except ImportError:
        return _default()

def get_lsb_distributor():
    """Return the distributor ID as received from lsb_release."""
    try:
        res = Popen(["lsb_release", "-s", "-i"], stdout=PIPE).communicate()[0]
        return res.strip()
    except OSError:
        return 'Trisquel'
