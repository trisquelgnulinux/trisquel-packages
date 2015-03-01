#!/bin/bash

set -e

LANG=C

WD=$HOME/sugar
DATE=$(date +%Y%m%d)
DDATE=$(date  +%a,\ %d\ %B\ %Y\ %H:%M:%S\ %z)

cd $WD

clone(){

[ $1 == sugar ] && GIT="https://github.com/sugarlabs/sugar.git" && TAG="0.104.0"
[ $1 == sugar-artwork ] && GIT="https://github.com/sugarlabs/sugar-artwork.git" && TAG="0.104.0"
#[ $1 == sugar-base ] && GIT="git://git.sugarlabs.org/sugar-base/mainline.git" && TAG="0.98.0"
[ $1 == sugar-datastore ] && GIT="https://github.com/sugarlabs/sugar-datastore.git" && TAG="0.104.0"
[ $1 == sugar-toolkit ] && GIT="git://git.sugarlabs.org/sugar-toolkit/mainline.git" && TAG="0.98.1"
[ $1 == sugar-toolkit-gtk3 ] && GIT="https://github.com/sugarlabs/sugar-toolkit-gtk3.git" && TAG="0.104.0"


git clone $GIT $WD/build/$1
pushd $WD/build/$1
TAG=$(git describe --abbrev=0 --tags|sed 's/v//')
MAJOR=$(echo $TAG|cut -d. -f1,2)
git checkout 'v'$TAG
popd

cp -a $1 $WD/build/$1/debian
sed "s/MAJOR/$MAJOR/" -i $WD/build/$1/debian/changelog $WD/build/$1/debian/control*
sed "s/DETAIL/${MAJOR}trisquel$DATE/" -i $WD/build/$1/debian/changelog
sed "s/DATE/$DDATE/" -i $WD/build/$1/debian/changelog
}

rm -rf $WD/build/
mkdir -p $WD/build/

if [ 1$1 != '1' ]; then
    clone $1
else
    clone sugar; clone sugar-artwork; clone sugar-datastore; clone sugar-toolkit-gtk3
fi

mv $WD/build/ $WD/build-$(arch)
cd $WD/build-$(arch)

export NO_PKG_MANGLE=true

apt-get install -q -y --force-yes dh-buildinfo python-gtk2-dev libgconf2-dev python-empy  libwebkitgtk-3.0-dev icon-slicer icon-naming-utils  x11-apps chrpath  python-gobject-dev   libasound2-dev  librsvg2-dev d-shlibs python-all-dev gnome-common libgirepository1.0-dev

for i in *; do
    pushd $i
    sh autogen.sh
    make distclean
    export QUILT_PATCHES=debian/patches
    quilt push -a || true
    dpkg-buildpackage -us -uc
    popd
done

echo ALL DONE
