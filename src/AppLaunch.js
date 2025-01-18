var version = 103;
var launcherVersion = 207;
var launchMode = "IE";
var aq3dwin;

var gameWindows =
{
    aqw: { url:"https://www.aq.com/game/gamefiles/Loader.swf?ver=7", size:"top=100,left=15,width=960,height=580" },
    aqwcreate: { url:"https://www.aq.com/landing/", size:"top=160,left=30,width=960,height=580" },
    ed: { url:"https://epicduelstage.artix.com/omegaLoader14.swf", size:"top=190,left=45,width=1016,height=700" },
    mq: { url:"https://play.mechquest.com/game/gamefiles/MQLoader.swf", size:"top=120,left=60,width=1016,height=700" },
    df: { url:"https://play.dragonfable.com/game/DFLoader.swf?ver=2", size:"top=150,left=75,width=1016,height=700" },
    os: { url:"https://oversoul.artix.com/game/OSGame0_9_4g.swf", size:"top=180,left=90,width=960,height=580" },
    aq: { url:	"https://aq.battleon.com/game/flash/LoaderAQ.swf", size:"top=210,left=105,width=800,height=600" },
    aq3d: { url:"https://store.steampowered.com/app/429790/AdventureQuest_3D/", size:"top=240,left=120,width=1016,height=700" },
	iq: { url:"https://idlequest.artix.com/game/v/7/", size:"top=180,left=85,width=800,height=600" },
    ebil: { url:"http://www.ebilgames.com", size:"top=270,left=135,width=1024,height=700" }
};


function LaunchApp(name) {
  const platform = navigator.userAgentData?.platform || 
                  (typeof process !== 'undefined' ? process.platform : 'unknown');
  const isMac = platform.toLowerCase().includes('mac');
  
  const gameHandlers = {
    iq: () => {
      if (window.interop?.launchIQ) {
        window.interop.launchIQ(gameWindows.iq.url);
      } else {
        alert("Please update your launcher to run IdleQuest");
      }
    },
    aq3d: () => {
      if (window.interop?.launch3D) {
        window.interop.launch3D();
      } else {
        const win = window.open("steam://rungameid/429790", "_blank");
        win?.setTimeout(close, 10000);
      }
    },
    default: (gameName) => {
      const { url, size } = gameWindows[gameName] || {};
      if (url && size) window.open(url, "", `${size},toolbar=yes,location=yes,status=yes,menubar=yes,scrollbars=yes,resizable=yes`);
    }
  };

  const platformHandlers = {
    "chrome-nw": () => {
      const gameName = name.split('-')[1] || name;
      (gameHandlers[gameName] || gameHandlers.default)(gameName);
    },
    electron: () => platformHandlers["chrome-nw"](),
    mac: () => window.webkit?.messageHandlers?.native?.postMessage(name),
    linux: () => {},
    default: () => {
      const dispatch = {
        chrome: () => callbackObj.onUIMessage(name),
        gecko: () => geckoDispatch("OnUIMessage", name),
        default: () => console.warn("Unsupported launch mode")
      };
      (dispatch[launchMode] || dispatch.default)();
    }
  };

  const handler = platformHandlers[launchMode] || 
                 (isMac ? platformHandlers.mac : platformHandlers.default);
  handler();
}


function launchAq3d()
{
	aq3dwin.open("steam://rungameid/429790","","top=30,left=30,width=600,height=300");
	aq3dwin.setTimeout(close, 10000);
}

function onLoadedWebView() {
    if (navigator.platform == "MacIntel") {
        window.webkit.messageHandlers.native.postMessage("WebViewLoaded")
    }
    else if (launchMode == "chrome") {
        callbackObj.onUIMessage("WebViewLoaded");
    }
    else if (launchMode == "gecko") {
        geckoDispatch("OnUIMessage", "WebViewLoaded");
    }
}


function setVersion(v) {
    if (v < version) {
        showUpgradeLink()
    }
    version = v
    if (navigator.platform == "MacIntel") {
        window.webkit.messageHandlers.native.postMessage("SETVERSION:  " + version)
    }
    else if (version > 102) {
        document.getElementById("ccache").style.display = 'inline';
        if (launchMode == "chrome") {
            callbackObj.onUIMessage("SETVERSION " + version);
        }
        else {
            geckoDispatch("OnUIMessage", "SETVERSION " + version);
        }
    }
}


function showUpgradeLink() {
    if (navigator.platform == "MacIntel") {
        document.getElementById("upgrade-mac").style.display = 'inline';
    }
    else {
        document.getElementById("upgrade-win").style.display = 'inline';
    }
}


function OpenExternalBrowser(url) {
    if(launchMode == "chrome-nw" || launchMode == "electron")
	{
		window.open(url, "", "top=240,left=120,width=1016,height=700");
	}
	else if (navigator.platform == "MacIntel") {
        window.webkit.messageHandlers.native.postMessage("OpenExternalBrowser," + url)
    }
    else if (navigator.platform.indexOf("Linux") > -1) {
        open_url(url)
    }
    else {
        switch (launchMode) {
            case "chrome":
                callbackObj.openExternalBrowser(url);
                break;
            case "gecko":
                geckoDispatch("OpenExternalBrowser", url)
                break;
            default:
                window.external.OpenExternalBrowser(url)
                break;
        }
    }
}


function geckoDispatch(msg, str) {
    var event = document.createEvent('MessageEvent');
    event.initMessageEvent(msg, true, true, str, null, 1234, null, null);
    document.dispatchEvent(event);
}


function chromeDispatch(str) {
    callbackObj.onUIMessage(msg);
}

function ShowUpdate()
{	
	var upLi = document.createElement("li");
	upLi.innerHTML = "<li><a title='New Version Available' href='javascript:window.interop.launchUpdateLink()'>Update Launcher</a> <sup style='color:red'>New!</sup></li>"
	document.getElementById('topnav').appendChild(upLi);
}

function OpenUpdateLegacy()
{
	OpenExternalBrowser('https://www.artix.com/downloads/artixlauncher/');
}
function ShowUpdateLegacy()
{
	var upLi = document.createElement("li");
	upLi.innerHTML = "<li><a title='New Version Available' href='javascript:window.interop.launchUpdateLink()'>Update Launcher</a> <sup style='color:red'>New!</sup></li>"
	document.getElementById('topnav').appendChild(upLi);
}

function ClearCookies() {
	if(window.interop.clientVersion() >= 205)
		window.interop.clearCookies();
}

function ClearCache() {
	if(window.interop.clientVersion() >= 205)
		window.interop.clearCache();
}

$(document).ready(function () {
	if (navigator.userAgent.indexOf("Chrome/73") > -1) {
        launchMode = "chrome-nw";
    }
    else if (navigator.userAgent.indexOf("Chrome") > -1) {
        launchMode = "chrome";
    }
    else if (navigator.userAgent.indexOf("MSIE") > -1) {
        launchMode = "IE";
    }
    else {
        launchMode = "gecko";
    }
	if(window.interop)
	{
		launchMode = "electron";
		if(window.interop.clientVersion() < launcherVersion) 
		{
			ShowUpdate();
		}
		
		if(window.interop.clientVersion() >= 205)
		{
			document.getElementById('clearSettings').style.display = 'block'
		}
		document.title += ' v.'+window.interop.clientVersion();
	}
	else
	{
		document.title += ' v.'+version;
		ShowUpdateLegacy();
	}
    onLoadedWebView();
});

