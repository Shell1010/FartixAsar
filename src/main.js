

const clientVersion = 212;

const { app, BrowserWindow, dialog, shell, Tray, Menu, Notification, protocol, session } = require('electron');
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
	app.quit();
}
const path = require('path');
const options = {};
const ProgressBar = require('electron-progressbar');
const jsonLocalStorage = require('electron-json-storage');
const DownloadManager = require('electron-download-manager');
const fs = require('fs');
const { setTimeout } = require('timers');

let iconName = 'Artix_DragonSquare_256.png';
let pluginName;
let appIcon;
let contextMenu;
let mainWindow;
let mainWinTimer;
let iq_win;
let UpdateURL = 'https://launch.artix.com/latest/';
let UpdateFilename = 'ArtixLauncher_win_x64.exe';
let UpdateFilePath = 'ArtixLauncher_win_x64.exe';
let DownloadFolder = 'downloads';
let MinimizeToTray = true;
let NotificationsEnabled = true;
let ClearDataOnExit = false;
let protocolLaunch = false;
let protocolGame = 'launch-aqw';
let IsUpdating = false;
let gameIDS = {
	'launch-aqw': 1135,
	'launch-ed': 1141,
	'launch-df': 1138,
	'launch-aq': 1137,
	'launch-mq': 1139,
	'launch-os': 1140,
	'launch-aq3d': 1136
};

let isMac = true;
let tempTimers = [];

process.setMaxListeners(100);

if (process.argv.length > 0) {
	let arg = process.argv.pop();
	devToolsLog('ARGV: ' + arg);

	if (arg.indexOf('artix://') > -1) {
		protocolGame = arg.substring(8).replace('/', '');
		devToolsLog('game =' + protocolGame);
		if (protocolGame.indexOf('launch-') > -1) {
			protocolLaunch = true;
		}
	}
}



protocol.registerSchemesAsPrivileged([{ scheme: 'artix', privileges: { standard: true, secure: true } }]);
app.setAsDefaultProtocolClient('artix', process.execPath);


let gameWindows;

function devToolsLog(s) {
	console.log(s);
}

function createLauncherURL() {
	var launcherURL = 'https://www.artix.com/gamelauncher';
	if (protocolLaunch) {
		if (gameIDS[protocolGame] != null) {
			launcherURL += '/?id=' + gameIDS[protocolGame];
		}
	}
	return launcherURL;
}

app.commandLine.appendSwitch('ignore-gpu-blacklist');

app.IsNotificationEnabled = () => {
	return NotificationsEnabled;
};
app.setAppUserModelId('Artix Entertainment, LLC'); //process.execPath);

switch (process.platform) {
	case 'win32':
		pluginName = process.arch == 'x64' ? 'pepflashplayer.dll' : 'pepflashplayer32.dll';
		var platformFilename = process.arch == 'x64' ? 'ArtixLauncher_win_x64.exe' : 'ArtixLauncher_win_x86.exe';
		DownloadFolder = app.getPath('downloads') + '\\Artix Entertainment LLC';
		UpdateFilename = platformFilename;
		UpdateFilePath = DownloadFolder + '\\' + platformFilename;
		devToolsLog('Update Path = ' + UpdateFilePath);
		break;
	case 'darwin':
		pluginName = 'PepperFlashPlayer.plugin';
		DownloadFolder = app.getPath('downloads') + '/Artix Entertainment LLC';
		UpdateFilename = 'Artix Game Launcher.dmg';
		UpdateFilePath = DownloadFolder + '/Artix Game Launcher.dmg';
		break;
	case 'linux':
		pluginName = 'libpepflashplayer.so';
		DownloadFolder = app.getPath('downloads') + '/Artix Entertainment LLC';
		UpdateFilename = 'Artix_Games_Launcher-x86_64.AppImage'
		UpdateFilePath = DownloadFolder + '/Artix_Games_Launcher-x86_64.AppImage';
		break;
	default:
		pluginName = 'pepflashplayer.dll';
		DownloadFolder = app.getPath('downloads') + '\\Artix Entertainment LLC';
		UpdateFilename = 'ArtixLauncher_win_x64.exe';
		UpdateFilePath = DownloadFolder + '\\ArtixLauncher_win_x64.exe';
		break;
}

