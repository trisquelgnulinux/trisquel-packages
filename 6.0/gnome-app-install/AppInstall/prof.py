from AppInstall import *
from Menu import *

import hotshot
import hotshot.stats


if __name__ == "__main__":
    datadir = "/usr/share/gnome-app-install"
    desktopdir = "/usr/share/app-install"

    name = "gai.prof"
    prof = hotshot.Profile(name)
    if sys.argv[1] == "-m":
        # menu
        cache = apt.Cache()
        treeview = gtk.TreeView()
        prof.runcall(ApplicationMenu, desktopdir, datadir, cache, treeview, treeview, apt.progress.OpProgress())
        prof.close()
    elif sys.argv[1] == "-a":
        # app
        cmd = "app = AppInstall(datadir, desktopdir, sys.argv)"
        prof.runctx(cmd, globals(), locals())
        prof.close()
    elif sys.argv[1] == "-d":
	# display results
    	stat = hotshot.stats.load(name)
	stat.strip_dirs()
	stat.sort_stats('time', 'calls')
    	stat.print_stats(20)
    	stat.print_callers(20)
    	stat.print_callees(20)
