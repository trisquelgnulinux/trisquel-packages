sh update_bundles.sh

rm tmp -rf

ls bundles/|grep '.xo'|xargs -i sh package-activity.sh {}