DownloadManager.register({
	downloadFolder: DownloadFolder
});


app.commandLine.appendSwitch('ppapi-flash-path', path.join(__dirname + '/../plugins/', pluginName));
app.commandLine.appendSwitch('ppapi-flash-version', '32.0.0.371');
//========Interop Functions =========//
app.launch3D = () => {
	var progressBar = new ProgressBar({
		title: 'Launching AQ3D (Requires Steam)',
		text: 'Launching AQ3D',
		detail: 'Attempting to Launch AQ3D (Requires Steam)'
	});
	var steamOpen = shell.openExternal('steam://rungameid/429790');
	steamOpen.then(function (_) {
		setTimeout(function () {
			progressBar.setCompleted();
		}, 10000);
	});

	steamOpen.catch(function (_) {
		setTimeout(function () {
			progressBar.setCompleted();
		}, 10000);
		shell.openExternal('https://store.steampowered.com/app/429790/AdventureQuest_3D/');
	});
};

app.SaveLocalData = (key, obj) => {
	jsonLocalStorage.set(key, obj, function (error, _) {
		if (error) {
			throw error;
		} else {
			devToolsLog('Success: saved ' + key);
		}
	});
};

app.LoadLocalData = (key, callback) => {
	devToolsLog('GetLocalData: ' + key);
	jsonLocalStorage.get(key, function (error, data) {
		if (error) {
			throw error;
		} else {
			devToolsLog('Data:' + data);
			if (callback) {
				callback(data);
			}
		}
	});
};

app.ShowNotification = (message) => {
	if (!NotificationsEnabled) {
		return;
	}
	var notif = new Notification({
		title: 'Artix Game Launcher v.' + clientVersion,
		body: message,
		icon: path.join(__dirname, '/../icons/', iconName)
	});
	notif.show();
};

app.launchIQ = (url) => {
	if (iq_win != null) {
		iq_win.show();
	} else {
		app.iqIsPlaying = true;
		iq_win = new BrowserWindow({
			title: 'IdleQuest',
			width: 800,
			height: 600,
			backgroundColor: '#000000',
			show: true,
			resizable: false,
			useContentSize: true,
			webPreferences: {
				nodeIntegration: false,
				contextIsolation: false,
				preload: path.join(__dirname, './preload.js'),
				devTools: true,
				plugins: true
			}
		});

		iq_win.on('close', function (_) {
			app.iqIsPlaying = false;
			iq_win = null;
		});
		iq_win.loadURL(url); //'https://idlequest.artix.com/game/v/7/');
	}
};

app.clientVersion = () => {
	return clientVersion;
};

app.launchUpdateLink = async () => {
	if (IsUpdating) return;

	try {
		IsUpdating = true;
		const progressBar = new ProgressBar({
			title: 'Update',
			indeterminate: false,
			text: 'Downloading Update',
			detail: 'Downloading Latest Update'
		});

		await fs.promises.unlink(UpdateFilePath).catch(err => {
			devToolsLog('Previous updater cleanup:', err?.message);
		});

		const downloadResult = await new Promise((resolve, reject) => {
			DownloadManager.download({
				url: `${UpdateURL}${UpdateFilename}`,
				onProgress: (progress) => {
					if (progress < 100) progressBar.value = progress;
				}
			}, (error, info) => {
				if (error) reject(error);
				else resolve(info);
			});
		});

		progressBar.setCompleted();
		devToolsLog('Download completed:', downloadResult.url);

		const { response } = await dialog.showMessageBox({
			buttons: ['Yes', 'No'],
			message: 'Download Complete. Would you like to update now?'
		});

		mainWindow.reload();

		if (response === 0) {
			app.launchUpdateProcess();
		} else {
			shell.showItemInFolder(UpdateFilePath);
		}
	} catch (error) {
		devToolsLog('Update failed:', error?.message);
	} finally {
		IsUpdating = false;
	}
};

