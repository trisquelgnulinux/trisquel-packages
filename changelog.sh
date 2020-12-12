#!/bin/sh

dch -M --force-distribution  $*
dch -M --force-distribution -r ""

