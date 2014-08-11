# (c) 2005-2007 Canonical - GPL
#
# Authors:
#  Michael Vogt

import warnings
warnings.filterwarnings("ignore", "apt API not stable yet", FutureWarning)
import apt
import apt_pkg
import gtk
import apt.progress.base

# intervals of the start up progress
# 4x caching and menu creation
STEPS_UPDATE_CACHE = [ 12, 25, 37, 50, 100 ]

class GtkMainIterationProgress(apt.progress.base.OpProgress):
    """Progress that just runs the main loop"""
    def update(self, percent):
        while gtk.events_pending():
            gtk.main_iteration()

class GtkOpProgressWindow(apt.progress.base.OpProgress):
    def __init__(self, builder, parent, steps=STEPS_UPDATE_CACHE, label=''):
        self.subOp = ""
        self.steps = steps[:]
        self.base = 0
        self.old = 0 
        self.next = int(self.steps.pop(0))
        self.window_progress = builder.get_object("window_progress")
        self.progressbar_cache = builder.get_object("progressbar_cache")
        self.label_action = builder.get_object("label_action")
        self.label_progress = builder.get_object("label_progress")
        self.label_progress.set_markup(label)
        self.window_progress.realize()
        self.window_progress.window.set_functions(gtk.gdk.FUNC_MOVE)
        # make both GtkWindow and GdkWindow parents possible
        if hasattr(parent, "window"):
            parent = parent.window
        if parent is not None:
            self.window_progress.window.set_transient_for(parent)

    def update(self, percent):
        self.window_progress.show()
        # if the old percent was higher, a new progress was started
        if self.old > percent:
            # set the borders to the next interval
            self.base = self.next
            try:
                self.next = int(self.steps.pop(0))
            except:
                pass
        progress = self.base + percent/100 * (self.next - self.base)
        self.old = percent
        self.progressbar_cache.set_fraction(progress/100)
        if self.subOp != "":
            self.label_action.set_markup("<i>"+"%s" % self.subOp+"</i>")
        while gtk.events_pending():
            gtk.main_iteration()
    # using __del__ here sucks (because of eventual GC lazines)
    # but there is no "complete" callback in apt yet and "Done"
    # is called for each subOp
    def __del__(self):
        self.window_progress.hide()

class GtkCdromProgress(apt.progress.base.CdromProgress):
    """ Report the cdrom add progress
        Subclass this class to implement cdrom add progress reporting
    """
    def __init__(self, parent):
        self.progress = parent.progressbar_cache
        self.status = parent.label_action
        self.parent = parent
        parent.window_progress.realize()
        parent.window_progress.window.set_functions(gtk.gdk.FUNC_MOVE)
        parent.window_progress.show()
        parent.window_progress.set_transient_for(parent.window_main)
        while gtk.events_pending():
            gtk.main_iteration()
    def update(self, text, step):
        """ update is called regularly so that the gui can be redrawn """
        if text:
            self.status.set_text(text)
        self.progress.set_fraction(step/float(self.totalSteps))
        while gtk.events_pending():
            gtk.main_iteration()
    def askCdromName(self):
        return (False, "")
    def changeCdrom(self):
        return False