app.launchUpdateProcess = async () => {
	const isWindows = process.platform === 'win32';
	devToolsLog(process.platform);

	try {
		if (isWindows) {
			const progressBar = new ProgressBar({
				title: 'Launching Update',
				text: 'Launching Update',
				detail: 'Launching Update (Please be patient. This could take a while.)'
			});

			await shell.openExternal(UpdateFilePath);
			progressBar.setCompleted();
		} else {
			shell.showItemInFolder(UpdateFilePath);
		}

		app.isQuiting = true;
		app.iqIsPlaying = false;
		app.exit();
	} catch (error) {
		devToolsLog('Setting IsUpdating');
		IsUpdating = false;
		devToolsLog('Error Launching update.');

		if (isWindows) {
			await dialog.showMessageBox({
				buttons: ['Okay'],
				message: 'Error Launching update. Opening folder location'
			});
		}

		shell.showItemInFolder(UpdateFilePath);
	}
};

app.setGameWindows = (obj) => {
	try {
		gameWindows = obj;
		console.log(gameWindows);
	}
	catch (e) {
		devToolsLog("obj error");
	}
}


app.launchGame = (name) => {
	var size = gameWindows[name].size.split(',');
	var size_x = size[2].split('=')[1];
	var size_y = size[3].split('=')[1];
	var gameUrl = gameWindows[name].url;
	app.launchNewWindowURL(gameUrl, Number(size_x), Number(size_y));
	protocolLaunch = false;
};


app.launchNewWindowURL = (url, w, h, r = true, dev = true) => {
	var new_win = new BrowserWindow({
		width: w,
		height: h,
		backgroundColor: '#000000',
		show: true,
		resizable: r,
		useContentSize: true,
		autoHideMenuBar: true,
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: false,
			preload: path.join(__dirname, '/../preload.js'),
			devTools: dev,
			plugins: true,
			offscreen: {
				useSharedTexture: true
			},
		}
	});
	new_win.loadURL(url).then(() => {
		new_win.setAlwaysOnTop(false);
	}).catch(function () {
		new_win.close();

	});
}


app.clearCache = () => {
	session.defaultSession
		.clearCache()
		.then(() => {
			devToolsLog('ClearCache');
			if (!app.isQuiting)
				dialog.showMessageBox(mainWindow, { title: 'Cache Cleared', message: 'Cache Cleared Successfully' });
			app.SaveLocalData('config', {
				NotificationsEnabled: NotificationsEnabled,
				MinimizeToTray: MinimizeToTray,
				ClearDataOnExit: ClearDataOnExit
			});
		})
		.catch((reason) => {
			devToolsLog(reason);
		});
};

app.clearCookies = () => {
	devToolsLog('ClearCookies');
	session.defaultSession
		.clearStorageData({ storages: ['cookies', 'appcache'] })
		.then(() => {
			if (!app.isQuiting)
				dialog.showMessageBox(mainWindow, {
					title: 'Cookies Cleared',
					message: 'Cookies Cleared Successfully'
				});
			else app.quit();
		})
		.catch((reason) => {
			devToolsLog(reason);
		});
};



if (!gotTheLock) {
	app.isQuiting = true;
	app.quit();
} else {
	app.on('second-instance', (event, commandLine, workingDirectory) => {
		console.log("Second instance");
		var game = commandLine.pop().substring(8).replace('/', '');
		protocolLaunch = true;
		protocolGame = game;
		var loadURL = createLauncherURL();
		devToolsLog(game);
		app.launchGame(game);
		// Someone tried to run a second instance, we should focus our window.
		if (mainWindow != null) {
			mainWindow.show();
			mainWindow.loadURL(loadURL).catch(function () {
				app.isQuiting = true;
				app.quit();
			});
		}
	});
}

