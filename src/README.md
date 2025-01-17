Artix Launcher Electron version.
=================================

## Play Artix Entertainment Games without a browser (Electron version).


### To build:

- npm install

- edit node_modules/electron-progressbar/source/index.js
    - Add the following to progressbar constructor browserWindow options
<pre>
<code>
    webPreferences: {
        nodeIntegration: true
    }
</code>
</pre>

- run the appropriate build script for your target platform:
    - build_win64.bat
    - build_win32.bat
    - build_mac.bat
    - build_linux_bat

- Final binaries can be found in the /dist folder