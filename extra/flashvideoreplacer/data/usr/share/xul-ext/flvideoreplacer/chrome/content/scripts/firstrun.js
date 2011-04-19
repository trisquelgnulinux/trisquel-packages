var flvideoreplacerFirstrun = {

		init : function() {// get current version from extension manager

			// access preferences interface
			this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.flvideoreplacer.");

			try {// Firefox <= 3.6

				// store browser version
				this.prefs.setIntPref("performance", 3);

				var gExtensionManager = Components.classes["@mozilla.org/extensions/manager;1"]
				.getService(Components.interfaces.nsIExtensionManager);
				var current = gExtensionManager.getItemForID("flvideoreplacer@lovinglinux.megabyet.net").version;

				flvideoreplacerFirstrun.updateInstall(current);

			} catch (e) {// Firefox >=4.0

				// store browser version
				this.prefs.setIntPref("performance", 4);

				Components.utils.import("resource://gre/modules/AddonManager.jsm");
				AddonManager.getAddonByID("flvideoreplacer@lovinglinux.megabyet.net", function(addon) {
					var current = addon.version;
					flvideoreplacerFirstrun.updateInstall(current);
				});
			}
			window.removeEventListener("load", function() {	flvideoreplacerFirstrun.init();	}, true);
		},

		updateInstall : function(aVersion) {// check version and perform updates

			// get osString
			var osString = Components.classes["@mozilla.org/network/protocol;1?name=http"]
			.getService(Components.interfaces.nsIHttpProtocolHandler).oscpu;

			// access preferences interface
			this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.flvideoreplacer.");

			//get localization
			var strbundle = document.getElementById("flvideoreplacerstrings");
			var enabledstring = strbundle.getString("enabled");
			var notsupportedstring = strbundle.getString("notsupported");
			var disabledstring = strbundle.getString("disabled");

			// firstrun, update and current declarations
			var ver = -1, firstrun = true, current = aVersion, dir;

			try {// check for existing preferences
				ver = this.prefs.getCharPref("version");
				firstrun = this.prefs.getBoolPref("firstrun");
			} catch (e) {
				// nothing
			} finally {

				if (firstrun) {// actions specific for first installation

					// add toolbar button
					var navbar = document.getElementById("nav-bar");
					var newset = navbar.currentSet + ",flvideoreplacer-toolbar-button";
					navbar.currentSet = newset;
					navbar.setAttribute("currentset", newset);
					document.persist("nav-bar", "currentset");

					// set preferences
					this.prefs.setBoolPref("firstrun", false);
					this.prefs.setCharPref("version", current);

					// set default dir pref
					var dir = this.prefs.getCharPref("downdir");
					if (dir === "") {
						// set download dir
						var defaultdir = Components.classes["@mozilla.org/file/directory_service;1"]
						.getService(Components.interfaces.nsIProperties)
						.get("Desk", Components.interfaces.nsIFile);

						this.prefs.setCharPref("downdir", defaultdir.path);
					}
				}

				if (ver != current && !firstrun) {// actions specific for
					// extension updates

					if (!ver.match(/2\..*/)) {

						// add toolbar button
						var navbar = document.getElementById("nav-bar");
						var newset = navbar.currentSet + ",flvideoreplacer-toolbar-button";
						navbar.currentSet = newset;
						navbar.setAttribute("currentset", newset);
						document.persist("nav-bar", "currentset");

						// set default dir pref
						var dir = this.prefs.getCharPref("downdir");
						if (dir === "") {
							// set download dir
							var defaultdir = Components.classes["@mozilla.org/file/directory_service;1"]
							.getService(Components.interfaces.nsIProperties)
							.get("Desk", Components.interfaces.nsIFile);

							this.prefs.setCharPref("downdir", defaultdir.path);
						}
						// reset method because of deleted prompt method
						this.prefs.setCharPref("method", "embedded");
						this.prefs.setCharPref("promptmethod", "embedded");
					}
					// set preferences
					this.prefs.setCharPref("version", current);
				}

				// get prefs
				var enabled = this.prefs.getBoolPref("enabled");
				// toggle toolbar button style
				if (enabled === true) {
					var url = gBrowser.currentURI.spec;
					if(url.match(/youtube\.com/)
							|| url.match(/vimeo\.com/)
							|| url.match(/metacafe\.com/)
							|| url.match(/blip\.tv/)
							|| url.match(/ustream\.tv/)
							|| url.match(/youporn\.com/)
							|| url.match(/pornhub\.com/)
							|| url.match(/redtube\.com/)
					){
						document.getElementById("flvideoreplacer-toolbar-button").setAttribute('class',"toolbarbutton-1 chromeclass-toolbar-additional toolbaractive");
						document.getElementById("flvideoreplacer-toolbar-button").setAttribute('tooltiptext',enabledstring);
					}else{
						document.getElementById("flvideoreplacer-toolbar-button").setAttribute('class',"toolbarbutton-1 chromeclass-toolbar-additional toolbarnosupport");
						document.getElementById("flvideoreplacer-toolbar-button").setAttribute('tooltiptext',notsupportedstring);
					}
				} else {
					document.getElementById("flvideoreplacer-toolbar-button").setAttribute('class', "toolbarbutton-1 chromeclass-toolbar-additional toolbarinactive");
					document.getElementById("flvideoreplacer-toolbar-button").setAttribute('tooltiptext',disabledstring);
				}
			}
		},

		pluginCheck : function() {

			// get osString
			var osString = Components.classes["@mozilla.org/network/protocol;1?name=http"]
			.getService(Components.interfaces.nsIHttpProtocolHandler).oscpu;

			// access preferences interface
			this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.flvideoreplacer.");

			// reset plugin check
			this.prefs.setBoolPref("pluginflash", false);
			this.prefs.setBoolPref("pluginmp4", false);
			this.prefs.setBoolPref("pluginflv", false);
			this.prefs.setBoolPref("pluginqt", false);
			this.prefs.setBoolPref("pluginwmp", false);
			this.prefs.setBoolPref("pluginwmv", false);
			this.prefs.setBoolPref("pluginmov", false);
			this.prefs.setBoolPref("pluginm4v", false);
			// get prefs
			var pluginforce = this.prefs.getBoolPref("pluginforce");

			// initiate file
			var pluginreg = Components.classes["@mozilla.org/file/directory_service;1"]
			.getService(Components.interfaces.nsIProperties)
			.get("ProfD", Components.interfaces.nsIFile);
			pluginreg.append("pluginreg.dat");

			if (pluginreg.exists()) {

				// disable forceplugin
				// this.prefs.setBoolPref("pluginforce",false);

				// read file
				var istream = Components.classes["@mozilla.org/network/file-input-stream;1"]
				.createInstance(Components.interfaces.nsIFileInputStream);
				istream.init(pluginreg, 0x01, 444, 0);
				istream.QueryInterface(Components.interfaces.nsILineInputStream);

				var line = {}, lines = [], hasmore;
				do {
					hasmore = istream.readLine(line);
					lines.push(line.value);

					// check plugins by mime-type
					var pluginflash = /Shockwave Flash/.test(line.value);
					if (pluginflash === true) {
						this.prefs.setBoolPref("pluginflash", true);
					}
					// check plugins by mime-type
					var pluginflv = /video.*x.*flv/.test(line.value);
					if (pluginflv === true) {
						this.prefs.setBoolPref("pluginflv", true);
					}
					var pluginmp4 = /video.*mp4/.test(line.value);
					if (pluginmp4 === true) {
						this.prefs.setBoolPref("pluginmp4", true);
					}
					var pluginm4v = /video.*x-m4v/.test(line.value);
					if (pluginm4v === true) {
						this.prefs.setBoolPref("pluginm4v", true);
					}
					var pluginqt = /video.*quicktime/.test(line.value);
					if (pluginqt === true) {
						this.prefs.setBoolPref("pluginqt", true);
					}
					var pluginmov = /video.*x-quicktime/.test(line.value);
					if (pluginmov === true) {
						this.prefs.setBoolPref("pluginmov", true);
					}
					var pluginwmp = /application.*x-mplayer2/.test(line.value);
					if (pluginwmp === true) {
						this.prefs.setBoolPref("pluginwmp", true);
					}
					var pluginwmv = /application.*x-ms-wmv/.test(line.value);
					if (pluginwmv === true) {
						this.prefs.setBoolPref("pluginwmv", true);
					}
				} while (hasmore);
				istream.close();

			} else {
				if (pluginforce === true) {
					this.prefs.setBoolPref("pluginmp4", true);
					this.prefs.setBoolPref("pluginflv", true);
					this.prefs.setBoolPref("pluginqt", true);
					this.prefs.setBoolPref("pluginwmp", true);
					this.prefs.setBoolPref("pluginwmv", true);
					this.prefs.setBoolPref("pluginmov", true);
					this.prefs.setBoolPref("pluginm4v", true);
				}
			}
		},

		playerCheck : function() {

			// get osString
			var osString = Components.classes["@mozilla.org/network/protocol;1?name=http"]
			.getService(Components.interfaces.nsIHttpProtocolHandler).oscpu;

			// access preferences interface
			this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.flvideoreplacer.");

			// reset plugin check
			this.prefs.setBoolPref("playertotem", false);
			this.prefs.setBoolPref("playergmplayer", false);
			this.prefs.setBoolPref("playerkaffeine", false);
			this.prefs.setBoolPref("playersmplayer", false);
			this.prefs.setBoolPref("playerkmp", false);
			this.prefs.setBoolPref("playerqt", false);
			this.prefs.setBoolPref("playerbsp", false);
			this.prefs.setBoolPref("playerwmp", false);
			this.prefs.setBoolPref("playervlc", false);

			// declare variables
			var playerpath = this.prefs.getCharPref("playerpath");
			var playerqt, playerwmp, playerkmp, playerbsp, playervlc, playertotem, playerkaffeine, playergmplayer, playersmplayer;
			var envpaths, newpath;

			if (osString.match(/Windows/)) {

				// get paths from environment variables
				envprogramfiles = Components.classes["@mozilla.org/process/environment;1"]
				.getService(Components.interfaces.nsIEnvironment)
				.get('PROGRAMFILES');

				if (envprogramfiles) {

					try {
						// initiate file
						playervlc = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
						playervlc.initWithPath(envprogramfiles + "\\VideoLAN\\VLC\\vlc.exe");
						if (playervlc.exists()) {
							this.prefs.setBoolPref("playervlc", true);
							if (playerpath === "") {
								this.prefs
								.setCharPref("playerpath", playervlc.path);
							}
						}
					} catch (e) {
						// do nothing
					}
					try {
						// initiate file
						playerqt = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
						playerqt.initWithPath(envprogramfiles + "\\QuickTime\\QuickTimePlayer.exe");
						if (playerqt.exists()) {
							this.prefs.setBoolPref("playerqt", true);
							if (playerpath === "") {
								this.prefs.setCharPref("playerpath", playerqt.path);
							}
						}
					} catch (e) {
						// do nothing
					}
					try {
						// initiate file
						playerwmp = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
						playerwmp.initWithPath(envprogramfiles + "\\Windows Media Player\\wmplayer.exe");
						if (playerwmp.exists()) {
							this.prefs.setBoolPref("playerwmp", true);
							if (playerpath === "") {
								this.prefs
								.setCharPref("playerpath", playerwmp.path);
							}
						}
					} catch (e) {
						// do nothing
					}
					try {
						// initiate file
						playerbsp = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
						playerbsp.initWithPath(envprogramfiles + "\\Webteh\\BSPlayer\\bsplayer.exe");
						if (playerbsp.exists()) {
							this.prefs.setBoolPref("playerbsp", true);
							if (playerpath === "") {
								this.prefs.setCharPref("playerpath", playerbsp.path);
							}
						}
					} catch (e) {
						// do nothing
					}
					try {
						// initiate file
						playerkmp = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
						playerkmp.initWithPath(envprogramfiles + "\\The KMPlayer\\KMPlayer.exe");
						if (playerkmp.exists()) {
							this.prefs.setBoolPref("playerkmp", true);
							if (playerpath === "") {
								this.prefs.setCharPref("playerpath", playerkmp.path);
							}
						}
					} catch (e) {
						// do nothing
					}
				}
			} else if (osString.match(/Linux/)) {

				// get paths from environment variables
				envpaths = Components.classes["@mozilla.org/process/environment;1"]
				.getService(Components.interfaces.nsIEnvironment)
				.get('PATH');

				if (envpaths) {

					// split
					newpath = envpaths.split(":");

					// find
					for ( var i = 0; i < newpath.length; i++) {

						try {
							// initiate file
							playervlc = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
							playervlc.initWithPath(newpath[i] + "/vlc");
							if (playervlc.exists()) {
								this.prefs.setBoolPref("playervlc", true);
								if (playerpath === "") {
									this.prefs.setCharPref("playerpath", playervlc.path);
								}
							}
						} catch (e) {
							// do nothing
						}
						try {
							// initiate file
							playertotem = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
							playertotem.initWithPath(newpath[i] + "/totem");
							if (playertotem.exists()) {
								this.prefs.setBoolPref("playertotem", true);
								if (playerpath === "") {
									this.prefs.setCharPref("playerpath", playertotem.path);
								}
							}
						} catch (e) {
							// do nothing
						}
						try {
							// initiate file
							playerkmp = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
							playerkmp.initWithPath(newpath[i] + "/kmplayer");
							if (playerkmp.exists()) {
								this.prefs.setBoolPref("playerkmp", true);
								if (playerpath === "") {
									this.prefs.setCharPref("playerpath", playerkmp.path);
								}
							}
						} catch (e) {
							// do nothing
						}
						try {
							// initiate file
							playerkaffeine = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
							playerkaffeine.initWithPath(newpath[i] + "/kaffeine");
							if (playerkaffeine.exists()) {
								this.prefs.setBoolPref("playerkaffeine", true);
								if (playerpath === "") {
									this.prefs.setCharPref("playerpath", playerkaffeine.path);
								}
							}
						} catch (e) {
							// do nothing
						}
						try {
							// initiate file
							playergmplayer = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
							playergmplayer.initWithPath(newpath[i] + "/gnome-mplayer");
							if (playergmplayer.exists()) {
								this.prefs.setBoolPref("playergmplayer", true);
								if (playerpath === "") {
									this.prefs.setCharPref("playerpath", playergmplayer.path);
								}
							}
						} catch (e) {
							// do nothing
						}
						try {
							// initiate file
							playersmplayer = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
							playersmplayer.initWithPath(newpath[i] + "/smplayer");
							if (playersmplayer.exists()) {
								this.prefs.setBoolPref("playersmplayer", true);
								if (playerpath === "") {
									this.prefs.setCharPref("playerpath", playersmplayer.path);
								}
							}
						} catch (e) {
							// do nothing
						}
					}
				}

			} else if (osString.match(/OSX/) || osString.match(/Macintosh/)	|| osString.match(/OS X/)) {

				try {
					// initiate file
					playerqt = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
					playerqt.initWithPath("/Applications/QuickTime Player.app/Contents/MacOS/QuickTime Player");
					if (playerqt.exists()) {
						this.prefs.setBoolPref("playerqt", true);
						if (playerpath === "") {
							this.prefs.setCharPref("playerpath", playerqt.path);
						}
					}
				} catch (e) {
					// do nothing
				}
			} else {
				this.prefs.setBoolPref("playercustom", true);
			}
		},

		checkTPE: function() {

			//access preferences interface
			this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.");

			var enableditems;

			//check enabled extensions
			try{
				enableditems = this.prefs.getCharPref("enabledAddons");
			}catch(e){
				enableditems = this.prefs.getCharPref("enabledItems");
			}finally{

				//access preferences interface
				this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
				.getService(Components.interfaces.nsIPrefService)
				.getBranch("extensions.flvideoreplacer.");

				if (enableditems.match(/\{DDC359D1-844A-42a7-9AA1-88A850A938A8\}/)) {//dta
					this.prefs.setBoolPref("dta",true);
				}else{
					this.prefs.setBoolPref("dta",false);
				}

				if (enableditems.match(/\{84b24861-62f6-364b-eba5-2e5e2061d7e6\}/)) {//mediaplayerconnectivity
					this.prefs.setBoolPref("mpc",true);
				}else{
					this.prefs.setBoolPref("mpc",false);
				}

				if (enableditems.match(/\{3d7eb24f-2740-49df-8937-200b1cc08f8a\}/)) {//flashblock
					this.prefs.setBoolPref("flashblock",true);
				}else{
					this.prefs.setBoolPref("flashblock",false);
				}
			}
		}
};
//event listeners to call the functions when Firefox starts and closes
window.addEventListener("load",function(){ flvideoreplacerFirstrun.init(); },true);
window.addEventListener("load", function(e) { setTimeout(function () { flvideoreplacerFirstrun.checkTPE(); }, 100); }, false);
window.addEventListener("load", function(e) { setTimeout(function () { flvideoreplacerFirstrun.pluginCheck(); }, 150); }, false);
window.addEventListener("load", function(e) { setTimeout(function () { flvideoreplacerFirstrun.playerCheck(); }, 300); }, false);
