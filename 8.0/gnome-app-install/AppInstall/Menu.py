# (c) 2005-2007 Canonical - GPL
# (c) 2006-2007 Sebastian Heinlein
#
# Authors:
#  Michael Vogt
#  Sebastian Heinlein
#

import glib
import gtk
import gtk.gdk
import gobject
import xdg.Menu
import sys
import os
import gst

from warnings import warn

from Util import *

from CoreMenu import *

# possible filter states for the application list - match the layout in
# data/gnome-app-install.schemas.in
( SHOW_ALL,
  SHOW_ONLY_FREE,
  UNUSED_1,
  SHOW_ONLY_SUPPORTED,
  SHOW_ONLY_THIRD_PARTY,
  UNUSED_2,
  SHOW_ONLY_INSTALLED,
  SHOW_ONLY_MAIN,
  SHOW_ONLY_PROPRIETARY,
 ) = range(9)

PIMP_APPS = ["gstreamer0.10-plugins-ugly",
             "gstreamer0.10-ffmpeg",
             "sun-java5-plugin",
             "flashplugin-nonfree",
             "ubuntu-restricted-extras"]

class NullActivationStyleForMenu:
    # See class ActivationStyle in gnome-app-install; that class
    # would do just fine here except that it's upside-down from a
    # layering POV.
    def __init__(self): 
        self.selectFilter = None
        self.menuFilter = None
    def isApproved(self, component, pkgname): return True
    def menuCacheName(self): return "menu.p"


# category columns
(COL_CAT_NAME,
 COL_CAT_ITEM,
 COL_CAT_PIXBUF) = range(3)

class CategoryStore(gtk.ListStore):
    " the gtk.ListStore for the categories "

    def __init__(self, icons=None):
        gtk.ListStore.__init__(self, 
                               gobject.TYPE_STRING, 
                               gobject.TYPE_PYOBJECT,
                               gtk.gdk.Pixbuf)
        self.icons = icons
        if not icons:
            self.icons = gtk.icon_theme_get_default()
    def push_back(self, item):
        " add Menu.Category item to the end of the store "
        iter = self.append()
        try:
            icon = self.icons.load_icon(item.iconname, 32, 0)
        except glib.GError, e:
            icon = self.icons.load_icon(gtk.STOCK_MISSING_IMAGE, 32, 0)
        self.set(iter,
                 COL_CAT_NAME, item.name,
                 COL_CAT_PIXBUF, icon,
                 COL_CAT_ITEM, item,)
        return iter
    def init_from_application_menu(self, menu):
        " init the category store from a CoreMenu class "
        self.clear()
        for category in sorted(menu.pickle, cmp=lambda x,y: cmp(x.name,y.name)):
            self.push_back(category)

