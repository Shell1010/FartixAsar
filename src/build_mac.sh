#!/bin/sh
rm ./plugins/*.dll
rm ./plugins/libpepflashplayer.so
npm run dist
mv 'dist/Artix Game Launcher-2.1.2.dmg' 'dist/ArtixGameLauncher.dmg'
wait
git checkout -- plugins*