app.on('open-url', (event, url) => {
	var game = url.substring(8).replace('/', '');
	protocolLaunch = true;
	protocolGame = game;
	var gameURL = createLauncherURL();
	devToolsLog('open-url: ' + game);
	app.launchGame(game);
	// Someone tried to run a second instance, we should focus our window.
	if (mainWindow != null) {
		mainWindow.show();
		mainWindow.loadURL(gameURL);
		//mainWindow.loadURL(loadURL);
		//mainWindow.reload();
	}
});

let newAgentString = "";

//====================================//
app.once('ready', () => {
	isQuiting = true;
	let win = new BrowserWindow({
		title: 'Loading Artix Games',
		width: 1366,
		height: 768,
		backgroundColor: '#000000',
		show: false,
		webPreferences: {
			preload: path.join(__dirname, './preload.js'),
			nodeIntegration: false,
			contextIsolation: false,
			devTools: true,
			plugins: true,
			offscreen: {
				useSharedTexture: true
			},
			paintWhenInitiallyHidden: true,

		}
	});
	mainWindow = win;

	newAgentString = mainWindow.webContents.userAgent.replace(/Artix.*\s/, "");
	session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
		details.requestHeaders['User-Agent'] = newAgentString;
		details.requestHeaders['artixmode'] = 'launcher';
		callback({ cancel: false, requestHeaders: details.requestHeaders });
	});

	let checkval = NotificationsEnabled;
	let checkvalMin = MinimizeToTray;
	let checkvalClear = ClearDataOnExit;
	devToolsLog('Checked> ' + checkval);
	let menuTemplate = [
		{
			label: 'Show Launcher',
			id: 'Show Launcher',
			click: function () {
				win.show();
				win.reload();
			}
		},
		{
			label: 'Clear Cache',
			id: 'Clear Cache',
			click: function () {
				app.clearCache();
			}
		},
		{
			label: 'Clear All Data On Exit',
			id: 'Clear Data',
			type: 'checkbox',
			checked: checkvalClear,

			click: function (menuItem) {
				devToolsLog(menuItem.checked);
				ClearDataOnExit = menuItem.checked;
				app.SaveLocalData('config', {
					NotificationsEnabled: NotificationsEnabled,
					MinimizeToTray: MinimizeToTray,
					ClearDataOnExit: menuItem.checked
				});
			}
		},

		{
			label: 'Minimize to Tray',
			id: 'Minimize',
			type: 'checkbox',
			checked: checkvalMin,
			//visible: MinimizeVisible,
			click: function (menuItem) {
				devToolsLog(menuItem.checked);
				MinimizeToTray = menuItem.checked;
				app.SaveLocalData('config', {
					NotificationsEnabled: NotificationsEnabled,
					MinimizeToTray: menuItem.checked,
					ClearDataOnExit: ClearDataOnExit
				});
			}
		},

		{
			label: 'Enable Notifications',
			id: 'Enable Notifications',
			type: 'checkbox',
			checked: checkval,

			click: function (menuItem) {
				devToolsLog(menuItem.checked);
				NotificationsEnabled = menuItem.checked;
				app.SaveLocalData('config', {
					NotificationsEnabled: menuItem.checked,
					MinimizeToTray: MinimizeToTray,
					ClearDataOnExit: ClearDataOnExit
				});
			}
		},

		{ type: 'separator' },
		{
			label: 'AdventureQuest',
			id: 'AdventureQuest',
			click: function () {
				app.launchGame('aq');
			}
		},
		{
			label: 'AdventureQuest 3D',
			id: 'AdventureQuest 3D',
			click: function () {
				app.launch3D();
			}
		},
		{
			label: 'AdventureQuest Worlds',
			id: 'AdventureQuest Worlds',
			click: function () {
				app.launchGame('aqw');
			}
		},
		{
			label: 'Dragonfable',
			id: 'Dragonfable',
			click: function () {
				app.launchGame('df');
			}
		},
		{
			label: 'Ebil Games',
			id: 'Ebil Games',
			click: function () {
				app.launchGame('ebil');
			}
		},
		{
			label: 'Epic Duel',
			id: 'Epic Duel',
			click: function () {
				app.launchGame('ed');
			}
		},
		{
			label: 'IdleQuest',
			id: 'IdleQuest',
			click: function () {
				app.launchGame('iq');
			}
		},
		{
			label: 'MechQuest',
			id: 'MechQuest',
			click: function () {
				app.launchGame('mq');
			}
		},
		{
			label: 'Oversoul',
			id: 'Oversoul',
			click: function () {
				app.launchGame('os');
			}
		},

		{ type: 'separator' },

		{
			label: 'Exit',
			id: 'Exit',
			click: function () {
				app.iqIsPlaying = false;
				app.isQuiting = true;
				app.clearCache();
				if (ClearDataOnExit) {
					app.clearCookies();
				} else {
					app.quit();
				}
			}
		}
	];
	if (isMac) //process.platform == 'darwin')
	{
		menuTemplate.splice(3, 1);
	}
	contextMenu = Menu.buildFromTemplate(menuTemplate);

	app.LoadLocalData('config', function (data) {
		if (!isMac) //process.platform != 'darwin')
			MinimizeToTray = contextMenu.getMenuItemById('Minimize').checked;
		else
			MinimizeToTray = true;
		NotificationsEnabled = contextMenu.getMenuItemById('Enable Notifications').checked;
		ClearDataOnExit = contextMenu.getMenuItemById('Clear Data').checked;

		if ('NotificationsEnabled' in data) {
			NotificationsEnabled = data.NotificationsEnabled;
		}
		if ('ClearDataOnExit' in data) {
			ClearDataOnExit = data.ClearDataOnExit;
		}

		if ('MinimizeToTray' in data) {
			if (!isMac) //process.platform != 'darwin') 
				MinimizeToTray = data.MinimizeToTray;
			else
				MinimizeToTray = true;
		}
		app.SaveLocalData('config', {
			NotificationsEnabled: NotificationsEnabled,
			MinimizeToTray: MinimizeToTray,
			ClearDataOnExit: ClearDataOnExit
		});
		if (!isMac) { //process.platform != 'darwin') {
			contextMenu.getMenuItemById('Minimize').checked = MinimizeToTray;
		}
		contextMenu.getMenuItemById('Enable Notifications').checked = NotificationsEnabled;
		contextMenu.getMenuItemById('Clear Data').checked = ClearDataOnExit;
	});

	protocol.registerHttpProtocol('artix', (req) => {
		var game = req.url.substring(8);
		app.launchGame(game);
		protocolLaunch = true;
		protocolGame = game;

		devToolsLog('Got Protocol request: ' + protocolGame);
	});

	var launcherURL = createLauncherURL();

	win.loadURL(launcherURL, options).then(function () {
		if (protocolLaunch) {
			app.launchGame(protocolGame);
		}
	}).catch(function () {
		devToolsLog("Closing in 5 seconds");
		app.isQuiting = true;
		setTimeout(() => {
			app.isQuiting = true;
			app.quit();
		}, 5000);
		dialog.showMessageBox(
			win,
			{
				title: 'Failed to connect',
				message: 'Could not connect. Please try again later. The Application will exit automatically'
			},
		);

	});
	win.setIcon(path.join(__dirname, '/../icons/', iconName));

	win.on('ready-to-show', () => {
		if (protocolLaunch == true) {
			//protocolLaunch = false;
			app.launchGame(protocolGame);
		}
	});

	win.once('did-finish-load', function (event) {
		win.show();
	});

	win.once('page-title-updated', function (event) {
		clearTimeout(mainWinTimer);
		//mainWinProgressBar.setCompleted();
		win.show();
		win.title = 'Artix Game Launcher v.' + clientVersion;
		app.isQuiting = false;

		if (process.platform != 'darwin') {
			appIcon = new Tray(path.join(__dirname, '/../icons/', 'Artix_DragonSquare_32x32.png'));
			appIcon.setToolTip('Artix Game Launcher v.' + clientVersion);
			appIcon.setContextMenu(contextMenu);
			appIcon.on('double-click', function () {
				win.show();
				win.reload();
			});
			appIcon.on('click', function () {
				appIcon.popUpContextMenu();
			});
		} else {
			app.dock.setMenu(contextMenu);
			app.dock.setIcon(path.join(__dirname, '/../icons/', iconName));
		}
	});

	win.on('close', function (event) {
		if (!app.isQuiting && MinimizeToTray) {
			event.preventDefault();
			app.ShowNotification('Minimized to system tray. Right Click icon to exit.');
			win.hide();
		} else if (!MinimizeToTray) {
			app.clearCache();
			if (ClearDataOnExit) {
				app.clearCookies();
			}
			app.isQuiting = true;
			app.quit();
		}
		return false;
	});
});

