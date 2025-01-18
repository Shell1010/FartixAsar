# FartixAsar
A custom app.asar intended to fix bugs with the current asar and probably improve upon it. Only reason I'm doing this is because I found a bug and wanted it fixed for myself, there is no actual game modifications, it's just improvements to the launcher itself.

Please tell me if something breaks, not really doing much testing because I only really play AQW and if that works then I'm assuming the rest does too.

## Additions
- `Ctrl + i` launches dev tools, applies to game windows too (access assets via networking tab)

## Fixes
- Made it so launcher doesn't execute JS via console just to launch a game
- Fixed weird window being unable to be resized and snapping back when moved, this occurred during launch via context menu
- Cleaned some code, removed redundant functions
