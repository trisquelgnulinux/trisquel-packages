# misc utils
# (c) 2005-2007 Canonical, GPL
# Authors:
#  Michael Vogt

import os
import os.path
import apt_pkg
import time

# Column enumeration

# Columns of the packages store
(COL_NAME,
 COL_ITEM,
 COL_POPCON) = range(3)

class ExecutionTime(object):
    """
    Helper that can be used in with statements to have a simple
    measure of the timming of a particular block of code, e.g.
    with ExecutinTime("db flush"):
        db.flush()
    """
    def __init__(self, info=""):
        self.info = info
    def __enter__(self):
        self.now = time.time()
    def __exit__(self, type, value, stack):
        print "%s: %s" % (self.info, time.time() - self.now)

def get_maintenance_end_date(release_date, m_months):
    """
    get the (year, month) tuple when the maintenance for the distribution
    ends
    """
    years = m_months / 12
    months = m_months % 12
    support_end_year = release_date.year + years + (release_date.month + months)/12
    support_end_month = (release_date.month + months) % 12
    return (support_end_year, support_end_month)

def get_release_date_from_release_file(path):
    """
    return the release date as time_t for the given release file
    """
    if not path or not os.path.exists(path): 
        return None
    tag = apt_pkg.ParseTagFile(open(path))
    tag.Step()
    if not tag.Section.has_key("Date"):
        return None
    date = tag.Section["Date"]
    return apt_pkg.StrToTime(date)

def get_release_filename_for_pkg(cache, pkgname, label, release):
    " get the release file that provides this pkg "
    if not cache.has_key(pkgname):
        return None
    pkg = cache[pkgname]
    ver = None
    # look for the version that comes from the repos with
    # the given label and origin
    for aver in pkg._pkg.VersionList:
        if aver == None or aver.FileList == None:
            continue
        for verFile, index in aver.FileList:
            #print verFile
            if (verFile.Origin == label and 
                verFile.Label == label and
                verFile.Archive == release):
                ver = aver
    if not ver:
        return None
    indexfile = cache._list.FindIndex(ver.FileList[0][0])
    for metaindex in cache._list.List:
        for m in metaindex.IndexFiles:
            if (indexfile and 
                indexfile.Describe == m.Describe and
                indexfile.IsTrusted):
                dir = apt_pkg.Config.FindDir("Dir::State::lists")
                name = apt_pkg.URItoFileName(metaindex.URI)+"dists_%s_Release" % metaindex.Dist
                return dir+name
    return None

def xmlescape(s):
    from xml.sax.saxutils import escape
    if s==None:
        return ""
    else:
        return escape(s)


def iterate_list_store(store, it):
    """ iterate over a gtk tree-model, returns a gtk.TreeIter for each element
    """
    if not it:
        raise StopIteration
    yield it
    while True:
        it = store.iter_next(it)
        if it == None:
            raise StopIteration
        yield it
    


# class SimpleFilteredCache(apt.cache.FilteredCache):
#     """ a simpler version of the filtered cache that will not react to
#         cache changed (no need, we are only interessted in text)
#     """
#     def filterCachePostChange(self):
#         pass
#     def runFilter(self):
#         self._reapplyFilter()

# class SearchFilter(apt.cache.Filter):
#     """ a filter class that just searchs insensitive in name/description """
#     def SetSearchTerm(self, term):
#         self._term = term.lower()
#     def apply(self, pkg):
#         if self._term in pkg.name.lower() or \
#                self._term in pkg.description.lower():
#             return True
#         else:
#             return False
#     def __init__(self, query=None):
#         if query != None:
#             self.SetSearchTerm(query)



