
URL='http://ceibal.activitycentral.com/ceibal-libs/sugar-default-activities/bundles'

cd bundles

cat << EOF > update.html
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en" dir="ltr">
<head>
<meta http-equiv="Content-type" content="text/html;charset=UTF-8" /> 
<title>Activity update list</title>
</head>
<body>
<ul>
EOF

for BUNDLE in *.xo; do
VERSION=$(unzip -p $BUNDLE */activity/activity.info|grep ^activity_version |sed 's/.*= *//')
ID=$(unzip -p $BUNDLE */activity/activity.info|grep ^bundle_id |sed 's/.*= *//')
NAME=$(unzip -p $BUNDLE */activity/activity.info|grep ^name |sed 's/.*= *//')

cat << EOF >> update.html
<li>
<span class="olpc-activity-info">
<span class="olpc-activity-id" style="display:none;">$ID</span>
<span class="olpc-activity-version" style="display:none;">$VERSION</span>
<span class="olpc-activity-url"><a href="./$BUNDLE">$NAME</a> ($VERSION)</span>
</span>
</li>
EOF


done

cat << EOF >> update.html
</ul>
</body>
</html>
EOF
