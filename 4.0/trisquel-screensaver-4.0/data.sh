cp data/* -a debian/$(find debian/ -mindepth 1 -maxdepth 1 -type d | awk -F '/' '{print $2}')
