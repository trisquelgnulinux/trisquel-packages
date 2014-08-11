# (c) 2005-2007 Canonical, GPL
#

import apt_pkg
import subprocess
import gtk
import gtk.gdk
import thread
import time
import os
import tempfile

from InstallBackend import InstallBackend

class InstallBackendSynaptic(InstallBackend):
    """ Install backend based on synaptic """
    
    # synaptic actions
    (INSTALL, UPDATE) = range(2)

    def _run_synaptic(self, id, lock, to_add=None,to_rm=None, action=INSTALL):
        #apt_pkg.PkgSystemUnLock()
        #print "run_synaptic(%s,%s,%s)" % (id, lock, selections)
        cmd = []
        if os.getuid() != 0:
            cmd = ["/usr/bin/gksu",
                   "--desktop", "/usr/share/applications/synaptic.desktop",
                   "--"]
        cmd += ["/usr/sbin/synaptic",
                "--hide-main-window",
                "--non-interactive",
                "-o", "Synaptic::closeZvt=true",
                "--parent-window-id", "%s" % (id) ]

        # create tempfile for install (here because it must survive
        # durng the synaptic call
        f = tempfile.NamedTemporaryFile()
        if action == self.INSTALL:
            # setup the cdrom 
            if self.addon_cd:
                cmd += ["-o","Acquire::cdrom::mount=%s" % self.addon_cd]
            # install the stuff
            for item in to_add:
                f.write("%s\tinstall\n" % item)
                #print item.pkgname
            for item in to_rm:
                f.write("%s\tuninstall\n" % item)
            cmd.append("--set-selections-file")
            cmd.append("%s" % f.name)
            f.flush()
        elif action == self.UPDATE:
            #print "Updating..."
            cmd.append("--update-at-startup")
        self.return_code = subprocess.call(cmd)
        lock.release()
        f.close()

    def _perform_action(self, action, to_add=[], to_rm=[]):
        self.window_main.set_sensitive(False)
        self.window_main.window.set_cursor(gtk.gdk.Cursor(gtk.gdk.WATCH))
        lock = thread.allocate_lock()
        lock.acquire()
        t = thread.start_new_thread(self._run_synaptic,
                                    (self.window_main.window.xid,
                                     lock,to_add, to_rm, action))
        while lock.locked():
            while gtk.events_pending():
                gtk.main_iteration()
            time.sleep(0.05)
        self.window_main.set_sensitive(True)
        self.window_main.window.set_cursor(None)
        return self.return_code
        
    def update(self):
        return self._perform_action(self.UPDATE)

    def commit(self, add, remove):
        return self._perform_action(self.INSTALL, add, remove)



