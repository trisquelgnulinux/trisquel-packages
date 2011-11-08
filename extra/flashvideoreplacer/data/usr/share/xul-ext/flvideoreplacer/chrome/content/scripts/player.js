var flvideoreplacerPlayer = {

	startPlayer: function() {//detect video path and start player
		
		"use strict";

	    //access preferences interface
	    this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
	    .getService(Components.interfaces.nsIPrefService)
	    .getBranch("extensions.flvideoreplacer.");

	    //get video path from prefs
	    var loc = this.prefs.getCharPref("videourl");
	    //store video file path in player
	    document.getElementById('flvideoreplacervideo').setAttribute('src', loc);
	    this.prefs.setCharPref("videourl","");
	}
};
window.addEventListener("load",function(){ flvideoreplacerPlayer.startPlayer(); },true);