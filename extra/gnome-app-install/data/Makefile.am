@INTLTOOL_DESKTOP_RULE@

desktopdir = $(datadir)/applications
desktop_in_files = gnome-app-install.desktop.in
desktop_DATA = $(desktop_in_files:.desktop.in=.desktop)

gladedir = $(datadir)/gnome-app-install
glade_DATA = gnome-app-install.glade featured.txt

templatedir = $(datadir)/gnome-app-install
template_DATA = template.html

EXTRA_DIST=$(glade_DATA) $(desktop_DATA)
