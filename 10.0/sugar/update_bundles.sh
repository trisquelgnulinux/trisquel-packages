
set -e

rm -rf bundles
mkdir bundles

for repo in browse-activity calculate-activity chat imageviewer-activity jukebox-activity log-activity Pippy read-activity terminal-activity turtleart-activity write-activity activity-abacus AnalyzeJournal clock-activity colordeducto deducto develop-activity flip flipsticks fractionbounce gcompris-wrapper-activity sugarchess iknowmyabcs iq-activity implode-activity jumble-activity lettermatch locosugar maze-activity Measure moon-activity music-keyboard-activity napier nutrition paint-activity periodic-table poll-activity portfolio-activity pukllanapac recall record-activity reflection speak stopwatch story typing-turtle-activity wordcloud words-activity irc-activity memorize-activity
do
  git clone https://github.com/sugarlabs/$repo.git bundles/$repo

dos2unix bundles/$repo/activity/activity.info

activity=$(grep "^name *=" bundles/$repo/activity/activity.info| sed 's/.*=//;s/ //g')
version=$(grep "^activity_version *=" bundles/$repo/activity/activity.info| sed 's/.*=//;s/ //g')

rm bundles/$repo/.git* -rf

#mv bundles/$repo bundles/$activity
mv bundles/$repo bundles/$activity.activity
(cd bundles ; zip -r ${activity}-${version}.xo  $activity.activity)


done
