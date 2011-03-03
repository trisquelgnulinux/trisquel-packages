#!/bin/sh

export DEBEMAIL=trisquel-devel@listas.trisquel.info
export DEBFULLNAME="Trisquel GNU/Linux developers"

CURRENTVERSION=$(head -n1 debian/changelog|sed 's/.*(//g; s/).*//g'|awk -F '-' '{print $1}')
CURRENTSUBVERSION=$(head -n1 debian/changelog|sed 's/.*(//g; s/).*//g'|awk -F '-' '{print $2}')
VERSION=$CURRENTVERSION-$(expr $CURRENTSUBVERSION + 1)

echo | dch -v $VERSION  "$*"