app.on('browser-window-created', function (e, win) {
	win.devTools = true;
	win.backgroundColor = '#000000';
	win.setMenuBarVisibility(false);
	//	win.setIcon(path.join(__dirname, '/../icons/', iconName));
	win.webContents.on('before-input-event', (event, input) => {
		if ((input.control && input.key.toLowerCase() === 'arrowleft') && win.webContents.canGoBack()) {
			console.log('Pressed back');
			win.webContents.goBack()
			event.preventDefault();
		}
		else if ((input.control && input.key.toLowerCase() === 'arrowright') && win.webContents.canGoForward()) {
			console.log('Pressed forward');
			win.webContents.goForward()
			event.preventDefault();
		}
		else if ((input.control && input.key === "i")) {
			console.log("Opened devtools");
			win.webContents.openDevTools();
		}
	});
	win.on('close', function () {
		for (var i = 0; i < tempTimers.length; i++) {
			clearTimeout(tempTimers[i]); // clear all the timeouts
		}
		tempTimers = [];//empty the id array
	});

	win.webContents.setZoomFactor(1.0);

	// Upper Limit is working of 500 %
	win.webContents
		.setVisualZoomLevelLimits(1, 5)
		.then(console.log("Zoom Levels Have been Set between 100% and 500%"))
		.catch((err) => console.log(err));

	win.webContents.on("zoom-changed", (event, zoomDirection) => {
		console.log(zoomDirection);
		var currentZoom = win.webContents.getZoomFactor();
		console.log("Current Zoom Factor - ", currentZoom);
		// console.log('Current Zoom Level at - '
		// , win.webContents.getZoomLevel());
		console.log("Current Zoom Level at - ", win.webContents.zoomLevel);

		if (zoomDirection === "in") {

			// win.webContents.setZoomFactor(currentZoom + 0.20);
			win.webContents.zoomFactor = currentZoom + 0.2;

			console.log("Zoom Factor Increased to - "
				, win.webContents.zoomFactor * 100, "%");
		}
		if (zoomDirection === "out") {

			// win.webContents.setZoomFactor(currentZoom - 0.20);
			win.webContents.zoomFactor = currentZoom - 0.2;

			console.log("Zoom Factor Decreased to - "
				, win.webContents.zoomFactor * 100, "%");
		}
	});

});


app.on('will-quit', function (event) {
	if (!app.isQuiting) {
		event.preventDefault();
	}
	else {
		MinimizeToTray = false;
		app.quit();
	}
	return false;
});

app.on('window-all-closed', function (event) {
	if (!app.isQuiting && MinimizeToTray) {
		event.preventDefault();
	}
	return false;
});


app.on('quit', function (event) {
	devToolsLog('Received Quit');
	if (!app.isQuiting) app.clearCache();
	if (ClearDataOnExit && !app.isQuiting) {
		devToolsLog('Clear Data?');
		app.isQuiting = true;
		app.clearCookies();
		event.preventDefault();
		return true;
	}
	if (!MinimizeToTray) {
		app.isQuiting = true;
		app.iqIsPlaying = false;
	}
	if (process.platform == 'darwin') {
		app.isQuiting = true;
	}
	if (!app.isQuiting) {
		event.preventDefault();
	}
	return false;
});
