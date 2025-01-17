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
    //LogPage(launchMode + " Launch " + navigator.userAgent);
	if (launchMode == "chrome-nw"|| launchMode == "electron")
	{
		if(name.indexOf('-') > -1)
		{
			var gameName = name.split('-')[1];
			
			if(gameName == 'iq' && window.interop)
			{
				if(window.interop.launchIQ)
				{
					window.interop.launchIQ(gameWindows[gameName].url);
				}
				else
				{
				//	window.open(gameWindows[name].url, "", gameWindows[name].size);
					alert("Please update your launcher to run IdleQuest");
				}
				
			}
			else if(gameName == 'iq')
			{
				alert("Please update your launcher to run IdleQuest");
			}
			
			
			else if(gameName == "aq3d")
			{
				
				if(window.interop)
				{
					window.interop.launch3D();
				}
				else {
				//if(confirm("Launch AQ3D?  Requires Steam"))
				//{
					aq3dwin = window.open("", "", "top=30,left=30,width=500,height=300");
					//aq3dwin.setTimeout( function () {
						aq3dwin.setTimeout(close, 10000);
						aq3dwin.open("steam://rungameid/429790","_self");
					//}, 1000);
				//}
				//else {
				//	window.open(gameWindows[gameName].url, "", gameWindows[gameName].size);	
				//}
				}
			}
			
			else {
				window.open(gameWindows[gameName].url, "", gameWindows[gameName].size);
			}
			
		}
		else
		{
			window.open(gameWindows[name].url, "", gameWindows[name].size);
		}
	}
    else if (navigator.platform == "MacIntel") {
        window.webkit.messageHandlers.native.postMessage(name)
    }
    else if (navigator.platform.indexOf("Linux") > -1) {
        launch_game(name)
    }
    else {
        switch (launchMode) {
            case "chrome":
                callbackObj.onUIMessage(name);
                break;
            case "gecko":
                geckoDispatch("OnUIMessage", name);
                break;
            default:
                window.external.OnUIMessage(name)
                break;
        }
    }
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
    //LogPage("Launch "+launchMode);
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
   // LogPage("Dispatch Message to gecko " + msg + "," + str);
    var event = document.createEvent('MessageEvent');
    event.initMessageEvent(msg, true, true, str, null, 1234, null, null);
    document.dispatchEvent(event);
}


function chromeDispatch(str) {
   // LogPage("Dispatch Message to chrome " + msg);
    callbackObj.onUIMessage(msg);
}

function LogPage(msg) {
   // var elem = document.createElement('div');
   // elem.innerHTML = "<p>" + msg + "</p>";
   // document.body.appendChild(elem);
}

function ShowUpdate()
{	
	var upLi = document.createElement("li");
	//<a href='javascript:alert('Hi')'>ClickMe</a>
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
	//<a href='javascript:alert('Hi')'>ClickMe</a>
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
   // LogPage(navigator.userAgent + " : " + navigator.platform);
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
			//var upDiv = document.createElement("div");
			//upDiv.innerHTML = "<p align=center> New Version Available! Get it <a href='javascript:window.interop.launchUpdateLink()'>Here</a></p>"
			//document.body.appendChild(upDiv);
			ShowUpdate();
			//console.log("Interop detected: Client version: "+window.interop.clientVersion());
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
	//if(launchMode != "chrome-nw")
	//{
		// var conf = confirm("New version available! Please uninstall this version before upgrading. Would you like to download the latest launcher now?")
        //  if( conf) {
        //    OpenExternalBrowser("http://www.artix.com/downloads/artixlauncher/");
        //    window.close();
        //  }
	//}
    onLoadedWebView();
});