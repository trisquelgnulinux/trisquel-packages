#!/bin/sh

set -e

WORKDIR=$PWD
TMP=$(mktemp -d)
cd $TMP
git clone https://github.com/webgapps/flvideoreplacer.git
cd $WORKDIR
rm -rf data/usr/share/xul-ext/flvideoreplacer/
mv $TMP/flvideoreplacer/firefox/ data/usr/share/xul-ext/flvideoreplacer/
rm -rf $TMP

sed -i s/HIGH/MEDIUM/ data/usr/share/xul-ext/flvideoreplacer/defaults/preferences/defaults.js
sed -i 's/autolaunchembed", false/autolaunchembed", true/' data/usr/share/xul-ext/flvideoreplacer/defaults/preferences/defaults.js
sed -i 's:video/mp4:application/x-mplayer2:'  data/usr/share/xul-ext/flvideoreplacer/defaults/preferences/defaults.js
sed -i 's:autodetect:application/x-mplayer2:'  data/usr/share/xul-ext/flvideoreplacer/defaults/preferences/defaults.js
sed -i 's/alertsinfo", true/alertsinfo", false/' data/usr/share/xul-ext/flvideoreplacer/defaults/preferences/defaults.js
sed -i 's/alertstips", true/alertstips", false/' data/usr/share/xul-ext/flvideoreplacer/defaults/preferences/defaults.js

echo -n "Updated correctly, version tag is:"
grep em:version data/usr/share/xul-ext/flvideoreplacer/install.rdf
