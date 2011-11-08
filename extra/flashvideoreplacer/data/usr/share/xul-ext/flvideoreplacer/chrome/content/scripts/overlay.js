var flvideoreplacerOverlay = {
		
		changePref : function(aPreference,aType,aValue) {
			
			"use strict";

			//access preferences interface
			this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.flvideoreplacer.");

			if (aType === "bool"){
				//set path
				this.prefs.setBoolPref(aPreference, aValue);
			}
			if (aType === "string"){
				//set path
				this.prefs.setCharPref(aPreference, aValue);
			}
			if (aType === "integer"){
				//set path
				this.prefs.setIntPref(aPreference, aValue);
			}
		}		
};