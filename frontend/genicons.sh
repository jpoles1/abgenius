#!/bin/bash

# Requires imagemagick be installed (sudo apt install imagemagick on ubuntu)

convert public/img/icon.png -resize 512x512 public/img/icons/android-chrome-512x512.png
convert public/img/icon.png -resize 192x192 public/img/icons/android-chrome-192x192.png

convert public/img/icon.png -resize 152x152 public/img/icons/apple-touch-icon-152x152.png
convert public/img/icon.png -resize 144x144 public/img/icons/msapplication-icon-144x144.png


convert public/img/icon.png -resize 16x16 public/img/icons/favicon-16x16.png
convert public/img/icon.png -resize 32x32 public/img/icons/favicon-32x32.png
convert public/img/icon.png -resize 48x48 public/img/icons/favicon-48x48.png

convert public/img/icons/favicon-16x16.png public/img/icons/favicon-32x32.png public/img/icons/favicon-48x48.png public/favicon.ico
