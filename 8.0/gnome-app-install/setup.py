#!/usr/bin/env python

from setuptools import setup
import os.path
import re

if __name__ == "__main__":

    # look/set what version we have
    changelog = "debian/changelog"
    if os.path.exists(changelog):
        head=open(changelog).readline()
        match = re.compile(".*\((.*)\).*").match(head)
        if match:
            version = match.group(1)
            f=open("AppInstall/Version.py","w")
            f.write("VERSION=\"%s\"\n" % version)
            f.close()

    GETTEXT_NAME="gnome-app-install"

    setup(name='gnome-app-install',
          version=version,
          packages=['AppInstall',
                    'AppInstall.distros',
                    'AppInstall.backend',
                    'AppInstall.packaging',
                    'AppInstall.widgets'],
          scripts=['gnome-app-install'],
          data_files=[('share/gnome-app-install/',
                       ["data/gnome-app-install.ui"]
                      ),
                      ('sbin',
                       ["update-app-install",
                        'gnome-app-install-helper']
                      )
                     ],
          test_suite="nose.collector",
          )
