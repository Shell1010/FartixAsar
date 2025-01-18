const { remote } = require('electron');




window.interop = {
    
    SaveLocalData(key, obj)
    {
        remote.app.SaveLocalData(key, obj);
    },

    LoadLocalData(key, callback)
    {
        remote.app.LoadLocalData(key, callback);
    },
    ShowNotification(message)
    { 
        remote.app.ShowNotification(message);  
    },

    IQEnabled()
    {
        return "Enabled";
    },

    launchIQ(url)
    {
        remote.app.launchIQ(url);
    },

    launch3D() {
        remote.app.launch3D(); //openExternal("steam://rungameid/429790","_self");
    },

    clientVersion()
    {
        return remote.app.clientVersion();
    },

    launchUpdateLink()
    {
        remote.app.launchUpdateLink();
    },

    clearCache()
    {
        remote.app.clearCache();
    },

    clearCookies()
    {
        remote.app.clearCookies();
    },
    setGameWindows(obj)
    {
        remote.app.setGameWindows(obj);
    }
};
