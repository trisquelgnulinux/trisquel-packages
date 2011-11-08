var flvideoreplacerOptions = {

		toggleTPE: function() {
			
			"use strict";

			//access preferences interface
			this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.flvideoreplacer.");

			//get plugin info
			var dta = this.prefs.getBoolPref("dta");

			if(dta === true){
				document.getElementById("downdta").hidden = false;
			}else{
				document.getElementById("downdta").hidden = true;
			}			
		},

		toggleMime: function() {
			
			"use strict";

			//get osString
			var osString = Components.classes["@mozilla.org/network/protocol;1?name=http"]
			.getService(Components.interfaces.nsIHttpProtocolHandler).oscpu; 

			//access preferences interface
			this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.flvideoreplacer.");

			//get plugin info
			var replacemethod = this.prefs.getCharPref("method");
			var pluginmp4 = this.prefs.getBoolPref("pluginmp4");
			var pluginflv = this.prefs.getBoolPref("pluginflv");
			var pluginqt = this.prefs.getBoolPref("pluginqt");
			var pluginmkv = this.prefs.getBoolPref("pluginmkv");
			var pluginxth = this.prefs.getBoolPref("pluginxth");
			var pluginxtp = this.prefs.getBoolPref("pluginxtp");
			var pluginxin = this.prefs.getBoolPref("pluginxin");
			var pluginvlc = this.prefs.getBoolPref("pluginvlc");
			var pluginwmp = this.prefs.getBoolPref("pluginwmp");
			var pluginwmv = this.prefs.getBoolPref("pluginwmv");
			var pluginmov = this.prefs.getBoolPref("pluginmov");
			var pluginm4v = this.prefs.getBoolPref("pluginm4v");

			var pluginforce = this.prefs.getBoolPref("pluginforce");

			//initiate file
			var pluginreg = Components.classes["@mozilla.org/file/directory_service;1"]
			.getService(Components.interfaces.nsIProperties)
			.get("ProfD", Components.interfaces.nsIFile);
			pluginreg.append("pluginreg.dat");

			if(pluginreg.exists()){
				document.getElementById("pluginforcebox").hidden = true;		
			}else{
				//document.getElementById("pluginforcebox").hidden = false;
				//document.getElementById("pluginforcebox").disabled = true;
			}

			if(osString.match(/OSX/) || osString.match(/Macintosh/) || osString.match(/OS X/)){
				if(replacemethod === "standalone"){
					this.prefs.setCharPref("method","membed");
				}
				document.getElementById("membed").hidden=false;
				document.getElementById("mnewtab").hidden=false;
				document.getElementById("mnewwin").hidden=false;
				document.getElementById("mstand").hidden=true;
				this.prefs.setBoolPref("prefermp4",true);
			}else{
				if(pluginmp4 === true && pluginflv === false){
					this.prefs.setBoolPref("prefermp4",true);
				}
				if(pluginmp4 === false && pluginflv === true){
					this.prefs.setBoolPref("prefermp4",false);
				}
			}
			
			if(pluginmp4 === true){
				document.getElementById("pluginmp4").hidden=false;
			}else{
				document.getElementById("pluginmp4").hidden=true;
			}
			if(pluginflv === true){
				document.getElementById("pluginflv").hidden=false;
			}else{
				document.getElementById("pluginflv").hidden=true;
			}
			if(pluginqt === true){
				document.getElementById("pluginqt").hidden=false;
			}else{
				document.getElementById("pluginqt").hidden=true;
			}
			if(pluginmkv === true){
				document.getElementById("pluginmkv").hidden=false;
			}else{
				document.getElementById("pluginmkv").hidden=true;
			}
			if(pluginxth === true){
				document.getElementById("pluginxth").hidden=false;
			}else{
				document.getElementById("pluginxth").hidden=true;
			}
			if(pluginxtp === true){
				document.getElementById("pluginxtp").hidden=false;
			}else{
				document.getElementById("pluginxtp").hidden=true;
			}
			if(pluginxin === true){
				document.getElementById("pluginxin").hidden=false;
			}else{
				document.getElementById("pluginxin").hidden=true;
			}
			if(pluginvlc === true){
				document.getElementById("pluginvlc").hidden=false;
			}else{
				document.getElementById("pluginvlc").hidden=true;
			}
			if(pluginwmp === true){
				document.getElementById("pluginwmp").hidden=false;
			}else{
				document.getElementById("pluginwmp").hidden=true;
			}
		},

		togglePlayer: function() {
			
			"use strict";

			//access preferences interface
			this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.flvideoreplacer.");

			//get players info
			var playertotem = this.prefs.getBoolPref("playertotem");
			var playergmplayer = this.prefs.getBoolPref("playergmplayer");
			var playerkaffeine = this.prefs.getBoolPref("playerkaffeine");
			var playersmplayer = this.prefs.getBoolPref("playersmplayer");
			var playerkmp = this.prefs.getBoolPref("playerkmp");
			var playerqt = this.prefs.getBoolPref("playerqt");
			var playerbsp = this.prefs.getBoolPref("playerbsp");
			var playerwmp = this.prefs.getBoolPref("playerwmp");
			var playervlc = this.prefs.getBoolPref("playervlc");

			if(playertotem === true){
				document.getElementById("playertotem").hidden=false;
			}else{
				document.getElementById("playertotem").hidden=true;
			}
			if(playergmplayer === true){
				document.getElementById("playergmplayer").hidden=false;
			}else{
				document.getElementById("playergmplayer").hidden=true;
			}
			if(playerkaffeine === true){
				document.getElementById("playerkaffeine").hidden=false;
			}else{
				document.getElementById("playerkaffeine").hidden=true;
			}
			if(playersmplayer === true){
				document.getElementById("playersmplayer").hidden=false;
			}else{
				document.getElementById("playersmplayer").hidden=true;
			}
			if(playerkmp === true){
				document.getElementById("playerkmp").hidden=false;
			}else{
				document.getElementById("playerkmp").hidden=true;
			}
			if(playerqt === true){
				document.getElementById("playerqt").hidden=false;
			}else{
				document.getElementById("playerqt").hidden=true;
			}
			if(playerbsp === true){
				document.getElementById("playerbsp").hidden=false;
			}else{
				document.getElementById("playerbsp").hidden=true;
			}
			if(playerwmp === true){
				document.getElementById("playerwmp").hidden=false;
			}else{
				document.getElementById("playerwmp").hidden=true;
			}
			if(playervlc === true){
				document.getElementById("playervlc").hidden=false;
			}else{
				document.getElementById("playervlc").hidden=true;
			}
		},

		toggleOptions: function() {
			
			"use strict";

			//get osString
			var osString = Components.classes["@mozilla.org/network/protocol;1?name=http"]
			.getService(Components.interfaces.nsIHttpProtocolHandler).oscpu;

			//access preferences interface
			this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.flvideoreplacer.");

			//get players info
			var playertotem = this.prefs.getBoolPref("playertotem");
			var playergmplayer = this.prefs.getBoolPref("playergmplayer");
			var playerkaffeine = this.prefs.getBoolPref("playerkaffeine");
			var playersmplayer = this.prefs.getBoolPref("playersmplayer");
			var playerkmp = this.prefs.getBoolPref("playerkmp");
			var playerqt = this.prefs.getBoolPref("playerqt");
			var playerbsp = this.prefs.getBoolPref("playerbsp");
			var playerwmp = this.prefs.getBoolPref("playerwmp");
			var playervlc = this.prefs.getBoolPref("playervlc");

			//get localization
			var strbundle = document.getElementById("flvideoreplacerstrings");
			var messagetitle = strbundle.getString("flvideoreplacermessage");
			var alerttitle = strbundle.getString("flvideoreplaceralert");
			var message, bestplayer, webm;

			//get elements values
			var standalone = document.getElementById('standalone').value;
			var replacemethod = document.getElementById('method').value;

			if(osString.match(/Windows/)){

				//get paths from environment variables
				var envprogramfiles = Components.classes["@mozilla.org/process/environment;1"]
				.getService(Components.interfaces.nsIEnvironment)
				.get('PROGRAMFILES');

				if(envprogramfiles){

					//set playerpath
					if(standalone === "playerqt"){
						this.prefs.setCharPref("playerpath",envprogramfiles+"\\QuickTime\\QuickTimePlayer.exe");
					}
					if(standalone === "playerwmp"){
						this.prefs.setCharPref("playerpath",envprogramfiles+"\\Windows Media Player\\wmplayer.exe");
					}
					if(standalone === "playerkmp"){
						this.prefs.setCharPref("playerpath",envprogramfiles+"\\The KMPlayer\\KMPlayer.exe");
					}
					if(standalone === "playerbsp"){
						this.prefs.setCharPref("playerpath",envprogramfiles+"\\Webteh\\BSPlayer\\bsplayer.exe");
					}
					if(standalone === "playervlc"){
						this.prefs.setCharPref("playerpath",envprogramfiles+"\\VideoLAN\\VLC\\vlc.exe");
					}		
					if(standalone === "playerbest"){

						if(playerkmp === true){
							this.prefs.setCharPref("playerpath",envprogramfiles+"\\The KMPlayer\\KMPlayer.exe");
						}else if(playerbsp === true){
							this.prefs.setCharPref("playerpath",envprogramfiles+"\\Webteh\\BSPlayer\\bsplayer.exe");
						}else if(playerwmp === true){
							this.prefs.setCharPref("playerpath",envprogramfiles+"\\Windows Media Player\\wmplayer.exe");
						}else if(playerqt === true){
							this.prefs.setCharPref("playerpath",envprogramfiles+"\\QuickTime\\QuickTimePlayer.exe");
						}else if(playervlc === true){
							this.prefs.setCharPref("playerpath",envprogramfiles+"\\VideoLAN\\VLC\\vlc.exe");
						}else{
							bestplayer = "KMPlayer";
							message = strbundle.getFormattedString("nobestplayer", [ bestplayer ]);
							this.prefs.setCharPref("playerpath",message);
							document.getElementById('standalone').value = "playercustom";
						}
					}
				}

			}else if(osString.match(/Linux/)){

				//get paths from environment variables
				var envpaths = Components.classes["@mozilla.org/process/environment;1"]
				.getService(Components.interfaces.nsIEnvironment)
				.get('PATH');

				if(envpaths){

					//split
					var newpath = envpaths.split(":");

					//find
					for(var i=0; i< newpath.length; i++){

						try{
							//initiate file
							playertotem = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
							playertotem.initWithPath(newpath[i]+"/totem");
							if(playertotem.exists()){
								var playertotempath = playertotem.path;				
							}
						}catch(e){
							//do nothing
						}
						try{
							//initiate file
							playergmplayer = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
							playergmplayer.initWithPath(newpath[i]+"/gnome-mplayer");
							if(playergmplayer.exists()){
								var playergmplayerpath = playergmplayer.path;
							}
						}catch(e){
							//do nothing
						}
						try{
							//initiate file
							playerkaffeine = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
							playerkaffeine.initWithPath(newpath[i]+"/kaffeine");
							if(playerkaffeine.exists()){
								var playerkaffeinepath = playerkaffeine.path;
							}
						}catch(e){
							//do nothing
						}
						try{
							//initiate file
							playerkmp = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
							playerkmp.initWithPath(newpath[i]+"/kmplayer");
							if(playerkmp.exists()){
								var playerkmppath = playerkmp.path;
							}
						}catch(e){
							//do nothing
						}
						try{
							//initiate file
							playersmplayer = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
							playersmplayer.initWithPath(newpath[i]+"/smplayer");
							if(playersmplayer.exists()){
								var playersmplayerpath = playersmplayer.path;
							}
						}catch(e){
							//do nothing
						}
						try{
							//initiate file
							playervlc = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
							playervlc.initWithPath(newpath[i]+"/vlc");
							if(playervlc.exists()){
								var playervlcpath = playervlc.path;
							}
						}catch(e){
							//do nothing
						}

					}
					//set playerpath
					if(standalone === "playertotem" && playertotempath !== null){
						this.prefs.setCharPref("playerpath",playertotempath);
					}
					if(standalone === "playergmplayer" && playergmplayerpath !== null){
						this.prefs.setCharPref("playerpath",playergmplayerpath);
					}
					if(standalone === "playerkaffeine" && playerkaffeinepath !== null){
						this.prefs.setCharPref("playerpath",playerkaffeinepath);
					}
					if(standalone === "playerkmp" && playerkmppath !== null){
						this.prefs.setCharPref("playerpath",playerkmppath);
					}
					if(standalone === "playersmplayer" && playersmplayerpath !== null){
						this.prefs.setCharPref("playerpath",playersmplayerpath);
					}
					if(standalone === "playervlc" && playervlcpath !== null){
						this.prefs.setCharPref("playerpath",playervlcpath);
					}
					if(standalone === "playerbest"){
						if(playersmplayerpath !== null){
							this.prefs.setCharPref("playerpath",playersmplayerpath);
						}else if(playergmplayerpath !== null){
							this.prefs.setCharPref("playerpath",playergmplayerpath);
						}else if(playerkaffeinepath !== null){
							this.prefs.setCharPref("playerpath",playerkaffeinepath);
						}else if(playerkmppath !== null){
							this.prefs.setCharPref("playerpath",playerkmppath);
						}else if(playertotempath !== null){
							this.prefs.setCharPref("playerpath",playertotempath);
						}else if(playervlcpath !== null){
							this.prefs.setCharPref("playerpath",playervlcpath);
						}else{
							bestplayer = "SMPlayer";
							message = strbundle.getFormattedString("nobestplayer", [ bestplayer ]);
							this.prefs.setCharPref("playerpath",message);
							document.getElementById('standalone').value = "playercustom";
						}
					}
				}

			}else if(osString.match(/OSX/) || osString.match(/Macintosh/) || osString.match(/OS X/)){

				//set playerpath
				if(standalone === "playerqt"){
					this.prefs.setCharPref("playerpath","/Applications/QuickTime Player.app/Contents/MacOS/QuickTime Player");
				}
				if(standalone === "playerbest"){

					if(playerqt === true){
						this.prefs.setCharPref("playerpath","/Applications/QuickTime Player.app/Contents/MacOS/QuickTime Player");
					}else{
						bestplayer = "QuickTime Player with Perian";
						message = strbundle.getFormattedString("nobestplayer", [ bestplayer ]);
						this.prefs.setCharPref("playerpath",message);
						document.getElementById('standalone').value = "playercustom";
					}
				}
			}else{
				//do nothing
			}

			if(osString.match(/OSX/) || osString.match(/Macintosh/) || osString.match(/OS X/)){

				//toggle elements visibility
				if(replacemethod === "newtab"){

					document.getElementById("selectplugin").hidden = true;
					document.getElementById("standaloneplayer").hidden = true;
					document.getElementById("downloader").hidden = false;
					document.getElementById('autolaunchembedbox').hidden = true;
					document.getElementById('autolaunchplayerbox').hidden = true;
					document.getElementById('autolaunchtabbox').hidden = false;
					document.getElementById('autolaunchwindowbox').hidden = true;
					document.getElementById("webmbox").hidden=true;
					document.getElementById('mimetype').value = "autodetect";
				}
				if(replacemethod === "newwindow"){

					document.getElementById("selectplugin").hidden=true;
					document.getElementById("standaloneplayer").hidden=true;
					document.getElementById("downloader").hidden=false;
					document.getElementById('autolaunchembedbox').hidden = true;
					document.getElementById('autolaunchplayerbox').hidden = true;
					document.getElementById('autolaunchtabbox').hidden = true;
					document.getElementById('autolaunchwindowbox').hidden = false;
					document.getElementById("webmbox").hidden=true;
					document.getElementById('mimetype').value = "autodetect";
				}
				if(replacemethod === "standalone"){
					this.prefs.setCharPref("method","embedded");
				}
				if(replacemethod === "embedded"){

					document.getElementById("selectplugin").hidden=false;
					document.getElementById("standaloneplayer").hidden=true;
					document.getElementById("downloader").hidden=false;
					document.getElementById('autolaunchembedbox').hidden = false;
					document.getElementById('autolaunchplayerbox').hidden = true;
					document.getElementById('autolaunchtabbox').hidden = true;
					document.getElementById('autolaunchwindowbox').hidden = true;

					//access preferences interface
					this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
					.getService(Components.interfaces.nsIPrefService)
					.getBranch("media.");

					try{
						//check webm status
						webm = this.prefs.getBoolPref("webm.enabled");
					}catch(e){
						webm = false;
					}

					if(webm === true){
						document.getElementById("webmbox").hidden=false;
					}else{
						document.getElementById("webmbox").hidden=true;

						//access preferences interface
						this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
						.getService(Components.interfaces.nsIPrefService)
						.getBranch("extensions.flvideoreplacer.");

						this.prefs.setBoolPref("preferwebm",false);
					}
				}

			}else{

				//toggle elements visibility
				if(replacemethod === "newtab"){

					document.getElementById("selectplugin").hidden=true;
					document.getElementById("standaloneplayer").hidden=true;
					document.getElementById("downloader").hidden=false;
					document.getElementById('autolaunchembedbox').hidden = true;
					document.getElementById('autolaunchplayerbox').hidden = true;
					document.getElementById('autolaunchtabbox').hidden = false;
					document.getElementById('autolaunchwindowbox').hidden = true;
					document.getElementById("webmbox").hidden=true;
					document.getElementById('mimetype').value = "autodetect";
				}
				if(replacemethod === "newwindow"){

					document.getElementById("selectplugin").hidden=true;
					document.getElementById("standaloneplayer").hidden=true;
					document.getElementById("downloader").hidden=false;
					document.getElementById('autolaunchembedbox').hidden = true;
					document.getElementById('autolaunchplayerbox').hidden = true;
					document.getElementById('autolaunchtabbox').hidden = true;
					document.getElementById('autolaunchwindowbox').hidden = false;	
					document.getElementById("webmbox").hidden=true;
					document.getElementById('mimetype').value = "autodetect";
				}
				if(replacemethod === "standalone"){

					document.getElementById("selectplugin").hidden=true;
					document.getElementById("standaloneplayer").hidden=false;
					document.getElementById("downloader").hidden=false;
					document.getElementById('autolaunchembedbox').hidden = true;
					document.getElementById('autolaunchplayerbox').hidden = false;
					document.getElementById('autolaunchtabbox').hidden = true;
					document.getElementById("webmbox").hidden=true;
					document.getElementById('autolaunchwindowbox').hidden = true;

				}
				if(replacemethod === "embedded"){

					document.getElementById("selectplugin").hidden=false;
					document.getElementById("standaloneplayer").hidden=true;
					document.getElementById("downloader").hidden=false;
					document.getElementById('autolaunchembedbox').hidden = false;
					document.getElementById('autolaunchplayerbox').hidden = true;
					document.getElementById('autolaunchtabbox').hidden = true;
					document.getElementById('autolaunchwindowbox').hidden = true;

					//access preferences interface
					this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
					.getService(Components.interfaces.nsIPrefService)
					.getBranch("media.");

					try{
						//check webm status
						webm = this.prefs.getBoolPref("webm.enabled");
					}catch(e){
						webm = false;
					}

					if(webm === true){
						document.getElementById("webmbox").hidden=false;
					}else{
						document.getElementById("webmbox").hidden=true;

						//access preferences interface
						this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
						.getService(Components.interfaces.nsIPrefService)
						.getBranch("extensions.flvideoreplacer.");

						this.prefs.setBoolPref("preferwebm",false);
					}
				}
			}
			//toggle mime options
			flvideoreplacerOptions.toggleMime();
		},

		resetFile : function(aField) {//reset prefs file paths
			
			"use strict";

			//get osString
			var osString = Components.classes["@mozilla.org/network/protocol;1?name=http"]
			.getService(Components.interfaces.nsIHttpProtocolHandler).oscpu;

			//access preferences interface
			this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.flvideoreplacer.");

			if(aField === "standalone"){
				if(osString.match(/Windows/)){
					//reset path
					this.prefs.setCharPref("playerpath","");
					document.getElementById('standalone').value = "playercustom";
				}
				if(osString.match(/Linux/)){
					//reset path
					this.prefs.setCharPref("playerpath","");
					document.getElementById('standalone').value = "playercustom";
				}
				if(osString.match(/OSX/) || osString.match(/Macintosh/) || osString.match(/OS X/)){
					//reset path
					this.prefs.setCharPref("playerpath","");
					document.getElementById('standalone').value = "playercustom";
				}
			}
			if(aField === "downdir"){

				//set default download dir
				var dir = Components.classes["@mozilla.org/file/directory_service;1"]
				.getService(Components.interfaces.nsIProperties)
				.get("Desk", Components.interfaces.nsIFile);

				this.prefs.setCharPref("downdir",dir.path);
			}
		},

		openFile : function(aText) {//open file and set path in prefs
			
			"use strict";

			//access preferences interface
			this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.flvideoreplacer.");

			//open file picker
			var nsIFilePicker = Components.interfaces.nsIFilePicker;
			var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
			fp.init(window, aText, nsIFilePicker.modeOpen);
			var rv = fp.show();
			if (rv === nsIFilePicker.returnOK) {
				var file = fp.file;
				//set path
				this.prefs.setCharPref("playerpath", file.path);
				document.getElementById('standalone').value = "playercustom";
			}
		},

		openDir : function(aText) {//open folder and set path in prefs
			
			"use strict";

			//access preferences interface
			this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.flvideoreplacer.");

			//open folder picker
			var nsIFilePicker = Components.interfaces.nsIFilePicker;
			var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
			fp.init(window, aText, nsIFilePicker.modeGetFolder);
			var rv = fp.show();
			if (rv === nsIFilePicker.returnOK) {
				var file = fp.file;
				//set path
				this.prefs.setCharPref("downdir", file.path);
			}
		}
};
window.addEventListener("load",function(){ flvideoreplacerOptions.toggleTPE(); },true);
window.addEventListener("load",function(){ flvideoreplacerOptions.toggleMime(); },true);
window.addEventListener("load",function(){ flvideoreplacerOptions.togglePlayer(); },true);