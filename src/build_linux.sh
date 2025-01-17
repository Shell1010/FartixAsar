#!/bin/sh
rm ./plugins/*.dll
rm -rf ./plugins/PepperFlashPlayer.plugin
npm run pack

cp ./build/LinuxAppDirFiles/* ./dist/linux-unpacked/
cd dist
../build/appimagetool-x86_64.AppImage linux-unpacked
wait
cd ..
git checkout -- plugins*