class ApplicationMenu(CoreApplicationMenu):
    """ this represents the application menu, the interessting bits are:
        - store that can be attached to a TreeView
        - pkg_to_app a dictionary that maps the apt pkgname to the application
                     items
    """

    debug = 0

    def __init__(self, datadir, cachedir, cache,
                 treeview_packages, progress,
                 filter=SHOW_ONLY_SUPPORTED, dontPopulate=False,
                 activation_style=NullActivationStyleForMenu()):
        CoreApplicationMenu.__init__(self, datadir)
        self.cache = cache
        self.treeview_packages = treeview_packages
        self.activationStyle = activation_style
        
        # icon theme
        self.icons = gtk.icon_theme_get_default()
        self.icons.append_search_path(os.path.join(datadir, "icons"))

        # search
        self.searchTerms = []
        
        # properties for the view
        if self.activationStyle.menuFilter is not None:
            self.filter = self.activationStyle.menuFilter
        else:
            self.filter = filter

        # the categories 
        self.real_categories_store = CategoryStore(self.icons)

        if dontPopulate:
            return

        # populate the tree
        # use cached self.pickle (should be renamed to self.categories)
        # and cache self.pkgs_to_app
        cname = activation_style.menuCacheName()
        if cachedir is not None and os.path.exists("%s/%s" % (cachedir,cname)):
            progress.label_action.set_label(_("Loading cache..."))
            cacheLoaded = self.loadMenuCache(os.path.join(cachedir,cname))

        if not cacheLoaded:
            progress.label_action.set_label(_("Collecting application data..."))
            self.desktopEntriesSeen.clear()
            menu = xdg.Menu.parse(os.path.join(self.menudir, "applications.menu"))
            self._populateFromEntry(menu)
            
        # refresh based on the pickled information
        self.refresh(progress)
        self.store = self.real_categories_store

    def get_categories_store(self):
        return self.real_categories_store

    # helpers
    def _refilter(self, model=None):
        # we need to disconnect the model from the view when we
        # do a refilter, otherwise we get random crashes in the search
        # (to reproduce:
        #  1. open "accessability" 2. unselect "show unsupported"
        #  3. search for "apt" 4. turn "show unsupported" on/off -> BOOM
        if not model:
            model = self.treeview_packages.get_model()

        # save the cursor position (or rather, the name of the app selected)
        name = None
        (path, colum) = self.treeview_packages.get_cursor()
        if path:
            try:
                name = model.get_value(model.get_iter(path), COL_NAME)
            except ValueError, e:
                # gtk allows a cursor on position (0,) for a empty treeview
                # but errors if that path from get_cursor() is used in
                # get_value()
                pass
            #print "found: %s (%s) " % (name, path)

        # this is the actual refiltering
        self.treeview_packages.set_model(None)
        if model != None:
            model.get_model().refilter()
        self.treeview_packages.set_model(model)

        # redo the cursor
        if name != None:
            for it in iterate_list_store(model, model.get_iter_first()):
                aname = model.get_value(it, COL_NAME)
                if name == aname:
                    #print "selecting: %s (%s)" % (name, model.get_path(it))
                    #self.treeview_packages.expand_to_path(model.get_path(it))
                    self.treeview_packages.set_cursor(model.get_path(it))
                    return
        elif len(model) > 0:
            self.treeview_packages.set_cursor(0)

    def _name_sort_func(self, model, iter1, iter2):
        """
        Sort by name, honor special craziness
        """
        item1 = model.get_value(iter1, COL_ITEM)
        item2 = model.get_value(iter2, COL_ITEM)
        if item1 == None or item2 == None:
            return 0
        # check if we want always on top
        # - we only want it on top if the category is not "All"
        # - if the item has the onTop property
        cat = model.get_data("category") 
        if (cat and cat.name != self.all_category_name and
            hasattr(item1,"onTop") and hasattr(item2,"onTop")):
            # if both have the onTop property, fall through and
            # do normal name sorting
            if not (item1.onTop and item2.onTop):
                if item1.onTop: return -1
                elif item2.onTop: return 1
        # no onTop property
        name1 = model.get_value(iter1, COL_NAME)
        name2 = model.get_value(iter2, COL_NAME)
        if name1 < name2: return -1
        elif name1 > name2: return 1
        else: return 0

    def _ranking_sort_func(self, model, iter1, iter2):
        """
        Sort by the search result rank
        """
        #print "_sort_func()"
        item1 = model.get_value(iter1, COL_ITEM)
        item2 = model.get_value(iter2, COL_ITEM)
        if item1 == None or item2 == None:
            return 0
        if item1.rank < item2.rank: return 1
        elif item1.rank > item2.rank: return -1
        else: return 0

    def _visible_filter(self, model, iter):
        item = model.get_value(iter, COL_ITEM)
        #print "_visible_filter: ", item
        if item:
            # check for the various view settings
            if not self.activationStyle.isApproved(
               item.component, item.pkgname):
                return False
            if self.filter == SHOW_ONLY_MAIN and item.component != "main":
                return False
            if self.filter == SHOW_ONLY_SUPPORTED and item.supported != True:
                return False
            if self.filter == SHOW_ONLY_FREE and item.free == False:
                return False
            if self.filter == SHOW_ONLY_PROPRIETARY and item.free == True:
                return False
            if self.filter == SHOW_ONLY_THIRD_PARTY and item.thirdparty != True:
                return False
            if self.filter == SHOW_ONLY_INSTALLED and not \
               (self.itemIsInstalled(item) if self.cache else True):
                return False
            # Allow to only show a subset by the activation filter
            if (self.activationStyle.selectFilter is not None and
                not self._activationStyleFilter(item)):
                return False
            # if we search, do the ranking updates 
            if len(self.searchTerms) > 0:
                rank = self._filterAndRank(item)
                if rank == None:
                    return False
                else:
                    item.rank = rank
        return True

    def _filterAndRank(self, item):
        """
        Watch out, Google!
        """
        trigger = ""
        rank = 100 * item.popcon / self.popcon_max

        # the normal case
        for term in self.searchTerms:
            hit = False
            if term == item.name.lower() or \
               term == item.pkgname.lower():
                rank += 100
                hit = True
            if term in item.name.lower():
                rank += 30
                trigger += " name"
                hit = True
            if term in item.pkgname.lower():
                rank += 30
                trigger += " pkg_name"
                hit = True
            if term in item.keywords:
                rank += 25
                trigger += " keywords"
                hit = True
            if self._mimeMatch(item, term, fuzzy=True):
                rank += 25
                trigger += " mime"
                hit = True
            if self._codecMatch(item, term, fuzzy=True):
                rank += 15
                trigger += " codec"
                hit = True
            if (self.cache.has_key(item.pkgname) and
                self.cache[item.pkgname].versions[0].description and
                term in self.cache[item.pkgname].versions[0].description.lower()):
                rank += 10
                trigger += " pkg_desc"
                hit = True
            if hit == False:
                return None
            if item.pkgname.lower() in PIMP_APPS:
                rank += 75
        #print "found %s (%s/%s): %s" % (item.name, item.popcon, rank, trigger)
        return rank

    def _mimeMatch(self, item, term, fuzzy=False):
        for pattern in item.mime:
            if fuzzy and term in pattern:
                return True
            elif not fuzzy and pattern == term:
                return True
        return False

    def _codecMatch(self, item, term, fuzzy=False):
        #print "_codecMatch for pkg '%s' (term: %s) " % (item.pkgname, term)
        if ":" in term:
            term = term.split(":")[1]
        search_cap = gst.caps_from_string(term)
        #print "search_cap: ", search_cap
        for codec in item.codecs:
            if ":" in codec:
                codec = codec.split(":")[1]
            if fuzzy and term in codec:
                return True
            else:
                cap = gst.caps_from_string(codec)
                #print "codec: ",codec
                #print "cap: ",cap
                if (cap and search_cap and
                    (search_cap & cap)):
                    return True
        return False

    def _activationStyleFilter(self, item):
        #print "_activationStyleFilter(): ",item
        filter = self.activationStyle.selectFilter(self)
        if (self.activationStyle.isInstallerOnly and 
            self.itemIsInstalled(item)):
            return False
        for term in self.activationStyle.searchTerms():
            if filter(item, term):
                return True
        return False

    def doMimeSearch(self, mime_type, fuzzy=False):
        res = set()
        model = self.real_categories_store.get_value(self.all_category_iter, COL_CAT_ITEM).all_applications
        for it in iterate_list_store(model, model.get_iter_first()):
            item = model.get_value(it, COL_ITEM)
            for re_pattern in item.mime:
                # mvo: we get a list of regexp from
                # pyxdg.DesktopEntry.getMimeType, but it does not
                # use any special pattern at all, so we use the plain
                # pattern (e.g. text/html, audio/mp3 here)
                pattern = re_pattern.pattern
                if fuzzy and mime_type in pattern:
                    res.add(item)
                elif not fuzzy and re_pattern.match(mime_type):
                    res.add(item)
        return res

    def refreshAfterCacheChange(self, progress):
        #print "refreshAfterCacheChange"
        # FIXME: progress information here?
        for cat in self.pickle:
            for item in self.pickle[cat]:
                #print item
                item.toInstall = (self.cache.has_key(item.pkgname) and
                                  self.cache[item.pkgname].is_installed)

    def refresh(self, progress):
        self.real_categories_store.clear()
        progress.subOp = _("Loading applications...")
        progress.update(0)
        # add "All" category
        self.all_category_name = "<b>%s</b>" % _("All")
        item = Category(self, self.all_category_name, "distributor-logo")
        self.all_category_iter = self.real_categories_store.push_back(item)
        self.initListStores(item, self)
        # now go for the categories
        i=0
        lenx=len(self.pickle.keys())
        keys = self.pickle.keys()
        keys.sort(cmp=lambda x,y: cmp(x.name.lower(), y.name.lower()))
        for category in keys:
            progress.subOp = _("Loading %s...")% category.name
            self.initListStores(category, self)
            self.real_categories_store.push_back(category)
            i += 1
            progress.update(i/float(lenx)*100.0)
            for item in self.pickle[category]:
                # add to category
                category.all_applications.append([item.name,
                                                  item,
                                                  item.popcon])
                # add to all
                store = self.real_categories_store.get_value(
                    self.all_category_iter, COL_CAT_ITEM).all_applications
                store.append([item.name, item, item.popcon])

                # do the popcon_max calculation
                if item.popcon > self.popcon_max:
                    self.popcon_max = item.popcon

                # populate the pkg_to_app data structure
                pkgname = item.pkgname
                if not self.pkg_to_app.has_key(pkgname):
                    self.pkg_to_app[pkgname] = set()
                self.pkg_to_app[pkgname].add(item)
        # now update the cache dependant part
        if self.cache:
            self.refreshAfterCacheChange(progress)

    def itemAvailable(self, item):
        """ returns True if the item is available in the current
            apt cache """
        return self.cache.has_key(item.pkgname)
    def itemIsInstalled(self, item):
        """ returns True if the item is currently installed """
        return (self.cache.has_key(item.pkgname) and
                self.cache[item.pkgname].is_installed)

    def initListStores(self, category, parent):
        # if that category has applications, add them to the
        # store here
        category.all_applications = gtk.ListStore(gobject.TYPE_STRING,
                                                  gobject.TYPE_PYOBJECT,
                                                  gobject.TYPE_INT)
        # set the visible filter
        category.filtered_applications = category.all_applications.filter_new()
        category.filtered_applications.set_visible_func(parent._visible_filter)
        category.filtered_applications.set_data("category",category)
        # set the model sort all applications
        category.applications = gtk.TreeModelSort(category.filtered_applications)
        category.applications.set_data("category",category)

    def getChanges(self, get_paths=False):
        """ return the selected changes in the tree
            TODO: what is get_paths?
        """
        to_inst = set()
        to_rm = set()
        for (name, item, pixbuf) in self.store:
            for (name,item, popcon) in item.all_applications:
                if self.itemIsInstalled(item) and not item.toInstall:
                    to_rm.add(item)
                if not self.itemIsInstalled(item) and item.toInstall:
                    to_inst.add(item)
        #print "to_add: %s" % to_inst
        #print "to_rm: %s" % to_rm
        return (to_inst, to_rm)
        
    def isChanged(self):
        """ check if there are changes at all """
        for (cat_name, cat, pixbuf)  in self.store:
            for (name,item,popcon) in cat.all_applications:
                if item.toInstall != self.itemIsInstalled(item):
                    return True
        return False

    def _dbg(self, level, msg):
        """Write debugging output to sys.stderr."""
        if level <= self.debug:
            print >> sys.stderr, msg


if __name__ == "__main__":
    print "testing the menu"

    desktopdir = "/usr/share/app-install"
    from Util import MyCache
    cache = MyCache()
    treeview = gtk.TreeView()
    menu = ApplicationMenu(desktopdir, cache, treeview, treeview, apt.progress.base.OpProgress())
    #matches = menu.doMimeSearch("mp3",fuzzy=True)
    #print matches
    #matches = menu.doMimeSearch("audio/mp3")
    #print matches

    
