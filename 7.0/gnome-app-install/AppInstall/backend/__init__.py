import os.path

def backend_factory(*args, **kwargs):
    " get a matching backend "
    # try the synaptic interface first
    if os.path.exists("/usr/sbin/synaptic"):
        import InstallBackendSynaptic
        return InstallBackendSynaptic.InstallBackendSynaptic(*args, **kwargs)
    else:
        raise Exception("No working backend found, please try installing synaptic or aptdaemon")

    # then aptdaemon
    if os.path.exists("/usr/sbin/aptd"):
        # check if the gtkwidgets are installed as well
        try:
            import aptdaemon.gtkwidgets
            import InstallBackendAptdaemon
            return InstallBackendAptdaemon.InstallBackendAptdaemon(*args, **kwargs)
        except ImportError, e:
            pass
