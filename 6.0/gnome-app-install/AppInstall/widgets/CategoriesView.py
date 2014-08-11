
import gtk
#import sys
#sys.path.insert(0, "..")
#sys.path.insert(0, "../..")

from AppInstall.Menu import CategoryStore, COL_CAT_NAME, COL_CAT_PIXBUF
from AppInstall.CoreMenu import CoreApplicationMenu

class CategoriesView(gtk.IconView):
    def __init__(self, model=None):
        gtk.IconView.__init__(self, model)
        self.set_markup_column(COL_CAT_NAME)
        self.set_pixbuf_column(COL_CAT_PIXBUF)

if __name__ == "__main__":
    # run in toplevel with
    # PYTHONPATH=. python -v AppInstall/widgets/CategoryView.py
    
    # data setup
    cs = CategoryStore()
    menu = CoreApplicationMenu("/usr/share/app-install")
    menu.loadMenuCache("/var/cache/app-install/menu.p")
    cs.init_from_application_menu(menu)
    # gui
    w = gtk.Window()
    w.set_size_request(500,700)
    cv = CategoriesView(cs)
    cv.grab_focus()
    w.add(cv)
    w.show_all()
    gtk.main()
