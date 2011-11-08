var flvideoreplacerPlugins = {

		pluginSwitch: function() {
			
			"use strict";

			//access preferences interface
			this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.flvideoreplacer.");

			//get plugin compatibility
			var pluginmkv = this.prefs.getBoolPref("pluginmkv");
			var pluginxth = this.prefs.getBoolPref("pluginxth");
			var pluginxtp = this.prefs.getBoolPref("pluginxtp");
			var pluginxin = this.prefs.getBoolPref("pluginxin");
			var pluginvlc = this.prefs.getBoolPref("pluginvlc");
			var pluginwmp = this.prefs.getBoolPref("pluginwmp");
			var pluginwmv = this.prefs.getBoolPref("pluginwmv");
			var pluginmov = this.prefs.getBoolPref("pluginmov");
			var pluginqt = this.prefs.getBoolPref("pluginqt");
			var pluginm4v = this.prefs.getBoolPref("pluginm4v");
			var pluginmp4 = this.prefs.getBoolPref("pluginmp4");
			var pluginflv = this.prefs.getBoolPref("pluginflv");
			
			if(pluginxtp === true){
				return "application/x-totem-plugin";
			}else{
				if(pluginxth === true){
					return "video/x-theora";
				}else{
					if(pluginvlc === true){
						return "application/x-vlc-plugin";
					}else{
						if(pluginxin === true){
							return "application/x-xine-plugin";
						}else{
							if(pluginmkv === true){
								return "video/x-matroska";
							}else{
								if(pluginmp4 === true){
									return "video/mp4";
								}else{
									if(pluginm4v === true){
										return "video/x-m4v";
									}else{
										if(pluginqt === true){
											return "video/quicktime";
										}else{
											if(pluginmov === true){
												return "video/x-quicktime";
											}else{
												if(pluginwmp === true){
													return "application/x-mplayer2";
												}else{
													if(pluginwmv === true){
														return "application/x-ms-wmv";
													}else{
														if(pluginflv === true){
															return "application/x-flv";
														}else{
															return false;
														}										
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}		
		}
};