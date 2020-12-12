This repository contains Trisquel's internal packages, those that are not build from proceduraly modifying packages from upstrem or other origins (for that, check trisquel/package-helpers>).

To submit a merge request:
  * Make sure to update the changelog for the package being modified:

      cd 9.0/trisquel-meta
      ../../changelog.sh "I made these changes"

  * Edit the copyright file (e.g. 9.0/trisquel-meta/debian/copyright) if needed (when contributing nontrivial changes, like adding new files)