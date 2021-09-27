#!/bin/bash

set -e

build(){
    ACTIVITY=sugar-activity-$(echo $1 |sed 's/-.*//; s/\(.*\)/\L\1/; s/_/-/;')
    VERSION=$(echo $1 |sed 's/.*-//; s/\.xo//')
    DATE=$(LANG=en date '+%a, %d %b %Y %T +0000')

    echo $ACTIVITY

    mkdir -p tmp/$ACTIVITY/usr/share/sugar/activities
    unzip bundles/$1 -d tmp/$ACTIVITY/usr/share/sugar/activities/
    cp debian -a tmp/$ACTIVITY

    sed -i "s/ACTIVITY/$ACTIVITY/" -i tmp/$ACTIVITY/debian/*
    sed -i "s/VERSION/$VERSION/" -i tmp/$ACTIVITY/debian/*
    sed -i "s/DATE/$DATE/" -i tmp/$ACTIVITY/debian/*
    
    mkdir -p tmp/$ACTIVITY/usr/share/locale
    cp tmp/$ACTIVITY/usr/share/sugar/activities/*/locale/* tmp/$ACTIVITY/usr/share/locale/ -a || true
    rm -rf tmp/$ACTIVITY/usr/share/locale/*/activity.linfo

    cd tmp/$ACTIVITY
    dpkg-buildpackage -us -uc
    cd ../..
}

if [ 1$1 = 1 ]; then
    for BUNDLE in $(ls -1 bundles |grep xo$); do
        build $BUNDLE
    done
else
    build $1
fi
