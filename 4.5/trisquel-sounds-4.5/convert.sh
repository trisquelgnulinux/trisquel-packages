#!/bin/sh

# Convert all wav files to ogg files.
QUALITY=-q3

for file in *.wav
do
	oggenc $QUALITY -o $(dirname $file)/$(basename $file .wav).ogg $file
done
