del /f dist\ArtixLauncher_win_x86.exe
del /f plugins\pepflashplayer.dll
del /f plugins\libpepflashplayer.so
rmdir /Q /S plugins\PepperFlashPlayer.plugin
call npm run dist-32bit
ren "dist\Artix Game Launcher Setup 2.1.2.exe" ArtixLauncher_win_x86.exe

git checkout -- plugins\*

Echo "Command Finished Successfully!"