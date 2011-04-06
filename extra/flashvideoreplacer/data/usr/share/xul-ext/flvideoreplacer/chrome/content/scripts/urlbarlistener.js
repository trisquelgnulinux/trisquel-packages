var flvideoreplacerUrlBarListener = {

	QueryInterface: function(aIID) {
	    if (aIID.equals(Components.interfaces.nsIWebProgressListener) ||
		    aIID.equals(Components.interfaces.nsISupportsWeakReference) ||
		    aIID.equals(Components.interfaces.nsISupports))
		return this;
	    throw Components.results.NS_NOINTERFACE;
	},

	onLocationChange: function(aProgress, aRequest, aURI) {
	    flvideoreplacerURLBar.processNewURL(aURI);
	},

	onStateChange: function(a, b, c, d) {},
	onProgressChange: function(a, b, c, d, e, f) {},
	onStatusChange: function(a, b, c, d) {},
	onSecurityChange: function(a, b, c) {}
};

var flvideoreplacerURLBar = {

	oldURL: null,

	init: function() {
	    //listen for webpage loads
	    gBrowser.addProgressListener(flvideoreplacerUrlBarListener,
		    Components.interfaces.nsIWebProgress.NOTIFY_LOCATION);
	},

	uninit: function() {
	    gBrowser.removeProgressListener(flvideoreplacerUrlBarListener);
	},

	processNewURL: function(aURI) {

	    if (aURI.spec == this.oldURL) {
		return;
	    }else{

		if(aURI.spec.match(/av.*vimeo.*com.*token/)){

		    //get osString
		    var osString = Components.classes["@mozilla.org/network/protocol;1?name=http"].getService(Components.interfaces.nsIHttpProtocolHandler).oscpu; 

		    //access preferences interface
		    this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
		    .getService(Components.interfaces.nsIPrefService)
		    .getBranch("extensions.flvideoreplacer.");

		    //get prefs
		    var playerpath = this.prefs.getCharPref("playerpath");
		    var mimetype = this.prefs.getCharPref("filemime");
		    var baseurl = this.prefs.getCharPref("videourl");
		    var alertserror = this.prefs.getBoolPref("alertserror");

		    var videoid = baseurl.replace(/.*clip:/,"").replace(/\/.*/,"");
		    //get localization
		    var strbundle = document.getElementById("flvideoreplacerstrings");
		    //declare variables
		    var videourl = aURI.spec;
		    var message, messagetitle, alertsService, player, process;

		    //set videourl pref
		    this.prefs.setCharPref("videourl",videourl);

		    //access preferences interface
		    this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
		    .getService(Components.interfaces.nsIPrefService)
		    .getBranch("extensions.flvideoreplacer.downloadersource.");
		    //store download path
		    this.prefs.setCharPref(videoid,videourl);

		    if(osString.match(/OSX/) || osString.match(/Macintosh/) || osString.match(/OS X/)){

			try{
			    if(playerpath !== "" && !playerpath.match(/\*\*\*/)){

				//initiate player
				player = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
				player.initWithPath(playerpath);
				if (player.exists()) {//match if player exists and launch it
				    process = Components.classes['@mozilla.org/process/util;1'].createInstance(Components.interfaces.nsIProcess);
				    process.init(player);
				    var arguments = [""+videourl+""];
				    process.run(false, arguments, arguments.length);
				}
			    }else{
				if(alertserror === true){
				    message = strbundle.getFormattedString("nostandalone", [ mimetype ]);
				    messagetitle = strbundle.getString("flvideoreplacermessage");
				    //alert user
				    prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
				    prompts.alert(window, messagetitle, message);
				}
			    }
			}catch (e){

			    if(alertserror === true){
				message = strbundle.getFormattedString("noreplace", [ mimetype ]);
				messagetitle = strbundle.getString("flvideoreplacermessage");
				//alert user
				prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
				prompts.alert(window, messagetitle, message);
			    }
			}

		    }else{
			try{
			    if(playerpath !== "" && !playerpath.match(/\*\*\*/)){
				//initiate player
				player = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
				player.initWithPath(playerpath);
				if (player.exists()) {//match if player exists and launch it
				    process = Components.classes['@mozilla.org/process/util;1'].createInstance(Components.interfaces.nsIProcess);
				    process.init(player);
				    var arguments = [""+videourl+""];
				    process.run(false, arguments, arguments.length);
				}
			    }else{

				if(alertserror === true){
				    message = strbundle.getFormattedString("nostandalone", [ mimetype ]);
				    messagetitle = strbundle.getString("flvideoreplacermessage");
				    //alert user
				    alertsService = Components.classes["@mozilla.org/alerts-service;1"].getService(Components.interfaces.nsIAlertsService);
				    alertsService.showAlertNotification("chrome://flvideoreplacer/skin/icon48.png", messagetitle, message, false, "", null);
				}
			    }
			}catch (e){

			    if(alertserror === true){
				message = strbundle.getFormattedString("noreplace", [ mimetype ]);
				messagetitle = strbundle.getString("flvideoreplacermessage");
				//alert user
				alertsService = Components.classes["@mozilla.org/alerts-service;1"].getService(Components.interfaces.nsIAlertsService);
				alertsService.showAlertNotification("chrome://flvideoreplacer/skin/icon48.png", messagetitle, message, false, "", null);
			    }
			}
		    }
		    try{
			aTab = document.getElementById("FlashVideoReplacerVimeo");
			gBrowser.removeTab(aTab);
		    }catch(e){
			//do nothing
		    }
		    flvideoreplacerURLBar.uninit();
		}
	    }
	    this.oldURL = aURI.spec;
	}
};
//window.addEventListener("unload", function() {flvideoreplacerURLBar.uninit()}, false);