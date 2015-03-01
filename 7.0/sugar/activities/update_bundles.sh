cd bundles
rm -f *.xo*

for bundle in '
http://activities.sugarlabs.org/en-US/sugar/downloads/file/28823/browse-156.xo
http://activities.sugarlabs.org/en-US/sugar/downloads/file/27420/irc-10.xo
http://activities.sugarlabs.org/en-US/sugar/downloads/latest/4027/addon-4027-latest.xo
http://activities.sugarlabs.org/en-US/sugar/downloads/file/28766/image_viewer-59.xo
http://activities.sugarlabs.org/en-US/sugar/downloads/latest/4041/addon-4041-latest.xo
http://activities.sugarlabs.org/en-US/sugar/downloads/file/28633/terminal-42.xo
http://activities.sugarlabs.org/en-US/sugar/downloads/file/28644/jukebox-32.xo
http://activities.sugarlabs.org/en-US/sugar/downloads/file/28378/chat-78.xo
http://activities.sugarlabs.org/en-US/sugar/downloads/file/28827/log-36.xo
http://activities.sugarlabs.org/en-US/sugar/downloads/file/28656/speak-47.xo
http://activities.sugarlabs.org/es-ES/sugar/downloads/file/28669/memorize-45.xo
http://activities.sugarlabs.org/en-US/sugar/downloads/file/28226/implode-15.xo
http://activities.sugarlabs.org/en-US/sugar/downloads/file/28661/calculate-42.xo
'; do
wget --trust-server-names $bundle
done
