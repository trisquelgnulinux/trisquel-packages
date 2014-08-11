
DOMAIN=gnome-app-install
DESKTOP_IN_FILES := $(wildcard *.desktop.in)
DESKTOP_FILES := $(patsubst %.desktop.in,%.desktop,$(wildcard *.desktop.in))

SCHEMAS_IN_FILES := $(wildcard *.schemas.in)
SCHEMAS_FILES := $(patsubst %.schemas.in,%.schemas,$(wildcard *.schemas.in))

all: $(DESKTOP_FILES) $(SCHEMAS_FILES)

%.desktop: %.desktop.in ../po/$(DOMAIN).pot
	intltool-merge -d ../po $< $@

%.schemas: %.schemas.in ../po/$(DOMAIN).pot
	intltool-merge -d ../po $< $@


