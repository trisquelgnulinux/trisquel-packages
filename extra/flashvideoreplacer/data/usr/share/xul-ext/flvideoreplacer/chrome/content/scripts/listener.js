var flvideoreplacerListener = {

		init: function() {
			var appcontent = document.getElementById("appcontent"); // browser
			if(appcontent) {
				appcontent.addEventListener("DOMContentLoaded", function (event) { flvideoreplacerListener.onPageLoad(event); }, true);
			}
		},

		onPageLoad: function(aEvent) {

			//access preferences interface
			this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.flvideoreplacer.");

			//get prefs
			var delay = this.prefs.getIntPref("delay");
			var enabled = this.prefs.getBoolPref("enabled");
			var performance = this.prefs.getIntPref("performance");

			if(enabled === true){

				setTimeout(function () { 

					//get original target document and url
					var doc = aEvent.originalTarget;
					var sourceurl = doc.location.href;

					//declare variables
					var replacevideo = false, replacemethod, preferwebm, videoelement, testelement, videowidth, videoheight;

					if(sourceurl.match(/youtube.*watch.*v\=.*html5=True/)){
						//access preferences interface
						this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
						.getService(Components.interfaces.nsIPrefService)
						.getBranch("extensions.flvideoreplacer.");

						//get prefs
						preferwebm = this.prefs.getBoolPref("preferwebm");
						replacevideo = this.prefs.getBoolPref("youtube");
						//redirect webm
						if(preferwebm === false && replacevideo == true){
							var newlocation = sourceurl.replace(/\&html5=True/,"");
							doc.location.href = newlocation;
						}
					}

					if((sourceurl.match(/youtube.*watch.*v\=/)  && !sourceurl.match("html5=True")) 
							|| sourceurl.match(/vimeo\.com\/\d{1,8}/)
							|| (sourceurl.match(/metacafe\.com\/watch\//) && !sourceurl.match(/http.*http:\/\/www.metacafe\.com/))
							|| sourceurl.match(/blip\.tv\/file\/.*/)
							|| sourceurl.match(/ustream\.tv\/recorded\/\d{1,8}/)
							|| sourceurl.match(/youporn\.com\/watch\//)
							|| sourceurl.match(/pornhub\.com\/view_video.php\?viewkey=/)
							|| sourceurl.match(/redtube\.com\/\d{1,8}/)
					){

						//access preferences interface
						this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
						.getService(Components.interfaces.nsIPrefService)
						.getBranch("extensions.flvideoreplacer.");

						//get prefs
						replacemethod = this.prefs.getCharPref("method");
						preferwebm = this.prefs.getBoolPref("preferwebm");
						//reset promptmethod
						this.prefs.setCharPref("promptmethod",replacemethod);

						//check if video should be replaced
						if(sourceurl.match(/youtube.*watch.*v\=/)){
							replacevideo = this.prefs.getBoolPref("youtube");
							videoelement = "movie_player";
							videowidth = "642";
							videoheight = "390";
						}
						if(sourceurl.match(/vimeo\.com\/\d{1,8}/)){
							replacevideo = this.prefs.getBoolPref("vimeo");
							videoelement = "meat";
							videowidth = "640";
							videoheight = "384";
						}
						if(sourceurl.match(/metacafe\.com\/watch\//)){
							replacevideo = this.prefs.getBoolPref("metacafe");
							videoelement = "FlashWrap";
							videowidth = "615";
							videoheight = "400";
						}
						if(sourceurl.match(/blip\.tv\/file\/.*/)){
							replacevideo = this.prefs.getBoolPref("bliptv");
							videoelement = "video_player";
							videowidth = "624";
							videoheight = "380";
						}
						if(sourceurl.match(/ustream\.tv\/recorded\/\d{1,8}/)){
							replacevideo = this.prefs.getBoolPref("ustream");
							videoelement = "channelFlashContent";
							videowidth = "608";
							videoheight = "368";
						}	    
						if(sourceurl.match(/youporn\.com\/watch\//)){
							replacevideo = this.prefs.getBoolPref("other");
							videoelement = "player";
							videowidth = "610";
							videoheight = "480";
						}
						if(sourceurl.match(/pornhub\.com\/view_video.php\?viewkey=/)){
							replacevideo = this.prefs.getBoolPref("other");
							videoelement = "playerDiv_1";
							videowidth = "642";
							videoheight = "390";
						}
						if(sourceurl.match(/redtube\.com\/\d{1,8}/)){
							replacevideo = this.prefs.getBoolPref("other");
							videoelement = "redtube_flv_player";
							videowidth = "584";
							videoheight = "468";
						}

						//declare element to be replaced
						if(sourceurl.match(/youtube.*watch.*v\=/)){
							try{
								doc.getElementById("flash-upgrade").hidden = true;
							}catch(e){
								//do nothing
							}
							testelement = doc.getElementById(videoelement);
							if(testelement === null){
								testelement = doc.getElementById("watch-player");
							}
						}else{
							if(sourceurl.match(/redtube\.com\/\d{1,8}/)){
								testelement = doc.getElementById("redtube_flv_player");
								if(testelement !== null){
									testelement.setAttribute('id',"redtube_flvideoreplacer");
									videoelement = "redtube_flvideoreplacer";
									testelement = doc.getElementById(videoelement);
								}else{
									videoelement = "redtube_flvideoreplacer";
									testelement = doc.getElementById(videoelement);
								}
							}else{
								testelement = doc.getElementById(videoelement);
							}
						}

						if (testelement !== null) {

							if(replacevideo === true){

								if(delay === "0" || performance === "3"){

									if(sourceurl.match(/youtube.*watch.*v\=/) 
											|| sourceurl.match(/vimeo\.com\/\d{1,8}/)
											|| sourceurl.match(/blip\.tv\/file\/.*/)
											|| sourceurl.match(/ustream\.tv\/recorded\/\d{1,8}/)
									){
										//replace with empty div
										var divreplacer = doc.createElement('div');
										divreplacer.setAttribute("id", videoelement);
										divreplacer.setAttribute("style"," width:"+videowidth+"; height:"+videoheight+"; text-align:center; vertical-align:middle;");

										if(sourceurl.match(/vimeo\.com\/\d{1,8}/)){
											var childdivs = testelement.getElementsByTagName("div");
											var videodiv = childdivs[2];
											//replace video
											videodiv.parentNode.replaceChild(divreplacer, videodiv);

										}else{
											//replace video
											testelement.parentNode.replaceChild(divreplacer, testelement);
										}
									}
								}

								if(sourceurl.match(/youtube.*watch.*v\=/)){

									//fetch video ID from url
									var videoid = sourceurl.replace(/.*v\=/, "").replace(/\&.*/,"");

									if(preferwebm === true && replacemethod === "embedded"){

										try{
											//redirect to webm page
											var webmurl = "http://www.youtube.com/watch?v="+videoid+"&html5=True";
											var webmRequest = new XMLHttpRequest();
											webmRequest.open('GET', webmurl, true);
											webmRequest.onreadystatechange=function(){
												if (this.readyState === 4 && this.status === 200) {
													var webmsource = webmRequest.responseText;
													var newlinewebm = webmsource.split("\n");
													var replacewebm = false;
													for(var i=0; i< newlinewebm.length; i++){
														//match patterns
														var html5player = /html5-player/.test(newlinewebm[i]);
														if (html5player === true) {
															replacewebm = true;
														}
													}
													if(replacewebm === true){
														flvideoreplacerListener.webmReplace(aEvent);
													}else{
														flvideoreplacerListener.videoFetch(aEvent);
													}
												}
											};
											webmRequest.send(null);
										}catch(e){
											flvideoreplacerListener.videoFetch(aEvent);
										}
									}else{
										flvideoreplacerListener.videoFetch(aEvent);
									}
								}
								if(sourceurl.match(/vimeo\.com\/\d{1,8}/) 
										|| sourceurl.match(/metacafe\.com\/watch\//) 
										|| sourceurl.match(/blip\.tv\/file\/.*/)
										|| sourceurl.match(/ustream\.tv\/recorded\/\d{1,8}/)
										|| sourceurl.match(/youporn\.com\/watch\//)
										|| sourceurl.match(/pornhub\.com\/view_video.php\?viewkey=/)
										|| sourceurl.match(/redtube\.com\/\d{1,8}/)
								){
									flvideoreplacerListener.videoFetch(aEvent);
								}
							}else{
								if(sourceurl.match(/youporn\.com\/watch\//)
										|| sourceurl.match(/pornhub\.com\/view_video.php\?viewkey=/)
										|| sourceurl.match(/redtube\.com\/\d{1,8}/)
								){

									//get osString
									var osString = Components.classes["@mozilla.org/network/protocol;1?name=http"]
									.getService(Components.interfaces.nsIHttpProtocolHandler).oscpu; 

									//get alert pref
									var alertsinfo = this.prefs.getBoolPref("alertsinfo");

									if(alertsinfo === true && !osString.match(/OSX/) && !osString.match(/Macintosh/) && !osString.match(/OS X/)){

										//get localization
										var strbundle = document.getElementById("flvideoreplacerstrings");
										var message = strbundle.getString("supported");
										var messagetitle = strbundle.getString("flvideoreplacermessage");
										//alert user
										alertsService = Components.classes["@mozilla.org/alerts-service;1"]
										.getService(Components.interfaces.nsIAlertsService);
										alertsService.showAlertNotification("chrome://flvideoreplacer/skin/icon48.png",
												messagetitle, message,
												false, "", null);
									}
								}
							}
						}
					}
				}, delay);
			}
		},

		videoFetch: function(aEvent) {

			//get original target document and url
			var doc = aEvent.originalTarget;
			var sourceurl = doc.location.href;

			//get osString
			var osString = Components.classes["@mozilla.org/network/protocol;1?name=http"]
			.getService(Components.interfaces.nsIHttpProtocolHandler).oscpu; 

			//access preferences interface
			this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.flvideoreplacer.");

			//get prefs
			var replacemethod = this.prefs.getCharPref("promptmethod");
			var prefermp4 = this.prefs.getBoolPref("prefermp4");
			var videoquality = this.prefs.getCharPref("videoquality");
			var autolaunchembed = this.prefs.getBoolPref("autolaunchembed");
			var autolaunchplayer = this.prefs.getBoolPref("autolaunchplayer");
			var autolaunchtab = this.prefs.getBoolPref("autolaunchtab");
			var autolaunchwindow = this.prefs.getBoolPref("autolaunchwindow");
			var performance = this.prefs.getIntPref("performance");

			//get mime prefs and declare variables
			var mimetype = this.prefs.getCharPref("mimetype");
			var newmimetype = mimetype;

			//declare video variables
			var videowidth, videoheight, fmt, videourl, downloader;

			//declare XMLHttpRequest variables
			var req, xmlsource, pagecontent, newline, matchpattern, matchpattern2, key;

			//declare test variables
			var videoid, videoelement, testelement, replacevideo = false;

			//declare json variables
			var JSONStrings, videojson;

			if(sourceurl.match(/youtube.*watch.*v\=/)){

				//fetch video ID from url
				videoid = sourceurl.replace(/.*v\=/, "").replace(/\&.*/,"");
				//declare element to be replaced
				try{
					doc.getElementById("flash-upgrade").hidden = true;
				}catch(e){
					//do nothing
				}
				videoelement = "movie_player";
				testelement = doc.getElementById(videoelement);
				if(testelement === null){
					videoelement = "watch-player";
					testelement = doc.getElementById(videoelement);
				}

				if (testelement !== null) {

					//get xml document content
					req = new XMLHttpRequest();   
					req.open('GET', "http://www.youtube-nocookie.com/watch?v="+videoid, true);
					req.onreadystatechange = function () {
						if (this.readyState == 4 && this.status == 200) {
							if(replacemethod === "standalone"){
								//fetch page html content
								pagecontent = req.responseText;
							}else{
								//fetch page html content
								//pagecontent = doc.getElementsByTagName("body").item(0).innerHTML;
								pagecontent = doc.getElementById("postpage").innerHTML;
							}
							pagecontent = req.responseText;
							newline = pagecontent.split("\n");

							for(var i=0; i< newline.length; i++){

								//match patterns
								matchpattern = /PLAYER_CONFIG.*fmt_stream_map/.test(newline[i]);

								if (matchpattern === true) {

									newline[i] = newline[i].replace(/.*"fmt_stream_map": /,"").replace(/\\u0026/g,"&");

									//declare video quality based on user settings and video availability
									fmt = "18";

									//access preferences interface
									this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
									.getService(Components.interfaces.nsIPrefService)
									.getBranch("extensions.flvideoreplacer.downloadersource.");

									if(performance === 4){

										if (videoquality === "LOW"){

											if (newline[i].match(/\,5\|http\:/) || newline[i].match(/\"5\|http\:/)) {
												fmt = "5";
												videourl = decodeURIComponent(newline[i]).replace(/.*5\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
												replacevideo = true;
												if(mimetype === "autodetect"){
													newmimetype = "application/x-flv";
												}
												//store download path
												this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
											}
											if (newline[i].match(/\,18\|http\:/) || newline[i].match(/\"18\|http\:/)) {
												fmt = "18";
												videourl = decodeURIComponent(newline[i]).replace(/.*18\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
												replacevideo = true;
												if(mimetype === "autodetect"){
													newmimetype = "video/mp4";
												}
												//store download path
												this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
											}
											if (newline[i].match(/\,34\|http\:/) || newline[i].match(/\"34\|http\:/)) {
												fmt = "34";
												videourl = decodeURIComponent(newline[i]).replace(/.*34\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
												replacevideo = true;
												if(mimetype === "autodetect"){
													newmimetype = "application/x-flv";
												}
												//store download path
												this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
											}
											if(prefermp4 === true){
												if (newline[i].match(/\,18\|http\:/) || newline[i].match(/\"18\|http\:/)) {
													fmt = "18";
													videourl = decodeURIComponent(newline[i]).replace(/.*18\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
													replacevideo = true;
													if(mimetype === "autodetect"){
														newmimetype = "video/mp4";
													}
													//store download path
													this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
												}
											}
										}

										if (videoquality === "MEDIUM"){

											if (newline[i].match(/\,5\|http\:/) || newline[i].match(/\"5\|http\:/)) {
												fmt = "5";
												videourl = decodeURIComponent(newline[i]).replace(/.*5\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
												replacevideo = true;
												if(mimetype === "autodetect"){
													newmimetype = "application/x-flv";
												}
												//store download path
												this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
											}
											if (newline[i].match(/\,18\|http\:/) || newline[i].match(/\"18\|http\:/)) {
												fmt = "18";
												videourl = decodeURIComponent(newline[i]).replace(/.*18\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
												replacevideo = true;
												if(mimetype === "autodetect"){
													newmimetype = "video/mp4";
												}
												//store download path
												this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
											}
											if (newline[i].match(/\,34\|http\:/) || newline[i].match(/\"34\|http\:/)) {
												fmt = "34";
												videourl = decodeURIComponent(newline[i]).replace(/.*34\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
												replacevideo = true;
												if(mimetype === "autodetect"){
													newmimetype = "application/x-flv";
												}
												//store download path
												this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
											}
											if (newline[i].match(/\,35\|http\:/) || newline[i].match(/\"35\|http\:/)) {
												fmt = "35";
												videourl = decodeURIComponent(newline[i]).replace(/.*35\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
												replacevideo = true;
												if(mimetype === "autodetect"){
													newmimetype = "application/x-flv";
												}
												//store download path
												this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
											}
											if(prefermp4 === true){
												if (newline[i].match(/\,18\|http\:/) || newline[i].match(/\"18\|http\:/)) {
													fmt = "18";
													videourl = decodeURIComponent(newline[i]).replace(/.*18\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
													replacevideo = true;
													if(mimetype === "autodetect"){
														newmimetype = "video/mp4";
													}
												}
												//store download path
												this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
											}
										}

										if (videoquality === "HIGH"){

											if (newline[i].match(/\,5\|http\:/) || newline[i].match(/\"5\|http\:/)) {
												fmt = "5";
												videourl = decodeURIComponent(newline[i]).replace(/.*5\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
												replacevideo = true;
												if(mimetype === "autodetect"){
													newmimetype = "application/x-flv";
												}
												//store download path
												this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
											}
											if (newline[i].match(/\,18\|http\:/) || newline[i].match(/\"18\|http\:/)) {
												fmt = "18";
												videourl = decodeURIComponent(newline[i]).replace(/.*18\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
												replacevideo = true;
												if(mimetype === "autodetect"){
													newmimetype = "video/mp4";
												}
												//store download path
												this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
											}
											if (newline[i].match(/\,34\|http\:/) || newline[i].match(/\"34\|http\:/)) {
												fmt = "34";
												videourl = decodeURIComponent(newline[i]).replace(/.*34\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
												replacevideo = true;
												if(mimetype === "autodetect"){
													newmimetype = "application/x-flv";
												}
												//store download path
												this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
											}
											if (newline[i].match(/\,35\|http\:/) || newline[i].match(/\"35\|http\:/)) {
												fmt = "35";
												videourl = decodeURIComponent(newline[i]).replace(/.*35\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
												replacevideo = true;
												if(mimetype === "autodetect"){
													newmimetype = "application/x-flv";
												}
												//store download path
												this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
											}
											if(prefermp4 === true){
												if (newline[i].match(/\,18\|http\:/) || newline[i].match(/\"18\|http\:/)) {
													fmt = "18";
													videourl = decodeURIComponent(newline[i]).replace(/.*18\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
													replacevideo = true;
													if(mimetype === "autodetect"){
														newmimetype = "video/mp4";
													}
												}
												//store download path
												this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
											}
											if (newline[i].match(/\,22\|http\:/) || newline[i].match(/\"22\|http\:/)) {
												fmt = "22";
												videourl = decodeURIComponent(newline[i]).replace(/.*22\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
												replacevideo = true;
												if(mimetype === "autodetect"){
													newmimetype = "video/mp4";
												}
												//store download path
												this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
											}
										}

										if (videoquality === "SUPER"){

											if (newline[i].match(/\,5\|http\:/) || newline[i].match(/\"5\|http\:/)) {
												fmt = "5";
												videourl = decodeURIComponent(newline[i]).replace(/.*5\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
												replacevideo = true;
												if(mimetype === "autodetect"){
													newmimetype = "application/x-flv";
												}
												//store download path
												this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
											}
											if (newline[i].match(/\,18\|http\:/) || newline[i].match(/\"18\|http\:/)) {
												fmt = "18";
												videourl = decodeURIComponent(newline[i]).replace(/.*18\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
												replacevideo = true;
												if(mimetype === "autodetect"){
													newmimetype = "video/mp4";
												}
												//store download path
												this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
											}
											if (newline[i].match(/\,34\|http\:/) || newline[i].match(/\"34\|http\:/)) {
												fmt = "34";
												videourl = decodeURIComponent(newline[i]).replace(/.*34\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
												replacevideo = true;
												if(mimetype === "autodetect"){
													newmimetype = "application/x-flv";
												}
												//store download path
												this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
											}
											if (newline[i].match(/\,35\|http\:/) || newline[i].match(/\"35\|http\:/)) {
												fmt = "35";
												videourl = decodeURIComponent(newline[i]).replace(/.*35\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
												replacevideo = true;
												if(mimetype === "autodetect"){
													newmimetype = "application/x-flv";
												}
												//store download path
												this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
											}
											if(prefermp4 === true){
												if (newline[i].match(/\,18\|http\:/) || newline[i].match(/\"18\|http\:/)) {
													fmt = "18";
													videourl = decodeURIComponent(newline[i]).replace(/.*18\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
													replacevideo = true;
													if(mimetype === "autodetect"){
														newmimetype = "video/mp4";
													}
												}
												//store download path
												this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
											}
											if (newline[i].match(/\,22\|http\:/) || newline[i].match(/\"22\|http\:/)) {
												fmt = "22";
												videourl = decodeURIComponent(newline[i]).replace(/.*22\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
												replacevideo = true;
												if(mimetype === "autodetect"){
													newmimetype = "video/mp4";
												}
												//store download path
												this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
											}
											if (newline[i].match(/\,37\|http\:/) || newline[i].match(/\"37\|http\:/)) {
												fmt = "37";
												videourl = decodeURIComponent(newline[i]).replace(/.*37\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
												replacevideo = true;
												if(mimetype === "autodetect"){
													newmimetype = "video/mp4";
												}
												//store download path
												this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
											}
											if (newline[i].match(/\,38\|http\:/) || newline[i].match(/\"38\|http\:/)) {
												fmt = "38";
												videourl = decodeURIComponent(newline[i]).replace(/.*38\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
												replacevideo = true;
												if(mimetype === "autodetect"){
													newmimetype = "video/mp4";
												}
												//store download path
												this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
											}
										}

									}else{

										if (videoquality === "LOW"){

											if (newline[i].match(/\,18\|http\:/) || newline[i].match(/\"18\|http\:/)) {
												fmt = "18";
												videourl = decodeURIComponent(newline[i]).replace(/.*18\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
												replacevideo = true;
												if(mimetype === "autodetect"){
													newmimetype = "video/mp4";
												}
												//store download path
												this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
											}

											if((replacevideo === false) || (replacevideo === true && prefermp4 === false)){

												if (newline[i].match(/\,34\|http\:/) || newline[i].match(/\"34\|http\:/)) {
													fmt = "34";
													videourl = decodeURIComponent(newline[i]).replace(/.*34\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
													replacevideo = true;
													if(mimetype === "autodetect"){
														newmimetype = "application/x-flv";
													}
													//store download path
													this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
												}

												if(replacevideo === false){

													if (newline[i].match(/\,5\|http\:/) || newline[i].match(/\"5\|http\:/)) {
														fmt = "5";
														videourl = decodeURIComponent(newline[i]).replace(/.*5\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
														replacevideo = true;
														if(mimetype === "autodetect"){
															newmimetype = "application/x-flv";
														}
														//store download path
														this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
													}
												}
											}
										}

										if (videoquality === "MEDIUM"){

											if (newline[i].match(/\,18\|http\:/) || newline[i].match(/\"18\|http\:/)) {
												fmt = "18";
												videourl = decodeURIComponent(newline[i]).replace(/.*18\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
												replacevideo = true;
												if(mimetype === "autodetect"){
													newmimetype = "video/mp4";
												}
												//store download path
												this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
											}

											if(replacevideo === false || (replacevideo === true && prefermp4 === false)){

												if (newline[i].match(/\,35\|http\:/) || newline[i].match(/\"35\|http\:/)) {
													fmt = "35";
													videourl = decodeURIComponent(newline[i]).replace(/.*35\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
													replacevideo = true;
													if(mimetype === "autodetect"){
														newmimetype = "application/x-flv";
													}
													//store download path
													this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
												}

												if(replacevideo === false){

													if (newline[i].match(/\,34\|http\:/) || newline[i].match(/\"34\|http\:/)) {
														fmt = "34";
														videourl = decodeURIComponent(newline[i]).replace(/.*34\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
														replacevideo = true;
														if(mimetype === "autodetect"){
															newmimetype = "application/x-flv";
														}
														//store download path
														this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
													}

													if(replacevideo === false){
														if (newline[i].match(/\,5\|http\:/) || newline[i].match(/\"5\|http\:/)) {
															fmt = "5";
															videourl = decodeURIComponent(newline[i]).replace(/.*5\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
															replacevideo = true;
															if(mimetype === "autodetect"){
																newmimetype = "application/x-flv";
															}
															//store download path
															this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
														}
													}
												}
											}
										}

										if (videoquality === "HIGH"){

											if (newline[i].match(/\,22\|http\:/) || newline[i].match(/\"22\|http\:/)) {
												fmt = "22";
												videourl = decodeURIComponent(newline[i]).replace(/.*22\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
												replacevideo = true;
												if(mimetype === "autodetect"){
													newmimetype = "video/mp4";
												}
												//store download path
												this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
											}

											if(replacevideo === false){

												if (newline[i].match(/\,18\|http\:/) || newline[i].match(/\"18\|http\:/)) {
													fmt = "18";
													videourl = decodeURIComponent(newline[i]).replace(/.*18\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
													replacevideo = true;
													if(mimetype === "autodetect"){
														newmimetype = "video/mp4";
													}
													//store download path
													this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
												}

												if(replacevideo === false || (replacevideo === true && prefermp4 === false)){

													if (newline[i].match(/\,35\|http\:/) || newline[i].match(/\"35\|http\:/)) {
														fmt = "35";
														videourl = decodeURIComponent(newline[i]).replace(/.*35\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
														replacevideo = true;
														if(mimetype === "autodetect"){
															newmimetype = "application/x-flv";
														}
														//store download path
														this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
													}
													if(replacevideo === false){

														if (newline[i].match(/\,34\|http\:/) || newline[i].match(/\"34\|http\:/)) {
															fmt = "34";
															videourl = decodeURIComponent(newline[i]).replace(/.*34\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
															replacevideo = true;
															if(mimetype === "autodetect"){
																newmimetype = "application/x-flv";
															}
															//store download path
															this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
														}

														if(replacevideo === false){
															if (newline[i].match(/\,5\|http\:/) || newline[i].match(/\"5\|http\:/)) {
																fmt = "5";
																videourl = decodeURIComponent(newline[i]).replace(/.*5\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
																replacevideo = true;
																if(mimetype === "autodetect"){
																	newmimetype = "application/x-flv";
																}
																//store download path
																this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
															}
														}
													}
												}
											}
										}
										if (videoquality === "SUPER"){

											if (newline[i].match(/\,38\|http\:/) || newline[i].match(/\"38\|http\:/)) {
												fmt = "38";
												videourl = decodeURIComponent(newline[i]).replace(/.*38\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
												replacevideo = true;
												if(mimetype === "autodetect"){
													newmimetype = "video/mp4";
												}
												//store download path
												this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
											}

											if(replacevideo === false){

												if (newline[i].match(/\,37\|http\:/) || newline[i].match(/\"37\|http\:/)) {
													fmt = "37";
													videourl = decodeURIComponent(newline[i]).replace(/.*37\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
													replacevideo = true;
													if(mimetype === "autodetect"){
														newmimetype = "video/mp4";
													}
													//store download path
													this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
												}

												if(replacevideo === false){

													if (newline[i].match(/\,22\|http\:/) || newline[i].match(/\"22\|http\:/)) {
														fmt = "22";
														videourl = decodeURIComponent(newline[i]).replace(/.*22\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
														replacevideo = true;
														if(mimetype === "autodetect"){
															newmimetype = "video/mp4";
														}
														//store download path
														this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
													}

													if(replacevideo === false){

														if (newline[i].match(/\,18\|http\:/) || newline[i].match(/\"18\|http\:/)) {
															fmt = "18";
															videourl = decodeURIComponent(newline[i]).replace(/.*18\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
															replacevideo = true;
															if(mimetype === "autodetect"){
																newmimetype = "video/mp4";
															}
															//store download path
															this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
														}

														if(replacevideo === false || (replacevideo === true && prefermp4 === false)){

															if (newline[i].match(/\,35\|http\:/) || newline[i].match(/\"35\|http\:/)) {
																fmt = "35";
																videourl = decodeURIComponent(newline[i]).replace(/.*35\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
																replacevideo = true;
																if(mimetype === "autodetect"){
																	newmimetype = "application/x-flv";
																}
																//store download path
																this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
															}
															if(replacevideo === false){

																if (newline[i].match(/\,34\|http\:/) || newline[i].match(/\"34\|http\:/)) {
																	fmt = "34";
																	videourl = decodeURIComponent(newline[i]).replace(/.*34\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
																	replacevideo = true;
																	if(mimetype === "autodetect"){
																		newmimetype = "application/x-flv";
																	}
																	//store download path
																	this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
																}

																if(replacevideo === false){
																	if (newline[i].match(/\,5\|http\:/) || newline[i].match(/\"5\|http\:/)) {
																		fmt = "5";
																		videourl = decodeURIComponent(newline[i]).replace(/.*5\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
																		replacevideo = true;
																		if(mimetype === "autodetect"){
																			newmimetype = "application/x-flv";
																		}
																		//store download path
																		this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
																	}
																}
															}
														}
													}
												}
											}
										}
									}
									if (replacevideo === true){

										//access preferences interface
										this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
										.getService(Components.interfaces.nsIPrefService)
										.getBranch("extensions.flvideoreplacer.");
										//set file mime type
										if(mimetype === "autodetect"){
											this.prefs.setCharPref("filemime",newmimetype);
										}else{
											this.prefs.setCharPref("filemime",mimetype);
										}

										//access preferences interface
										this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
										.getService(Components.interfaces.nsIPrefService)
										.getBranch("extensions.flvideoreplacer.video.");

										//store video branch
										videojson = {};
										videojson.sitename = "YouTube";
										videojson.sitestring = "youtube";
										videojson.videowidth = "642";
										videojson.videoheight = "390";
										videojson.videoelement = videoelement;
										videojson.videofmt = fmt;
										videojson.videomime = newmimetype;
										videojson.videourl = videourl;
										JSONStrings = JSON.stringify(videojson);
										this.prefs.setCharPref("youtube."+videoid,JSONStrings);

										//replace
										if(replacemethod === "embedded"){
											if(autolaunchembed === false){
												flvideoreplacerListener.placeHolder(aEvent,"youtube."+videoid);
											}else{
												flvideoreplacerListener.videoReplace(aEvent,"youtube."+videoid);
											}
										}
										if(replacemethod === "standalone"){
											if(autolaunchplayer === false){
												flvideoreplacerListener.placeHolder(aEvent,"youtube."+videoid);
											}else{
												flvideoreplacerListener.videoReplace(aEvent,"youtube."+videoid);
											}
										}
										if(replacemethod === "newtab"){
											if(autolaunchtab === false){
												flvideoreplacerListener.placeHolder(aEvent,"youtube."+videoid);
											}else{
												flvideoreplacerListener.videoReplace(aEvent,"youtube."+videoid);
											}
										}
										if(replacemethod === "newwindow"){
											if(autolaunchwindow === false){
												flvideoreplacerListener.placeHolder(aEvent,"youtube."+videoid);
											}else{
												flvideoreplacerListener.videoReplace(aEvent,"youtube."+videoid);
											}
										}
									}
									break;    
								}
							}
						}
					};
					req.send(null);
				}
			}
			if(sourceurl.match(/vimeo\.com\/\d{1,8}/)){

				//fetch video ID from url
				videoid = sourceurl.replace(/.*\//g, "");
				//declare element to be replaced
				videoelement = "meat";
				testelement = doc.getElementById(videoelement);

				if (testelement !== null) {

					var signature = false;
					var signature_expires = false;

					//declare xml file with authentication data to be downloaded
					xmlsource = "http://vimeo.com/moogaloop/load/clip:"+videoid;

					//get xml document content
					req = new XMLHttpRequest();   
					req.open('GET', xmlsource, true);
					req.onreadystatechange = function () {

						if (this.readyState == 4 && this.status == 200) {

							//read lines
							pagecontent = req.responseText;
							newline = pagecontent.split("\n");

							for(var i=0; i< newline.length; i++){

								//match patterns
								var matchrequest_signature = /<request_signature>/.test(newline[i]);
								var matchrequest_signature_expires = /<request_signature_expires>/.test(newline[i]);

								if (matchrequest_signature === true) {

									//replace unneeded characters and declare new value
									request_signature = newline[i].replace(/<request_signature>/, "");
									request_signature = request_signature.replace(/<\/request_signature>/, "");
									request_signature = request_signature.replace(/\s/g, "");
									//declare the video should be replaced
									signature = true;
								}

								if (matchrequest_signature_expires === true) {

									//replace unneeded characters and declare new value
									request_signature_expires = newline[i].replace(/<request_signature_expires>/, "");
									request_signature_expires = request_signature_expires.replace(/<\/request_signature_expires>/, "");
									request_signature_expires = request_signature_expires.replace(/\s/g, "");
									//declare the video should be replaced
									signature_expires = true;
								}
							}
							if(signature === true && signature_expires === true){

								//access preferences interface
								this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
								.getService(Components.interfaces.nsIPrefService)
								.getBranch("extensions.flvideoreplacer.");

								//declare video url
								videourl = "http://vimeo.com/moogaloop/play/clip:"+videoid+"/"+request_signature+"/"+request_signature_expires+"/?q=sd";
								//declare and store file mime
								if(mimetype === "autodetect"){
									newmimetype = "video/mp4";
									this.prefs.setCharPref("filemime",newmimetype);
								}else{
									this.prefs.setCharPref("filemime",mimetype);
								}
								//access preferences interface
								this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
								.getService(Components.interfaces.nsIPrefService)
								.getBranch("extensions.flvideoreplacer.downloadersource.");
								//store download path
								this.prefs.setCharPref("vimeo."+videoid,videourl);

								//access preferences interface
								this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
								.getService(Components.interfaces.nsIPrefService)
								.getBranch("extensions.flvideoreplacer.video.");

								//store video branch
								videojson = {};
								videojson.sitename = "Vimeo";
								videojson.sitestring = "vimeo";
								videojson.videowidth = "640";
								videojson.videoheight = "384";
								videojson.videoelement = "meat";
								videojson.videofmt = "97";
								videojson.videomime = newmimetype;
								videojson.videourl = videourl;
								JSONStrings = JSON.stringify(videojson);
								this.prefs.setCharPref("vimeo."+videoid,JSONStrings);

								//replace
								if(replacemethod === "embedded"){
									if(autolaunchembed === false){
										flvideoreplacerListener.placeHolder(aEvent,"vimeo."+videoid);
									}else{
										flvideoreplacerListener.videoReplace(aEvent,"vimeo."+videoid);
									}
								}
								if(replacemethod === "standalone"){
									if(autolaunchplayer === false){
										flvideoreplacerListener.placeHolder(aEvent,"vimeo."+videoid);
									}else{
										flvideoreplacerListener.videoReplace(aEvent,"vimeo."+videoid);
									}
								}
								if(replacemethod === "newtab"){
									if(autolaunchtab === false){
										flvideoreplacerListener.placeHolder(aEvent,"vimeo."+videoid);
									}else{
										flvideoreplacerListener.videoReplace(aEvent,"vimeo."+videoid);
									}
								}
								if(replacemethod === "newwindow"){
									if(autolaunchwindow === false){
										flvideoreplacerListener.placeHolder(aEvent,"vimeo."+videoid);
									}else{
										flvideoreplacerListener.videoReplace(aEvent,"vimeo."+videoid);
									}
								}
							}
						}
					};
					req.send(null);
				}
			}
			if((sourceurl.match(/metacafe\.com\/watch\//) && !sourceurl.match(/http.*http:\/\/www.metacafe\.com/))){

				//fetch video ID from url
				videoid = sourceurl.replace(/.*watch\//, "").replace(/\/.*/,"");
				//declare element to be replaced
				videoelement = "FlashWrap";
				testelement = doc.getElementById(videoelement);

				if (testelement !== null) {

					//fetch page html content
					pagecontent = doc.getElementsByTagName("body").item(0).innerHTML;
					newline = pagecontent.split("\n");

					for(var i=0; i< newline.length; i++){

						//match patterns
						matchpattern = /flashVars.*mediaURL\=.*gdaKey\=/.test(newline[i]);
						matchpattern2 = /flashVars.*mediaURL.*/.test(newline[i]);

						if (matchpattern === true) {
							videourl = decodeURIComponent(newline[i]).replace(/\t/g,"").replace(/\n/g,"").replace(/ /g,"").replace(/.*mediaURL\=/g,"").replace(/\&gdaKey\=.*/,"").replace(/\&amp.gdaKey\=.*/,"").replace(/\\/g,"");
							key = decodeURIComponent(newline[i]).replace(/\t/g,"").replace(/\n/g,"").replace(/ /g,"").replace(/.*gdaKey\=/,"").replace(/\&postRollContentURL.*/,"").replace(/\&amp;postRollContentURL.*/,"");
							videourl = videourl+"?__gda__="+key;
							replacevideo = true;
						}else{

							if (matchpattern2 === true) {
								videourl = decodeURIComponent(newline[i]).replace(/\t/g,"").replace(/\n/g,"").replace(/ /g,"").replace(/.*mediaURL":"http/,"http").replace(/",.*/,"").replace(/\\/g,"");
								key = decodeURIComponent(newline[i]).replace(/\t/g,"").replace(/\n/g,"").replace(/ /g,"").replace(/.*key":"/,"").replace(/"\}.*/,"");
								videourl = videourl+"?__gda__="+key;
								replacevideo = true;
							}
						}
					}

					if(replacevideo === true){
						//declare and store file mime
						if(mimetype === "autodetect"){
							newmimetype = "video/mp4";
							this.prefs.setCharPref("filemime",newmimetype);
						}else{
							this.prefs.setCharPref("filemime",mimetype);
						}
						//access preferences interface
						this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
						.getService(Components.interfaces.nsIPrefService)
						.getBranch("extensions.flvideoreplacer.downloadersource.");
						//store download path
						this.prefs.setCharPref("metacafe."+videoid,videourl);

						//access preferences interface
						this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
						.getService(Components.interfaces.nsIPrefService)
						.getBranch("extensions.flvideoreplacer.video.");

						//store video branch
						videojson = {};
						videojson.sitename = "Metacafe";
						videojson.sitestring = "metacafe";
						videojson.videowidth = "615";
						videojson.videoheight = "400";
						videojson.videoelement = "FlashWrap";
						videojson.videofmt = "97";
						videojson.videomime = newmimetype;
						videojson.videourl = videourl;
						JSONStrings = JSON.stringify(videojson);
						this.prefs.setCharPref("metacafe."+videoid,JSONStrings);

						//replace
						if(replacemethod === "embedded"){
							if(autolaunchembed === false){
								flvideoreplacerListener.placeHolder(aEvent,"metacafe."+videoid);
							}else{
								flvideoreplacerListener.videoReplace(aEvent,"metacafe."+videoid);
							}
						}
						if(replacemethod === "standalone"){
							if(autolaunchplayer === false){
								flvideoreplacerListener.placeHolder(aEvent,"metacafe."+videoid);
							}else{
								flvideoreplacerListener.videoReplace(aEvent,"metacafe."+videoid);
							}
						}
						if(replacemethod === "newtab"){
							if(autolaunchtab === false){
								flvideoreplacerListener.placeHolder(aEvent,"metacafe."+videoid);
							}else{
								flvideoreplacerListener.videoReplace(aEvent,"metacafe."+videoid);
							}
						}
						if(replacemethod === "newwindow"){
							if(autolaunchwindow === false){
								flvideoreplacerListener.placeHolder(aEvent,"metacafe."+videoid);
							}else{
								flvideoreplacerListener.videoReplace(aEvent,"metacafe."+videoid);
							}
						}
					}
				}
			}
			if(sourceurl.match(/blip\.tv\/file\/.*/)){

				//fetch video ID from url
				videoid = sourceurl.replace(/.*file\//, "").replace(/\//, "").replace(/\?.*/, "");
				//declare element to be replaced
				videoelement = "video_player";
				testelement = doc.getElementById(videoelement);

				if (testelement !== null) {

					//fetch page html content
					pagecontent = doc.getElementsByTagName("body").item(0).innerHTML;
					newline = pagecontent.split("\n");

					for(var i=0; i< newline.length; i++){

						//match patterns
						var matchpattern = /player\.setPrimaryMediaUrl/.test(newline[i]);

						if (matchpattern == true) {//fetch line with PrimaryMediaUrl

							videourl = newline[i].replace(/player\.setPrimaryMediaUrl\(\"/, "").replace(/\?.*/, "").replace(/.*http/g,"http");
							replacevideo = true;
						}
					}
					if(replacevideo === true){
						//declare and store file mime
						if(mimetype === "autodetect"){
							if(videourl.match(/\.mp4/)){
								newmimetype = "video/mp4";
							}
							if(videourl.match(/\.mov/)){
								newmimetype = "video/x-quicktime";
							}
							if(videourl.match(/\.m4v/)){
								newmimetype = "video/x-m4v";
							}
							if(videourl.match(/\.wmv/)){
								newmimetype = "application/x-ms-wmv";
							}
							if(videourl.match(/\.flv/)){
								newmimetype = "application/x-flv";
							}
							this.prefs.setCharPref("filemime",newmimetype);
						}else{
							this.prefs.setCharPref("filemime",mimetype);
						}
						//access preferences interface
						this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
						.getService(Components.interfaces.nsIPrefService)
						.getBranch("extensions.flvideoreplacer.downloadersource.");
						//store download path
						this.prefs.setCharPref("bliptv."+videoid,videourl);

						//access preferences interface
						this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
						.getService(Components.interfaces.nsIPrefService)
						.getBranch("extensions.flvideoreplacer.video.");

						//store video branch
						videojson = {};
						videojson.sitename = "Bliptv";
						videojson.sitestring = "bliptv";
						videojson.videowidth = "624";
						videojson.videoheight = "380";
						videojson.videoelement = "video_player";
						videojson.videofmt = "97";
						videojson.videomime = newmimetype;
						videojson.videourl = videourl;
						JSONStrings = JSON.stringify(videojson);
						this.prefs.setCharPref("bliptv."+videoid,JSONStrings);

						//replace
						if(replacemethod === "embedded"){
							if(autolaunchembed === false){
								flvideoreplacerListener.placeHolder(aEvent,"bliptv."+videoid);
							}else{
								flvideoreplacerListener.videoReplace(aEvent,"bliptv."+videoid);
							}
						}
						if(replacemethod === "standalone"){
							if(autolaunchplayer === false){
								flvideoreplacerListener.placeHolder(aEvent,"bliptv."+videoid);
							}else{
								flvideoreplacerListener.videoReplace(aEvent,"bliptv."+videoid);
							}
						}
						if(replacemethod === "newtab"){
							if(autolaunchtab === false){
								flvideoreplacerListener.placeHolder(aEvent,"bliptv."+videoid);
							}else{
								flvideoreplacerListener.videoReplace(aEvent,"bliptv."+videoid);
							}
						}
						if(replacemethod === "newwindow"){
							if(autolaunchwindow === false){
								flvideoreplacerListener.placeHolder(aEvent,"bliptv."+videoid);
							}else{
								flvideoreplacerListener.videoReplace(aEvent,"bliptv."+videoid);
							}
						}
					}
				}
			}
			if(sourceurl.match(/ustream\.tv\/recorded\/\d{1,8}/)){

				//fetch video ID from url
				videoid = sourceurl.replace(/.*recorded\//, "").replace(/\/.*/g, "");
				//declare element to be replaced
				videoelement = "channelFlashContent";
				testelement = doc.getElementById(videoelement);

				if (testelement !== null) {

					//fetch page html content
					pagecontent = doc.getElementsByTagName("head").item(0).innerHTML;
					newline = pagecontent.split("\n");

					for(var i=0; i< newline.length; i++){

						//match patterns
						matchpattern = /ustream\.vars\.liveHttpUrl/.test(newline[i]);
						matchpattern2 = /ustream\.vars\.videoPictureUrl/.test(newline[i]);

						if (matchpattern == true) {//fetch line with liveHttpUrl
							videourl = newline[i].replace(/.*ustream\.vars\.liveHttpUrl=\"/, "").replace(/".*/g, "").replace(/\\/g, "");
							//declare and store file mime
							if(mimetype === "autodetect"){
								if(videourl.match(/\.mp4/)){
									newmimetype = "video/mp4";
								}
								if(videourl.match(/\.mov/)){
									newmimetype = "video/x-quicktime";
								}
								if(videourl.match(/\.m4v/)){
									newmimetype = "video/x-m4v";
								}
								if(videourl.match(/\.wmv/)){
									newmimetype = "application/x-ms-wmv";
								}
								if(videourl.match(/\.flv/)){
									newmimetype = "application/x-flv";
								}
								this.prefs.setCharPref("filemime",newmimetype);
							}else{
								this.prefs.setCharPref("filemime",mimetype);
							}
							//access preferences interface
							this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
							.getService(Components.interfaces.nsIPrefService)
							.getBranch("extensions.flvideoreplacer.downloadersource.");
							//store download path
							this.prefs.setCharPref("ustream."+videoid,videourl);

							//access preferences interface
							this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
							.getService(Components.interfaces.nsIPrefService)
							.getBranch("extensions.flvideoreplacer.video.");

							//store video branch
							videojson = {};
							videojson.sitename = "Ustream";
							videojson.sitestring = "ustream";
							videojson.videowidth = "608";
							videojson.videoheight = "368";
							videojson.videoelement = "channelFlashContent";
							videojson.videofmt = "97";
							videojson.videomime = newmimetype;
							videojson.videourl = videourl;
							JSONStrings = JSON.stringify(videojson);
							this.prefs.setCharPref("ustream."+videoid,JSONStrings);

							//replace
							if(replacemethod === "embedded"){
								if(autolaunchembed === false){
									flvideoreplacerListener.placeHolder(aEvent,"ustream."+videoid);
								}else{
									flvideoreplacerListener.videoReplace(aEvent,"ustream."+videoid);
								}
							}
							if(replacemethod === "standalone"){
								if(autolaunchplayer === false){
									flvideoreplacerListener.placeHolder(aEvent,"ustream."+videoid);
								}else{
									flvideoreplacerListener.videoReplace(aEvent,"ustream."+videoid);
								}
							}
							if(replacemethod === "newtab"){
								if(autolaunchtab === false){
									flvideoreplacerListener.placeHolder(aEvent,"ustream."+videoid);
								}else{
									flvideoreplacerListener.videoReplace(aEvent,"ustream."+videoid);
								}
							}
							if(replacemethod === "newwindow"){
								if(autolaunchwindow === false){
									flvideoreplacerListener.placeHolder(aEvent,"ustream."+videoid);
								}else{
									flvideoreplacerListener.videoReplace(aEvent,"ustream."+videoid);
								}
							}
						}else{
							if (matchpattern2 == true){
								var pd;
								for (pd=1; pd<=10; pd++){
									var testurl = newline[i].replace(/.*videopic/,"http://ustream.vo.llnwd.net/pd"+pd).replace(/_\d{1,3}x.*/,".flv").replace(/\\/g, "");

									//get xml document content
									req = new XMLHttpRequest();   
									req.open('GET', testurl, true);
									req.onreadystatechange = function () {
										if (this.readyState == 4 && this.status == 200) {

											//declare video url
											videourl = newline[i].replace(/.*videopic/,"http://ustream.vo.llnwd.net/pd"+pd).replace(/_\d{1,3}x.*/,".flv").replace(/\\/g, "");

											//access preferences interface
											this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
											.getService(Components.interfaces.nsIPrefService)
											.getBranch("extensions.flvideoreplacer.");

											//declare and store file mime
											if(mimetype === "autodetect"){
												if(videourl.match(/\.mp4/)){
													newmimetype = "video/mp4";
												}
												if(videourl.match(/\.mov/)){
													newmimetype = "video/x-quicktime";
												}
												if(videourl.match(/\.m4v/)){
													newmimetype = "video/x-m4v";
												}
												if(videourl.match(/\.wmv/)){
													newmimetype = "application/x-ms-wmv";
												}
												if(videourl.match(/\.flv/)){
													newmimetype = "application/x-flv";
												}
												this.prefs.setCharPref("filemime",newmimetype);
											}else{
												this.prefs.setCharPref("filemime",mimetype);
											}
											//access preferences interface
											this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
											.getService(Components.interfaces.nsIPrefService)
											.getBranch("extensions.flvideoreplacer.downloadersource.");
											//store download path
											this.prefs.setCharPref("ustream."+videoid,videourl);

											//access preferences interface
											this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
											.getService(Components.interfaces.nsIPrefService)
											.getBranch("extensions.flvideoreplacer.video.");

											//store video branch
											videojson = {};
											videojson.sitename = "Ustream";
											videojson.sitestring = "ustream";
											videojson.videowidth = "608";
											videojson.videoheight = "368";
											videojson.videoelement = "channelFlashContent";
											videojson.videofmt = "97";
											videojson.videomime = newmimetype;
											videojson.videourl = videourl;
											JSONStrings = JSON.stringify(videojson);
											this.prefs.setCharPref("ustream."+videoid,JSONStrings);

											//replace
											if(replacemethod === "embedded"){
												if(autolaunchembed === false){
													flvideoreplacerListener.placeHolder(aEvent,"ustream."+videoid);
												}else{
													flvideoreplacerListener.videoReplace(aEvent,"ustream."+videoid);
												}
											}
											if(replacemethod === "standalone"){
												if(autolaunchplayer === false){
													flvideoreplacerListener.placeHolder(aEvent,"ustream."+videoid);
												}else{
													flvideoreplacerListener.videoReplace(aEvent,"ustream."+videoid);
												}
											}
											if(replacemethod === "newtab"){
												if(autolaunchtab === false){
													flvideoreplacerListener.placeHolder(aEvent,"ustream."+videoid);
												}else{
													flvideoreplacerListener.videoReplace(aEvent,"ustream."+videoid);
												}
											}
											if(replacemethod === "newwindow"){
												if(autolaunchwindow === false){
													flvideoreplacerListener.placeHolder(aEvent,"ustream."+videoid);
												}else{
													flvideoreplacerListener.videoReplace(aEvent,"ustream."+videoid);
												}
											}
										}
									};
									req.send(null);
								}
							}
						}
					}
				}
			}
			if(sourceurl.match(/youporn\.com\/watch\//)){

				//fetch video ID from url
				videoid = sourceurl.replace(/.*watch\//g, "").replace(/\/.*/,"");

				//declare element to be replaced
				videoelement = "player";
				testelement = doc.getElementById(videoelement);

				if (testelement !== null) {

					//fetch page html content
					pagecontent = doc.getElementsByTagName("body").item(0).innerHTML;
					newline = pagecontent.split("\n");

					for(var i=0; i< newline.length; i++){

						//match patterns
						matchpattern = /addVariable\('file'/.test(newline[i]);

						if (matchpattern === true) {
							xmlsource = newline[i].replace(/.*encodeURIComponent\('/,"").replace(/'.*/,"");
							replacevideo = true;
						}
					}

					if(replacevideo === true){

						replacevideo = false;

						//get xml document content
						req = new XMLHttpRequest();   
						req.open('GET', xmlsource, true);
						req.onreadystatechange = function () {
							if (this.readyState == 4 && this.status == 200) {
								//read lines
								pagecontent = req.responseXML;

								var eltrackList = pagecontent.getElementsByTagName('trackList');
								var eltrack = pagecontent.getElementsByTagName('track');
								var elurl = pagecontent.getElementsByTagName('location');

								if (eltrackList.length > 0){
									try{
										for(var i=0; i< eltrack.length; i++){
											if(eltrack[0]){
												videourl = elurl[0].firstChild.nodeValue;
												if(elurl[0]){
													replacevideo = true;
												}
											}
										}
									}catch(e){
										//do nothing
									}
								}
								if(replacevideo === true){
									//access preferences interface
									this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
									.getService(Components.interfaces.nsIPrefService)
									.getBranch("extensions.flvideoreplacer.");
									//declare and store file mime
									if(mimetype === "autodetect"){
										newmimetype = "application/x-flv";
										this.prefs.setCharPref("filemime",newmimetype);
									}else{
										this.prefs.setCharPref("filemime",mimetype);
									}
									//access preferences interface
									this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
									.getService(Components.interfaces.nsIPrefService)
									.getBranch("extensions.flvideoreplacer.downloadersource.");
									//store download path
									this.prefs.setCharPref("youporn."+videoid,videourl);

									//access preferences interface
									this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
									.getService(Components.interfaces.nsIPrefService)
									.getBranch("extensions.flvideoreplacer.video.");

									//store video branch
									videojson = {};
									videojson.sitename = "YouPorn";
									videojson.sitestring = "youporn";
									videojson.videowidth = "600";
									videojson.videoheight = "470";
									videojson.videoelement = "player";
									videojson.videofmt = "97";
									videojson.videomime = newmimetype;
									videojson.videourl = videourl;
									JSONStrings = JSON.stringify(videojson);
									this.prefs.setCharPref("youporn."+videoid,JSONStrings);

									//replace
									if(replacemethod === "embedded"){
										if(autolaunchembed === false){
											flvideoreplacerListener.placeHolder(aEvent,"youporn."+videoid);
										}else{
											flvideoreplacerListener.videoReplace(aEvent,"youporn."+videoid);
										}
									}
									if(replacemethod === "standalone"){
										if(autolaunchplayer === false){
											flvideoreplacerListener.placeHolder(aEvent,"youporn."+videoid);
										}else{
											flvideoreplacerListener.videoReplace(aEvent,"youporn."+videoid);
										}
									}
									if(replacemethod === "newtab"){
										if(autolaunchtab === false){
											flvideoreplacerListener.placeHolder(aEvent,"youporn."+videoid);
										}else{
											flvideoreplacerListener.videoReplace(aEvent,"youporn."+videoid);
										}
									}
									if(replacemethod === "newwindow"){
										if(autolaunchwindow === false){
											flvideoreplacerListener.placeHolder(aEvent,"youporn."+videoid);
										}else{
											flvideoreplacerListener.videoReplace(aEvent,"youporn."+videoid);
										}
									}
								}
							}
						};
						req.send(null);
					}
				}
			}
			if(sourceurl.match(/pornhub\.com\/view_video.php\?viewkey=/)){

				//fetch video ID from url
				videoid = sourceurl.replace(/.*viewkey=/g, "");
				//declare element to be replaced
				videoelement = "playerDiv_1";
				testelement = doc.getElementById(videoelement);

				if (testelement !== null) {

					//fetch page html content
					pagecontent = doc.getElementsByTagName("body").item(0).innerHTML;
					newline = pagecontent.split("\n");

					for(var i=0; i< newline.length; i++){

						//match patterns
						matchpattern = /addVariable\("video_url"/.test(newline[i]);

						if (matchpattern === true) {
							videourl = decodeURIComponent(newline[i]).replace(/.*addVariable\("video_url","/,"").replace(/".*/,"");
							replacevideo = true;
						}
					}

					if(replacevideo === true){
						//declare and store file mime
						if(mimetype === "autodetect"){
							newmimetype = "application/x-flv";
							this.prefs.setCharPref("filemime",newmimetype);
						}else{
							this.prefs.setCharPref("filemime",mimetype);
						}
						//access preferences interface
						this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
						.getService(Components.interfaces.nsIPrefService)
						.getBranch("extensions.flvideoreplacer.downloadersource.");
						//store download path
						this.prefs.setCharPref("pornhub."+videoid,videourl);

						//access preferences interface
						this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
						.getService(Components.interfaces.nsIPrefService)
						.getBranch("extensions.flvideoreplacer.video.");

						//store video branch
						videojson = {};
						videojson.sitename = "PornHub";
						videojson.sitestring = "pornhub";
						videojson.videowidth = "610";
						videojson.videoheight = "480";
						videojson.videoelement = "playerDiv_1";
						videojson.videofmt = "97";
						videojson.videomime = newmimetype;
						videojson.videourl = videourl;
						JSONStrings = JSON.stringify(videojson);
						this.prefs.setCharPref("pornhub."+videoid,JSONStrings);

						//replace
						if(replacemethod === "embedded"){
							if(autolaunchembed === false){
								flvideoreplacerListener.placeHolder(aEvent,"pornhub."+videoid);
							}else{
								flvideoreplacerListener.videoReplace(aEvent,"pornhub."+videoid);
							}
						}
						if(replacemethod === "standalone"){
							if(autolaunchplayer === false){
								flvideoreplacerListener.placeHolder(aEvent,"pornhub."+videoid);
							}else{
								flvideoreplacerListener.videoReplace(aEvent,"pornhub."+videoid);
							}
						}
						if(replacemethod === "newtab"){
							if(autolaunchtab === false){
								flvideoreplacerListener.placeHolder(aEvent,"pornhub."+videoid);
							}else{
								flvideoreplacerListener.videoReplace(aEvent,"pornhub."+videoid);
							}
						}
						if(replacemethod === "newwindow"){
							if(autolaunchwindow === false){
								flvideoreplacerListener.placeHolder(aEvent,"pornhub."+videoid);
							}else{
								flvideoreplacerListener.videoReplace(aEvent,"pornhub."+videoid);
							}
						}
					}
				}
			}
			if(sourceurl.match(/redtube\.com\/\d{1,8}/)){

				//fetch video ID from url
				videoid = sourceurl.replace(/.*redtube\.com\//g, "");
				//declare element to be replaced	
				testelement = doc.getElementById("redtube_flv_player");
				if(testelement !== null){
					testelement.setAttribute('id',"redtube_flvideoreplacer");
					videoelement = "redtube_flvideoreplacer";
					testelement = doc.getElementById(videoelement);
				}else{
					videoelement = "redtube_flvideoreplacer";
					testelement = doc.getElementById(videoelement);
				}

				if (testelement !== null) {

					//fetch page html content
					pagecontent = doc.getElementsByTagName("body").item(0).innerHTML;
					newline = pagecontent.split("\n");

					for(var i=0; i< newline.length; i++){

						//match patterns
						var matchpattern = /FlashVars.*hashlink=/.test(newline[i]);

						if (matchpattern === true) {

							videourl = newline[i].replace(/.*hashlink=/,"").replace(/\&.*/g,"");
							videourl = decodeURIComponent(videourl);
							replacevideo = true;
						}
					}

					if(replacevideo === true){
						//declare and store file mime
						if(mimetype === "autodetect"){
							newmimetype = "application/x-flv";
							this.prefs.setCharPref("filemime",newmimetype);
						}else{
							this.prefs.setCharPref("filemime",mimetype);
						}
						//access preferences interface
						this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
						.getService(Components.interfaces.nsIPrefService)
						.getBranch("extensions.flvideoreplacer.downloadersource.");
						//store download path
						this.prefs.setCharPref("redtube."+videoid,videourl);

						//access preferences interface
						this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
						.getService(Components.interfaces.nsIPrefService)
						.getBranch("extensions.flvideoreplacer.video.");

						//store video branch
						videojson = {};
						videojson.sitename = "RedTube";
						videojson.sitestring = "redtube";
						videojson.videowidth = "584";
						videojson.videoheight = "468";
						videojson.videoelement = "redtube_flvideoreplacer";
						videojson.videofmt = "97";
						videojson.videomime = newmimetype;
						videojson.videourl = videourl;
						JSONStrings = JSON.stringify(videojson);
						this.prefs.setCharPref("redtube."+videoid,JSONStrings);

						//replace
						if(replacemethod === "embedded"){
							if(autolaunchembed === false){
								flvideoreplacerListener.placeHolder(aEvent,"redtube."+videoid);
							}else{
								flvideoreplacerListener.videoReplace(aEvent,"redtube."+videoid);
							}
						}
						if(replacemethod === "standalone"){
							if(autolaunchplayer === false){
								flvideoreplacerListener.placeHolder(aEvent,"redtube."+videoid);
							}else{
								flvideoreplacerListener.videoReplace(aEvent,"redtube."+videoid);
							}
						}
						if(replacemethod === "newtab"){
							if(autolaunchtab === false){
								flvideoreplacerListener.placeHolder(aEvent,"redtube."+videoid);
							}else{
								flvideoreplacerListener.videoReplace(aEvent,"redtube."+videoid);
							}
						}
						if(replacemethod === "newwindow"){
							if(autolaunchwindow === false){
								flvideoreplacerListener.placeHolder(aEvent,"redtube."+videoid);
							}else{
								flvideoreplacerListener.videoReplace(aEvent,"redtube."+videoid);
							}
						}
					}
				}
			}
		},

		placeHolder: function(aEvent,aBranch) {

			if(aEvent == content.document){
				//get original target document and url
				var doc = content.document; 
				var sourceurl = content.document.location.href;
			}else{
				//get original target document and url
				var doc = aEvent.originalTarget;
				var sourceurl = doc.location.href;
			}

			//get osString
			var osString = Components.classes["@mozilla.org/network/protocol;1?name=http"]
			.getService(Components.interfaces.nsIHttpProtocolHandler).oscpu; 

			//access preferences interface
			this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.flvideoreplacer.");

			//get prefs
			var replacemethod = this.prefs.getCharPref("promptmethod");
			var alertsinfo = this.prefs.getBoolPref("alertsinfo");
			var pluginflash = this.prefs.getBoolPref("pluginflash");			

			//access preferences interface
			this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.flvideoreplacer.video.");

			//get video json from prefs
			var videodata = this.prefs.getCharPref(aBranch);

			//get localization
			var strbundle = document.getElementById("flvideoreplacerstrings");
			var embeddedstring = flvideoreplacerListener.sanitizeString(strbundle.getString("embedded"));
			var newtabstring = flvideoreplacerListener.sanitizeString(strbundle.getString("newtab"));
			var newwindowstring = flvideoreplacerListener.sanitizeString(strbundle.getString("newwindow"));
			var standalonestring = flvideoreplacerListener.sanitizeString(strbundle.getString("standalone"));

			//parse json
			jsonObjectLocal = JSON.parse(videodata);
			//declare video variables
			var sitename = flvideoreplacerListener.sanitizeString(jsonObjectLocal.sitename);
			var sitestring = flvideoreplacerListener.sanitizeString(jsonObjectLocal.sitestring);
			var videowidth = flvideoreplacerListener.sanitizeString(jsonObjectLocal.videowidth);
			var videoheight = flvideoreplacerListener.sanitizeString(jsonObjectLocal.videoheight);
			var videoelement = flvideoreplacerListener.sanitizeString(jsonObjectLocal.videoelement);
			var videourl = jsonObjectLocal.videourl;
			var newmimetype = flvideoreplacerListener.sanitizeString(jsonObjectLocal.videomime);
			var fmt = flvideoreplacerListener.sanitizeString(jsonObjectLocal.videofmt);

			var params, videoplayer, flvideoreplacer, childdivs, videodiv;

			//declare element to be replaced
			if(sourceurl.match(/youtube.*watch.*v\=/)){
				//declare element to be replaced
				try{
					doc.getElementById("flash-upgrade").hidden = true;
				}catch(e){
					//do nothing
				}
				videoplayer = doc.getElementById('movie_player');
				if(videoplayer == null){
					videoplayer = doc.getElementById('watch-player');
				}				
			}else if(sourceurl.match(/redtube\.com\/\d{1,8}/)){
				videoplayer = doc.getElementById("redtube_flv_player");
				if(videoplayer !== null){
					videoplayer.setAttribute('id',"redtube_flvideoreplacer");
					videoplayer = doc.getElementById(videoelement);
				}else{
					videoplayer = doc.getElementById(videoelement);
				}
			}else{
				videoplayer = doc.getElementById(videoelement);
			}
			//create injected script
			var script = doc.createElement('script');
			script.setAttribute("id", "fvrplaceholder");
			script.setAttribute("branch", aBranch);
			script.textContent = "function sendToFLV(){ " +
			"var method = document.getElementById(\"methodselector\").value; " +
			"var branch = document.getElementById(\"fvrplaceholder\").getAttribute(\"branch\"); " +
			"var element = document.createElement(\"FLVDataElement\"); " +
			"element.setAttribute(\"branch\", branch); " +
			"element.setAttribute(\"method\", method);  " +
			"document.documentElement.appendChild(element); " +
			"var evt = document.createEvent(\"Events\"); " +
			"evt.initEvent(\"FLVReplaceEvent\", true, false); " +
			"element.dispatchEvent(evt);}";
			doc.body.appendChild(script);
			//create the injected placeholder
			flvideoreplacer = doc.createElement('div');
			flvideoreplacer.setAttribute("id", videoelement);
			flvideoreplacer.setAttribute("style"," width:"+videowidth+";"+" height:"+videoheight+";"+" text-align:center; vertical-align:middle; ");
			//append innerHTML code
			if(replacemethod === "embedded"){
				flvideoreplacer.innerHTML = "<table><tr><td width=\""+videowidth+"\" height=\""+videoheight+"\" align=\"center\" valign=\"middle\"><img id=\"flvplaceholder\" src=\"data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%89%00%00%00%89%08%06%00%00%00%18%24%1B%C9%00%00%00%01sRGB%00%AE%CE%1C%E9%00%00%00%06bKGD%00%FF%00%FF%00%FF%A0%BD%A7%93%00%00%00%09pHYs%00%00%0B%13%00%00%0B%13%01%00%9A%9C%18%00%00%00%07tIME%07%DB%03%1C%10(5%FE%8A%1DB%00%00%20%00IDATx%DA%ED%5Dy%7CT%D5%F5%FF%9E%FB%DElY%26%7B%80%2C3%13%C2%26%B2%AF%82%E2%82%B8%02n%B5j%B5%24H%D5%BA%D4Vm%FBk%AD%DD%5DZ%AD%D5%D6%0DmUH%5C)%D6jQ%A1.%E0%82%3B%60%10%10A%203%93%B0%87%EC%CBl%EF%9D%DF%1F%F3%26%3CB%E6%BD%17%08%88m%CE%E73%1Fc%98%DCw%DF%BD%DF%7B%F6s.%D0G%7D%D4G%7D%D4G%7D%D4G%7D%D4G%7D%D4G%7D%D4G%7D%F4%3FA%F4%BF%F0%92%CF%94%96%8AH%24%92%22%84%18%01%60%2C%11%0Dc%E6b%00E%00%FA%03%C8%01%90%92%E4%CFU%22j%60%E6%BD%00v%00%08%00%08%10%D1%E7%CC%BCZ%92%A4%9D%DF%DD%B6-%DA%07%92o%18Ux%BDN%00%3Ef%9E%25%848IU%D5%B1D%E4%01%00%22%023%03%00%13%D1A%EF%CF%CC%E8%FAk%FD%EF8%FE%C7%FA%2FD%01%7C%06%6053%2F%05%F0%FE%DC%60%B0%BE%0F%24%C7%260r%00%9C%06%E0rf%9EJD%FD%12%7BLD%C4%CC%DD%82%E2PI%3F%5E7%C0Y%03%60%19%11%3D%AB%AA%EA%17s%83A%EE%03%C9%D7D%95%3E%9F%83%99%CF%06p%1D%80%93%01%B8%12%DC%22%B1%97_%C3%3B%B2%06%1C%D2%E6%B2%85%99%17%13QE%99%DF%BF%A9%0F%24G%8Fk%94%02%B8%11%C0%E5%00%F2t%07%9A%88%88%8F%B1%F7b%00%A4%89%B8%8F%98%F9%CFs%83%C1%17%FA%40r%84h%A1%C73%1E%C0%EDDt%16%11%89NT%F4%B2(%E9u%94%C4u%1ANp%17%00%BB%98%F9n!%C4%C3e~%7F%B4%0F%24%BD%C39F%03x%40%13)%9D%A7%F3%18%C6ER%B8%00D%F1%1F%88HP%8Bp8%EE%F8%EE%C6%8D%F7%F4%81%E4%D09G%0E%11%3D%09%E0%3CM%BE%F7%AA(%E9j%C9t%B1b%BA%FB9!%3Az%CE%B9X%D3%5D%89%C0Bb%08%89%20I%AC%DA%ED%84%B4%B4%C6%C2%13%A7%DC%7C%E6%BD%F7.%EC%03I%CF%B8%C7%AF%01%FC%AE%8B%22z(%2C%5E%1B%E2%00v%9F%A0%ED%00%FC%00v2%F3%3E!D%0B3%87%98%99%85%1023%A7%02%C8%04%90%AF%F9TJ%13%CA%B1%01hu%BFc%80)%FE%7FB%02l6%A8%92%0C%CAp%23%BD%B0%08Y%83%06r%B6%D7K%EE%82%02%96SSIJI%D9%DC%B1c%C7%85%A5%17_%FCE%1FH%8C%C11%16%C0%12%00%85%87%60%BEv%9E%F4%84%B2(%84%003%87%00%2C%07%F0%3E%80%8F%99%B9jn0%B8%EF0%E68%1C%C0D%00%93%01%9C%0A%E0%B8%83%E6AD%04%02d%1BX%B6%01%E9%A9%C8%19%3A%14%F9%23F%20%BB%D4%07gn%1E%EC%EE%0C%C8%A9%A9%90RR%20%3B%1C%20Yf!%CB%D4V%5B%7B%7F%CE%F1%C7%DF%D2%07%92%EE%17%FFn%00%FF%D7S%B1%D2%8Db%08%00%2B%01%2C%06%F0Jy%20%B0%ED(%98%E3%E70%F3l%10%5D%06%12Y%B0%3B%C0N%07%3B%0B%8A%A8%60%E2x.%1C9%92%9Cy%B9%B0gf%C2%96%91%01%D9%E5%82%ECp%40%D8l%20!%00I%8As%26%22%90%10%14il%AC%DD%F6%F2%CB%E7%1C%3Fo%DE%FA%3E%90%C4%C1Q%08%60%19%80%11%09%3F%83%19%E7%D0%5B6%BA%F7%F8%84%99%E7K%92%F4%DC%9C%EA%EA%F0%D7%A6KM%9E%3A%C1%D5%2Fo%CE%D0%B3%CF%9E%9B%3D%A8%D4%ED%C8%CA%863'%9B%A5%94%14%92%5D.%08Y%06%C9r%1C%1CD%10%89W%3D%F0%95Y%8DF%A9%EE%F3%CFo%EA%3Fq%E2_%FF%A7AR%E1%F5%9E%03%E0e%00rODJ%02'%00%9A%01%FC%8D%88%E6%97%F9%FD%DBp%8C%D1%9E%D5%AB%2F%92SS%7F%96VT4I%D8%ED%00%11%93%10%07%BDjW%259%A1L%81%88%9A%BE%FAji%D9%90!%B3%97%00%CA%FF%1CH*%7D%BE%3B%99%F9%17H%12G1%D27%88h%97%AA%AA%B73%F3%DF%AF%AC%A99%E6%7D%0D%1B%9ExbL%C1%B4i%BFO%F7%F9f%0BY%86%FE%9D%BB%8B%17ur%13f%82%AA%A2c%EF%DE%ED%FE%25KN%19q%CD5%5B%FF'%40%F2xA%01%D9l%B6%17%01%5C%A0-%96%95%B9%248G%03%80_E%22%91G%AF%DE%B9S%C17%8C%D6%3E%F8%E0%F1%DE%B3%CF%BE%C7%5DZz%AE%15%C5%5Ce%06%14%05%D1%B66n%AE%AE%8En%FF%F0%A33%C7%5E%7F%DD%3BGs%CE%E2k%E0%1Ev%9B%CD%F6%01%80%0B%88(%A1%7B%98%EA%1F%CC%0Cf%FE%0B%11%15%96%07%02%0F%7F%13%01%02%00%A3o%BCqC%E6%E0%C13%BF%7C%E2%89%A9%1D%7B%F7n%D1%BF%A3%A9%9CU%14%5B%7Du%F5%DB%0BG%8D%BB%E4%BF%16%24%0B%8A%8BS%98%F93%00'h%16%8C%99xI%AC%DD'D4tn0xs%99%DF%DF%81%FF%02%1A~%F5%D5%1F%A6%F6%EB7d%EF%9A5%3FQB!%D5%12%D7%D7%94%15%0A%B7%2F%AA%F0%F9%AE%3EZs%95%8F%26%40%84%10UD4%D8%CA%A9%D1N%17%01%B8%B9%3C%10%F8K%2F%2B%CBC%88h%A4%AA%AA%25D4%0C%80%17%C0%00%CDq%E6%D4t%9F%18%11%B5%02%A8%03P%03%A2%AD%ECJ%F9%0A%05E%9B%8E%1B%3B%EA%B3%C9%F7%DE%DB%DA%1Bs%C9%1F%3F%FE%CF%1F%FE%E2%17%8BG%DFt%D3%BF%5Cyy%E3%F4%96%5B%92U!%80%19%8C%BFUx%BDry%200%FF%BFB'%A9%F4%F9%EC%CC%FC%19%11%0D%D7%16%C0%F0%D9%1A%86v%10%D1%A9e~%FFW%BD%F0%FC%91%AA%AA%CE%24%A2s%01L%05%20%E9%AD%0A%9DE%A1%B76X%17%EE%07%1C.pN%16F%5D%F6%1D%F4%1F%3F%0E%CE%FE%FDw%0AIz%AD%7D%C7%8Ee%97M%9D%FA%AFwz%C1%F2%D8%5BUuW%CE%A8Q%B7%EA%DD%00%3A%9D%04M%5B%B7b%FDs%CF%A1v%C9%2B%40%A8%23%A1%C8%97%CF%0D%06%2B%BF%D1%20%D1%94%D4%0F%00%9C%60%A4%A4%26%C0%A3m%CC%92%F2%40%E0%BC%C3%E4%16C%01%5C%03%60%1E3g%26%0Ef%8F%1Cu%89x%9C%DD%09%CA%CB%C3%98%2B%CB%91%3Fj%14R%8B%8B%D9%EEv%93%B0%DB!%24%09J%24%82%8E%3D%7BV%86%EB%EB%1F%CD%1B3%E6%99%C3%99w%F5%92%25%D3%8AN%3F%7D%B9%E4tJ%DD%83%E4y%D4.Y%02%0A%85%C0%E8%B4%F4f%97%F9%FD%AF%7Ccu%12%CD%8A9%81%88%ACp%10%02p%F7%E1%00%A4%C2%EB%BD%AC%C2%EB%DDHD_%02%B8%05%40f%E2%D9%3D%F3%E4%26%00%E2%80%D4%AF%1F%C6%CD%9D%8B%BC%B1c%90%E6%F5%C2%91%91A%92%DD%0E%8A%BB%FC!%D9%ED%9C%5E%5C%7CR%EE%E8%D1OG%DB%DB%B9%7D%CF%9E%F9o_%7F%7D%C1%A1%CC%BFd%F6%EC%F7%D6%3D%F2Hi%B4%A5e%9F%8E%AD%F2%81%AAZ'%B7K%18G%2F%2F%F4x%C6%7D%23AR%E9%F3%DD%99%B0b%B4%CD%A1d%D6%8B%F6os%CB%03%81%9F%1F%E2%B3~T%E1%F5%B6%02x%0E%C0%D0%84%98%D0YP%3D%E3%9C%1C%07%08rs1j%CEw%913f%14%D2%8B%8Aaw%BB!%ECv%40%88%83%C6gf%96%5D.8%F3%F2%BE%7F%CA%C3%0Foo%DB%B5k%E9%A7w%DC1%A8%A7%EF2%EE'%3F%09%FEc%D4%A8%E2%B6%1D%3B%D6%92%10t%10%3A%BA%88f%0D%2C%EF-%F4x2%BFQ%20%A9%F0z%CFI8%CA%2C%98%B7DD%E7%97%07%02%15%87%F0%9C%2B*%BC%DE%06f%FE%0B%B4%8C%F7%C3O4%E1x%60.%DD%8D%11%97%5D%86%BC1%A3%91%E6%F1%C0%96%9E%DE%E9N%D7%01%E4%80%93%DD)%A6%00%B8%F2%F3%CF%9Ap%DBm_5%07%02%FF%7C%F9%AC%B3z%B4%81s%02%81%D0%B5%85%85%E3Z%FC%FE%F7u%0F9h-u.%04%17%11%BD%F5%8D%01%89%16%8ByY%A7%83%98%01df%99%DF%FF%EF%9E%3Cc%A1%C73%AC%C2%EB%FD%8C%99%9F%26%A2%0C%1D%FB%3DL%7C0%20d(%A9)%18z%FE%F9%E8%3F~%3C%D2%8A%8B%E1HO%87%A4%05%E3%0C%3C%A4%E8%0ARf%E6%B4%E2%E2%0Bg%BE%F4R%C3%EEU%ABn%ED%C9T%9E%06%D4%11%25%25%D3Z%02%81%F7H%08bfp%02(%D4%ED3%C7-%F4x%1E%FB%A6p%92e%D8%1F%8B%A1%24%E0%60%00%24%848%BF%3C%10x%AD%87%A2%E5%D7D%B4%11%C0haa%D3%0CD%9C%DE%9A%D2%00%22%C0N'%06L%9B%86%A2%93%A6%22%CDS%0CGF%06%C8fc%8AGj!%84%B5e%23%1D%09%87%83%F3%C7%8F%BF%ABm%F7%EE%8Dk%1Fx%60%B8%D5y%D6%00%3C%AD%B4%F4%D4%8E%BA%BAO%A0*%14%D7%DB8%B9%90%24%BAF%8B%87%1D%BB%20%D1%C2%FD%23%8C%8E%B4NG%99%DB%13%0ER%E9%F3eW%FA%7Ck%98%F9w%9A2J%3D%10%2F%AC%F7%DEj%E6%23%989%06%6073%7F%05%A2%B5lw%7C%922%7C%F8%C7%83O%9F%BE%DA%96%91%F9%05%2BJ0%DA%DE%DE%9C%E0R%07%04%DF%0E%81%5CyyC%8F%BF%E6%9A%0D%B5%EF%BCs%9D%D5%BFY%07%A8%0F%0E%1Cxb%B4%B5m%2BG%A2l%2C%C0%C1%00%5E%AE%F0z%D3%8EI%13XK%18Z%03%93%80%9D%B6%C6w%F7DI%5D%E8%F1%9CIDK%00%D8%B4%B1%ADX*%09_%87%FE%BB%01%00%AB%01%AC%00%F0%11%80%DDB%88%869%D5%D5%DD%3A%C7*%8A%8B%E5A%97%5D%96%E9%CC%C9%C9%C9%18%3Cx%B0%7B%E0%C0%E9)%F9%F9S%1C%99%99%E3%E5%94%14%DB%A1%A42%26%FE%A6a%D3%A6%7F%FFv%D8%B0%8B%1E%B0%E8c%D9%F3%F1%A7%99%AB%1E%9D%BF%7D%EF%BB%EF%BA%10%8B!%9E%D5%94%94K%BEW%1E%08%9Cr%2C%82%A4%96%88%0A%12%1A%B7%01%40z%E4%07%A9%F0z%AF%07%F00%ACE%8B%BB%86%DB%89%99%B7%12%D1b%00%15D%B4%B572%D4%DF%9A7%2F%DB%3Bs%E6)%FD%26O%FE%9E%2B7w%A6%E4p%C0(%7B%FF%00%E6%C3%CC*3%08%A0%F6%5D%BB%BEXu%C7%1D%93O%7B%F4QK%1E%DC%8A)'%8E%E0%9D%3B%D6%090%9B9%24%89%E8%8A2%BF%FF%D9c%06%24%89%9CT%23%06%A2M~gy%20P%D8%83q%EF%00p%9B.%D6c%1A%0CL%F8%5C%88h%19%80%DF%95%07%02%1F%1DIS%7F%C9%D9gg%9Cx%FF%FD%3FH%1D0%E0%C7%F6%8C%8C%2C%23%9003XU%C1%8A%02%25%1CF%B4%AD%0D%1D%7B%F6%EC%B6%BB%5C%232%87%0E%AD%B3%B4%26%3E%DFw%C1%FC%941%B3f%00%88*%8A%92%3A%AF%B66%F6%B5%83D%CBj%AF39%E9%89%B5%1Bb%D5%D5%5E%E9%F3%DD%CF%CC7%C1B%3AA%97%14%C6%25DtC%99%DF_%83%A3L%FB6l%F8~%BA%C7s%AF---%A1%13%B0%AA%AADDqp%A8*%D4H%04%91%96%16%84%F6%EDC%C7%CE%5D%A8%DF%F2%15%82%1F%7D%DC%BC%AB%AAj%F0%D5k%AB%F6X%3C%3C%CF%03%B84%D9r%EB8WEy%200%F7k%07I%85%D7%FB2%80%F3L%CC%5D%A0%07%C1%BA%04%07%B1%A0%DF%24X%3C%98%D9%2F%848%BF%CC%EF%FF%1C_3%D5o%DCxW%C6%A0A%B7%92%241%00R%15%05%AC(%88%B5%B7%23%5C_%8F%B6%1D%3B%B0o%FDzlY%F167m%FA%12%22%12%25D%22%8DBQJ%E6%04%FC%8Df%E3%3F%3Fd%88%14%0E%87%EB%00d%24S%DEuN%CA%C1%E5%81%C0%96%AF%0D%24Z%E1TUB%070%98%EC'%E5%81%C0%09%BD%A8%83t%CDT%FBM%99%DF%FF%7B%1CC%B4%E6%EE%BB%0B%8E%BB%EA%AA%95%F6%CC%CC%125%12%E6Hs%0B%B5%EF%DA%85%96%EAjl%5C%BA%14%7BV%AD%82%D4%D6%06%84%C2%DAk0%01%08%08!%86%CD%A9%AE%0EYX%A7i%00%DE5Z'%EDp.%2F%0F%04N%FF%3AA%F2%0E%80%93%93%CDQ'%0A%86Z%113%9A%15%F3%1F%23%1DDg%82%12%80Vf%1E%3F7%18%DC%8Cc%94%F6~%BE%F6%11Wn%DEu%AD%C1%1A%AE%5B%BF%8E%AA%16-%82%B2c'%A8%A3%03P%14t%C6%89%F6o%EA%87%E5%81%C0T%8B%EB%FF%0C%E25%D1%DD%FA%8At%9Cvby%20%B0%EA%A8%FBI%B4%DA%DC%93%0D%12%88%88%99%89%99%FFj%05%20%95%3E_%B6f%E6%1A)%A9z%FD%E4C%22%CA%3B%96%01%02%00y%A3F_%BFo%ED%DA%CB%AB%DFy%9B%3E%7D%ECo%AC%D6%D4%82%DAZ%E3%00!%1C%90%25%AF%BD%DB%94%0A%AF%F7~%8B%0E%BB%1F%01%08ik%D6%AD%DB%5E%3B%A4%7F%FAZ8%C9B%8F%E75%22%3A'9%A7c%00h%24%A2B%2B%19e%9A%A3l%8C%89%F2%9B%98%F7%E2%F2%40%E0%B0%D2%F8%EE.%1D%EA8%E7%A6%1Br%5DEE%E3%DD%C5%C5%C7%A5%0C((%92%1C%0E%17%98%89%84P%3A%EA%EA%EAZkj%B65~%F9e%D5W%CF%3D%B7%E9%5B%EF%BF%DFr8%CF%FB%DB%A8%D1%13%1D%1D%1D%2B%11%89%D8%92%F98p%60%EB%8A%F3%CA%03%81%25%16%F6%E1gD%F4G%03%256%A1%9B%8C*%0F%04%D6%1D5%90h%ED%1F6'%BC%CF%06%F2%F0%07%E5%81%C0%C3%16%00%F2k%CD%93j%A4%A0%26%16%EF%E9%F2%40%60%CE%A1%CC%FB)_I%A6%0A%9A%C5ii%97zg%9E3y%E8%ECYy%19C%86%C6%5D%EF%B2%DCY%F3%DB%F5%9D%94H%04%A1%BA%BA%AAHK%CB%0A%FF%AB%AF%3E9%EE%C7%3F%3E%A4%A2%A9%85%DE%92Q%04%F5c%00%0E%13%7D%0B%CC%DC%A2%AAj%E1%9555%86%3E%94%05%C5%C56!D%0D%E2%E5%A8%C9%94X%00x%BE%3C%10%F8%CE%D1%1477%12%910%D0%19%98%88vE%22%91G-%9C%84a%09W%3B%BA%0FL%E8O%D7%E2C%01H%85%D7%7B%7C%85%D7%FB%9C%CA%EA.%C8%D2Srn%F6L%CF%09%93rS%06%14%40NI%E1D%E8%3F%D9%22Kv%3BR%06%0C%18%9D5t%E8%CDco%B9e%5D%EB%8E%1D%1Bj%DE%7C%F3%AA%E7G%8F%B6%F7d%1Es%03%D5%9F%03%98%02%401p%EF'b%5En!%C4Sfcj%25%25%BF1%3A%B0%DA%1A%5E%B8%D0%E3%C9%3B*%20%A9%F4%F9%1C%88%B7%9D%EA6%CA%AB%C9ARU%F5v%2BY%EDD%F4%9C%CEuN%06%8B%F6aOE%CCB%8F%A7%B8%C2%EB%FD7%80%F5%00.%23%12vv%B8%E0%3B%F9%14%A4%14%7B%C8%9E%91%01%C9%16%F7%F4%F7%24%BA%9B%D2%BF%FFqE%A7%9F%FE%F7%F3%DFz%2BX%BB%7C%F9U%3D%99Sy%20P%C5%CCga%7F%91%19%1Bl%EC%05%0B%3D%9E%E9fc*%8A%F28%80%3D%C9t%13%EDY%0E!%C4%E5G%05%24Z%0B%AA%3C2VF%9A%99%F9%EF%16N%F8%15Fz%88.b%DCJD%D3%7B%C8%3Dn%23%A2%00%80%D9%09%FB%12%B2%8D%1C%03%06%A0p%C2%04J%C9%CD%83%9C%92%02h%E5%96%5D%F3%5C%AD%90%23%3B%3B%BF%E0%B4%D3%FE%DE%5CS%B3%E1%B3%FB%EF%F7Y%E6(%C1%E0r%22%BAM3%3E(%09(%01%80%85%10%A69%AC%F3jk%15%00%F7j%86%02u3%16k%CE%C6%EB%8E%0AH%00%5C%97%2C%1A%AAS%2C%FFf%B1%B2%EE!!D%D2%D3%94H7%60%E6%F1e~%7F%C8%22%A7K%AF%F0z%D7%01%B8%23%B1%D8%14%8F%F1C%B5%DB%E09%E9D%A4%16%0C%80%CD%ED%06IR%D2%24%22%13%EE%A7ol%82%D4%01%03%8E%1B~%D5U%D5%3B%DE%7F%FFz%AB%8BX%E6%F7%DF%05%E0U%BDH%ED%E61%C4%CC%85%9A%EF%C8lN%8F%01%88%19p%12%020t%A1%C73%F2%88%82D%EBrxr2%07N%C2%1C%26%A2%F9%166%F3G%002%93%9D%26%CD%8B%0A%22%FA%8DU3%B7%D2%E7%2Ba%E6%ED%00%8E%3F%C04g%06d%3B%5C%03%0AP0~%2C%9C%B9%B9%F1v%0F%92%84d%3E%06%AB%CA%3F3C%8D%C5H%09%85X%D8l%0F%7F%F8%87%3FX.sPU%F5%22%AD5FR%C6%AD%BD%C7%3D%16%40%D7%8Cx'%05%EA%EE%CC%E9%CA%8B%CB%8F4'9%0D%80%AB%3B%96%86%FD%A1%F9O%AC%14o3%F3%9D0%C8%5E%D3%D8%A3%DF%AA'u%A1%C73%96%99%B7%01HKp%20%DA%AF%8DB%95e%14N%9D%8A%94%82%02%D8%DCn%08Y%86%D0%B8HO%C5L%02%C0%DANC%0DG%D0%5E%B7%17%F5%9B%BE%E4%8D%2F%BD%7Cm%C5%A0!%AFZ%19%E7%CA%9A%9A%08%11%7D%2B%C9z%EA9%40%EAB%8F%E7z%0B%F3%9A%9F%0C%F4%BAd%F0%99O%95%94%D0%91%04%C9%E5z%8E%D1%9DI%9D%98%A8%09G%BA%0C%40*%0C%92%A3%99%99%84%10%E7%5B%E5%20D%B4F%9F%8Ct%20%17%B1%C1%9E%9F%8F%01cG%C3%99%9D%CDR%9C%8BpBYM%00EUU%A8Z%20.%99%93%A6kDW%89F%11imF%C7%F6%ED%B4%F1%95W!773b%91s%2B%BC%DE%C5%16%C5%CEk%00V%1A%253i%EFezX%E6%06%83%EF%01%A8%D7%E9r%DD%ED%D10EQ%7CG%04%24%15%5E%AFSk%A4k%E8.%97%24%E99%0B%C3%FD%26%19%17%D1%BD%DB%12%2B%C1%BAJ%9F%2F%9D%99%D7%22i%22%12%81%25%09%FD%C7%8D%E5%94%82%02%D8%D2%D3!%ECv%A8%D1(%B5%06%83%AF%B7%04%83%3FX%3F%7F%FE%B8%3F%0A%E1%92%24%89%24I%22!I%F4%EE%0F~P%18%7C%FD%F5%F3%DA%F7%EC%F9KG%5D%5D%1D%98%13'c%7F%EA%A3%AAB%E9%E8%40%FB%EE%BD%D8%FEY%15Z6~I%08%87%13%2Fqq%85%D7%7B%BBE%CE%F4%DD%84%B5%93%E4%DF%09%40N%A5%CFw%86%85%E1%16%243%87u%FD%C1%CE%3FR%9C%C4%A7%EB%B4%9CLa%5Di%D6%40%A6%C2%EB%1DJD%C3%8C%B4zMO%B9%C1%E2%02%7F%A0%1318%88%8BH%12%90%99%89%FEcG%C3%95%93%03%B0%DA%D2%B8q%E3O%EF%18%3F%DE%E1%F6%F9%FE%2F%DD%E3%11%23%AE%BB%EE%A6%5B%99%172%F3%A7%CC%BC%8E%99%DF%3C%F9%A1%87%EE%F6%9Cy%E6%E9)%F9%F9%1F%B9rs%87oY%BCxJ%8B%DF%FF%06%E2%16%04%83%19j4%CA%E1%E6ftl%DF%8Emo%BC%05%D1%11%02%D4%18%E9X%FB%2F%2B%7D%BE%99%168%40%80%88%5E%D4%C4%18'%B3t%98%F9'%16%D6cq2e8Q%AB%03%E0%AC%23%02%12f%9Ee%F0%F0%C4%BBYa%B1%D7%18p%D6D%0A%FD2%2B%F9%20%15%5E%EFm%88%E7%D4%26%E3%D3%60%D9%86%CC!%839s%E0%40%0A77%FF%A95%1C%19%913rd%C7o7lx%16%C0%A3%88w%94%9E%0E%60%1A%E2%CD%F3%3C%00Fk%FA%D7%F9%00n%05%B0x%F0%A5%97~%C7%ED%F3%FDr%EB%E2%C5%13Cuu%B5%60F%AC%A3%03%A1%3D%7Bx%DB%CA%F7%10%DD%BE%1D%88F%BA%EA%12%AC%AA%EAS%15%5Eo%AA%85%F5%BD%D5%C8!%A6%FD%FE%CC%0A%AFW6%01%DC%C7%00%22%C9%F4%1C%ED%00NZP%5C%EC%E8u%90%08!NJ%C6%D2%13M%EC%00X)7%9Cg%B0P%89%C5%FD%9D%15G%19%80%DB%91%ACs%033%98%04T%A7%93%8B'NlV%C2%E1Iyc%C7~%90WX%F8%5B%00%D7%028%1D%C0Hf.%60%E6Tfv%C63%0B9%A2%F9%1BR%989%93%99K%00L%02p%11%80%3B%07%5Dz%E9%0C%5BV%D6%19%F5%1B7%3E%11mi%A1%D6%9A%1A%D4%7C%F4%11S%B8%03%DDd%15%12%11e%010%D5%D3%CA%03%81%CD%00%3E0q%AE%81%99%AF%B0%60%0E%BFf%F0o%60%E6l!DA%AF%82%E4%99%D2R%A1%DD%F6%40%06%A6%60%C8%AC%89%5D%A5%CF7%92%993%91%BC.%80%99y%AB%95%94C%22z%18%BA%CA%85nu4I%E2%D4%12%DF%DE%C1%E7%CE%1CW4%FD%F4%E3%89%E8%16%00%171%B3%8F%99%15f%EE%40%FC%A6%09%05%80%AA%9B%17k%BF%8Bi%A7%B2M%03%D2%C9%00%AE%95e%F9G%19%C3%86%3D%D9R%ED%BF%3D%B0f%0D%A1%BE%01%AC(%DC)%E2%B4%CF%FE%5E%9D%98S%E1%F1%1Coa%A9%1FD%F2%98Z%A2%3A%C0%8A%D7t%99%11%AB%D6~%3C%A5WA%12%89DR%88%C8c%E0%F4b%C4%DB%60%9A%F9%05fv)%BD%ECzRHKZ6%8D%C5%24%3C%A9%C9%1D%0C%608%5D%CD%DE%2B.%3F%D1%E5%F3N%07%F0%2Bf%1E%C5%CC*%F6%87%D7%7BB%0A%80%26f%CE%22%A2KeY%BE%AD%FF%C9%D3%5E%DD%13%AC%BD%17%90%08%92-%EE%BD%95%A4%F8G%C4%3F%24%24%82%90%00%C9%F6G%0B%EB%F3*%00%23%9D%8E%01%9CiAt%BDm%E4%08L%A4%24%F4*H%B4%0B%85%8C%B2%E0%09%F1%3E%A9f%A7%FF%5C%23%0Fc%02%03%16%A6%F4%CBd%F3I%B4E%82%90%C8%3D%7C%C4%AC%09%DF%FA%D6(%22%BAKU%D5%0Cf%8Ej%22%05%87%F8!f%8E%A8%AAJ%CC%3C%09%C0%5D%DFz%F2%F1%87R%8E%1B%F6%B6k%C8%10r%0D%1B%0A%E7%D0%F8%C75d%18%9CC%B4%9F%87%0Ea%D7%B0!%B3%96%DCt%8B%CF%C4o%D2%02%60%B9%89%07%1A%95%3E%DF%09%26%A2k%93%09%88%18%07%F7%9F%ED%96z%D2%C4f%AC%05%AF%E4%C7%16%C6%99%9A%AC%BA_%9Bx%90%88%B6%9A%88%ACLf%BE0%D98%89D%1B%D8%EC%7F%3A%F7%A9%05)%CC%7C%A7%AE%9Dgo%91%A2m%D8%08!%C4og%3Ep%FF%D5%7B%AB%AA%D6%A9J%D4%C1%F1d%11%22%AD%E4Gk%0AM%DA%D3o%C0_%EE%FB%A9%C9%D8%FF%04p%8E%C9%26OE%BCn%C8%88%D6%23%DE%F6%14I%D6hX%AF%82D%BB%92%0C%26%C9%CEU%26%22b%08t%0Dd%92p%92%D5fu1%9A%95%E50%94%B7Bj%B9%A4%EA%B3%A7eY%FE%11%80%01%CC%1C5%10%93%04f%A7%AA%AAJ%22%FD%81%99U%10E%8D%DAviV%98%60%E6Y%CE%FC%FC%FF%B8%F2%F3oO%19%D0%FFN%18Xn%91%E6%E6%0B*%8A%3C%B7%96%D7%06c%06k%BD%3Ca%0AwS%9A%91HG%9Cba%CF%3Ec%E6%E3%0D%FC%25y%95%3E%9F%5C%E6%F7%C7zE%DChw%D6%B1%89%E9%B5%CFd%D2%23-(S%2B%2CL%E7R%24%09%B1%C7%17%84%09B%BA%DDn%B7Mf%E6%99%9A%82%9AT%84(%B1%98%AB%AD%A5%25M%92%E5%0CI%96%D3I%884%12%C2%0D%E6%1CUQ2TE%11%C9%FEVUU0%B3%A4%AA%EAU%99%23F%FC%5Bv8%DB%9D9y%AC%7D%D0%E5C%19%83%06%0F%1Av%F5%F7%7C%26%EB%B4%0B%C0%F6%24%B1%B1%84%F2%3A%C9%82~%B3!%99%12%AC%1B%BB%B87M%E0%22%93%0C%B4%ED%16%26%5Db%A4Li%3F~d%22j%1C%00%26'S~%E3%C0!%7C%7B%D5'%2BTU%3D%99%99%DDF%3A%88%AA(%99%20Je%00%7F%BA%E7%1E%AC%FA%F4S(%B1X%A7%8F%05D6%00%D9%AA%A2%D8%0D%80%A6%00%18%0B%60J%B4%BD%FDqa%B7%91%B0%C9%24l2%0E%FAH%12%0AO%3Bm%96%D1%3B%CE%A9%AE%EE%00%E0O%26%1E%B5g%F6%B7%C0I%AC%F4%7C%F5%F5%26H%FA%1B%D9%DD%88%DF%F6%60*%B2L%F4%9A%18%80%DD%26%1C-%17%40%9E%E1%09%91%A4%D7%E5%D4%D4%C9%AA%AANVU5%AC%9D%F6d%00%B1%25%7C%3C%ABV%AD%C2%23%8F%3C%82%A5K%97%A2%B9%A9%09%B2%2CCk%F7%00%10%B9UE%91%0D8%8A%83%99%A7%B4%ED%D8%B1%02%BAxP%D7%0F3s%E6%E0%C1'YX%EF%2F%0D%DE%11%00%24%AD%C5%87%D1Z%05%2C%3C%C7%B4%9A%B2'%8Ak%8E%C9%BF%EF%B40%867%99%5E%A3%1D%9A%7DB%88%06%93%17%1F%AF%BF%7B%A6%DBq%18%FF%060%94%99%8B%00%B4u%3B%8E%AA%BA(~%5DIg%AC%A8_~%3E%DEZ%BE%1C%1D%ED%EDhnj%C2%C4I%930t%D80%C4b1%A8%F1%80_%063%EFK2%AF%08%11%8D%CB%19%3B%F6%C5hkk%CC%9E%9E.'%0B%5D%B0%A2%0C%B1%08%12%23%92%88h%80%11%07'%22%D3%3Da%E6%FC%DE%E4%24)%26%0F%B3r5%C8%00%83%B4%00%00hNV%DD%AF%FB%DEq%5D%CC%E5%83%F9%E7%25%DF%DE%C4%CCy%86%EFGt%D0%FB%D8l6%14%14%14%A0%B6%B6%16O%3D%FD4%16%2F%5E%8C%BD%BBw%83%15%25%EEc%17%82XU%9D%C9%A4)%80A%CC%5C%18nl%5C%99%04%20%F1%DDu%3A%BC%0F%10%ECf%5C%C0%825%99c%22%DE%AD%ECIV%AF%BA%E5%0D%5E%08B%08%2B%E5%06%99FV(%11%B5%5B%D1%8D%0C%FDL%92%8CQ%B7%DC%D2%A1%F9D%94%24bF%C6%FE%FE%24%F1%0D%24%82l%B3%C1%E9t%22''%07%19n7%3E%5B%B3%06%BF%FC%D5%AF%B0e%CB%16%B4%B5%B6BQ%14%00p%24%119%AC%AA%AA%5DQ%94%5C9%25%E5%CBd%0E%20V%15H).%B7%DD%E5%92L%0EC%9D%85uw%9B%F8%5C%3AL%9E%C1D%94zT%40%A2%C9Z%2B%A9%85N%93%97%B6r%FD%88%2B%B9%95E%20%D9%06WFF%86%C6%F9%92)%AC%07%E8%16%09%93U%92%248%1D%0E%B8%5C.%A4%A5%A5!%2B%2B%0B%A1%8E%0E%DCq%C7%1Dx%F7%BD%F7%D0%DC%D4%94%10%D1%DD%8E%ABq%93T%5BzzcW%17%A9%16t%81%AA*%20IBZa%A1%19H%C2%16%DC%3A%8E%C3%DD%3AU5oF%DD%9B%1D%A1%D9%1A%9E%E8%B0%C7%E8%5E%D40%18%02%88%F7%09%91%8C%16%20%B1a%5D%7F'I%12l6%1B%ECv%3B%9CN'%84%10%90e%19%ED%ED%EDX%B8p!%1A%1B%1A0%7D%FAt%CA%EF%D7%CF%11S%D5H%12%91g%03%91%D2%05%FDq%EF%9B%1A%D3%89%1C%A7%A5%16%1A%06%D6d%AF%1Cr%B1%BF%BB%E3%91%05%89%A6%8C%CA%16%BE%173%E9%A5je%0C%A5%5B%A01%81l2%E4%BC%5C%00%88%A9%AA%CA%5Du%01%9D%D2%AA%A2%9B%BEgB%EB%87%26I%12%24I%82%10%02%8A%A2%C0n%B7%E3%F2%F3%CE%C3%A8%91%23%91%9E%96%A6*%8A%12%EB.%0C%AFe%D2%C5%D4p%D8%05%9B%AD%CB3%15%80%D5%F8%AB%13%A1%7D%FBN%B3%23%2C%19%E9o%DA%9AG%0Fs%DF%D8%CA%C1%EC%15%90h%93N%B5%F0%BDVf%CE7%E0%26.%0B%C8%AF%3Bx%E35%A7%A9lC%FF1c%D0%BE%7B%B7l%CF%C9%09u%BA%E7%0F%FEv%F4%20%AFh%17%D1%11%89D%20%88%90%DF%AF%1F%CE%3A%EB%2C%8C%181%02%0E%A7%131E%89(q%16%D5%9D%A3KRU%B5Mmn%1Eh%D7%DA%93%ECOuT%11w%E6%02%B1%F6v5%D2%D1fV%8F%94n%A1a%A0%A1%0E%F7xA%81%19%E7%26%222mp%D3%13ve%86%7C%2B%7DJ%CD%94%B14%B3%84%1A-%D1%19%DD%C8%0ApZ%1A%0A%C6%8DE%AC%B99%87%99%9B%99YN%EA%8A%D7%DC%F4%9D%19%F9%CCP%99%11S%14%B4%B4%B4%C0%E1p%60%CC%D8%B18%FD%F4%D31%F5%A4%93%E0LIALQ%A0*J%BBA2O%98%99%EB%19%18%7F%E0%EF%D5%03%1A%3BGZZv%B4v%84%CC%B8%80%95%5C%0F%C3%3E%26v%BB%3D%CBL%AFQU%B5%B9%D78%09%1150s%8E%81%8F%23%DF%C205%26%EE%E4L%22%CA4%01SU7%93%03%CB6d%0F%19%8C%D4%C2%02%D8%5D%CE%D1%88W%B3%C5t%8D%F5%BA%CE%B9%85%80%EC%CE%FE%BCDPb1%B4%B7%B5!%2F%2F%0F%13%26L%C0%8C%193%D0%AF%7F%7F%B4%B6%B6%C6%07P%D5%10%88%D4%24bL%10Qm%24%14%DA%9B%99%9F_%AA%BF%1BPUb%00%03q%01%A8%B2%1A%8Dl%F9%A9y3%BDA%16%A4%C5n%93%EF%E4%5B%E1%CC%BD%C6I%98y%AF%89%8F%A3%C8%C20%5B%93%E9%09%DAF%BA%999%C7%04%AC%9B%BA%135%AA%D3%89%C2I%13%E0%CA%CB%83%E4J%F9%AE%10b%133%EFD%92%80b%BC%B7%3F%1Fp%8A%3AB!%A4%BB%DD%B8%F0%C2%0Bq%F1%C5%17%23%2B%3B%1B%1D%A1P%02%20%0A%E2W%9B%24%3D%B8%00%3E%15mm%83%B5%EB%D341%ACBe%05*T0TfbR%A2Q%2B%95%FDf%09J1%98%84B4g%A2%19%ED%EC5%90%00%D8ab%95%94Z%00%DAW%06r6%91%E9%3B%D8h%8C2%BF%BFE%E3%26%9CPXa%B7%23%A5%A0%00y%C7%1D%07GF%26%A7%E4%E6%E5%B6n%DB%16%02%B0%16%80%CD%00p%11fn%88%9BF%8C%B6%B66%FC%FC%E7%3F%C7%EC%F3%CF%07%88%10%D3%AC%23V%94%10%88%1AL%C0%2BTU%7DW%00%E7i%2C%84%12%25%17%C4%02%C4%04b%22%01%09u%1F%7F%BA%D4%C2z%0FD%F2%CCy%06%10.%0F%04ZL%E64%D0%A4%1D%05%98%B9%A67A%120%A9%82%B7%A2tn2%E0%24%89%EFX%A9%F7%5D%D1%A9%17%10%81m6%0C%98%3C1%5E%95%97%96F%90%04%5C%E9%E9%970%F3%0A%CD%7FC%C9b.%9A%25T%1F%8B%C5%D4%DF%FF%F6%B7%EC%F5x%B8%AD%B5%15J%2C%A6%B0%A2%84%94X%AC%01q%85%1B%06c%90%AA%AAk%DA%B7mkH%2B*%9A%0C-%F5%0D%CC%40%0C%90T%09%12%CB%10%AA%C4%DC%16V%BEZ%F4%C2%07F%2FW%E9%F3%E5%02(5J%88ff%2B%AD%2F%06%9B%25%2F%25%B8%7B%AF%81%04%C6%B7L%24n%DENJ%8A%A2%7C%D6%A98%26%97%B3S%2Cp%A4'%3B%F9%97l%83%C8%C9E%D1%981p%E4%E4%40%B2%DBAD%9C%EE%F1%9C%D1%5E%5D%DD%08%E0%0D-%A19Y%60.%DE%B2Q%92%9A%DCYY%8DB%96%EB%15U%ADS%81%06%06ZA%A4%98%00%04%CC%ECb%E6%C7S%B2%B3o%D1%3C%BA%04EA%2C%12C%8C%19QV%11Q%15%8E%B1%8A%B6%C6%86%E5%B3_%F9w%93%C9%FB%0D3r%3Cj%DC%F8%03%0B%EB4%DA%C4%BC9H%E4%1E%16H%88%E8%F3dN%1E%DDD%26%9A%B8%89%5B%99yg2%EB%40%CB%BD%1C%BF%A0%B88%DBh%9C%B9%C1%E0z%00_0%81%D9f%E3%C2%13%26%23%A5%A0%00%F6%F4x%E9%26%09AL%C4%EE%01%03%FE%C0%CC%CF2s%B5%99%1F%87%88b%9A%FF%A3'%D9kB%D3y%16%87%FD%FE%5CGV%D6%09%D1%D6V%8E%B6%B6%22%DC%D2%82Pk%13BmM%08%B75%23%D2%D6D%91%8EV%DA%BBf%F5%C3%16%C6%BD8%D9Z%EB%8A%AB%3E%B10%CED%13%3F%C8%A6%B9%C1%60%EF%F9I%98y%B5%91%CBT%CB%0E%9C%0C%93%FCT-%D5%FF%7B%06%D1%60%9B%24I%A7%00%F8%97%89%DB%F5~%96m%7F%97%F2%F2%E0%9D4%09%AE%FC%7CHNg%FC%D6n%CD%D4H%C9%CF%2F%DE%BB~%FD%C5RA%C1%7CI%92%FE%0F%40%3A%F67%8F%E9%0C%A7%E8%8A%DC%0F%D8%98D%91%98%AE%C3%B4%FEo%12%EE%F9%D5%B1%FA%7D%2F%A8%E1%F0%0BM%9B%BE%E4%F8%1D%06%04%8EF%F5%96%9F%96p%40%DBW%94%CF%B3R%23%7C%06%0C%3A*js1L%3A%7F%AA%A4%C4%A6%AAj%A6%89%23m%A3%95%BD%B7%0C%12I%92v*%8A%125P%04%09%C0%A9%16%86Z%06%E0%7B%26E%E2%DF3%03%09X%AAd%BB%FD%8E%FE'L%CEO%F3%14%C3%96%9EN%C2f%D3%F7%19afF%EE%88%11e%81%95%2Bw%BB%06%0F%5E%24%CB%F2%F9%92%24%E5j%0Dv%8C%0A%CC%08%F1%BE%20%9C%E8%F7%A1%2F*%17%F1%14%83%88%A2(U%FBv%EE%7C6PQ%B1%80c1%3B%18%04A%8856%82%23%91%84w%17%00%88U%15%F6%AC%AC%BB%BF%DF%DA%183%D1G%862%F3p%93N%8A%B5%E5%81%C0%5E%13%FF%C7%F4%03%CC%BF%EE%F7k%5D%AF%82%E4%BB%DB%B6E%B5%FBe%26%1A%C89%D3%ECkY%96%FF%15%8B%C5%8Cn%AC%24%003%17z%3C%19s%83%C1%A4%B2%BB%2C%B8-%F2%D4%B7%BE%FD%CB%E2%F1%E3%FE%EE%C8%CD%85-%25%25%0E%90%FDW%9B%103s4%12%E1%FE%13%26%FC%F4%ABw%DEy%C8%E6%F5%FE%DB%EDv%9Fc%B3%D9%06%10%91%AC%AA*b%B1%98%A4%AA%AA%D0%15%8EwN-%D1%9E%8B4%DF%88%14%BF%CADU%14%25%14%0E%87%AB%AA%3F%FA%E8_%FE_%FD%FA%9E%98%12%CB%11%20%12%89%06%06a%7D%AC%93%12iK%DB%C5%F6%ED%F3-p%EC%1B%92%F5%C4%D5y%90%9F%B70%CEt%ADX%CEH'y%DB%AAL%ED%09%AD6y(*%7D%3E%C3%2C%EF%2B%B6nU%98y%A5%D98D%14%C4r%97%00%00%13GIDAT%F4%03%B3%C9%CC%F9%E7%E2%C73%07%96%7Caw%BB%19%DA%5D4%3A%BF%0D4%8E%81h4%CA%FD%C6%8E%FDA%C7%AE%5DS%3Fz%F7%DD%E7%1B%1A%1A%B6E%22%115%1A%8D%8Ah4*G%22%11%7B4%1Au%84%C3ag(%14ri%FFu%86B!g%24%12vD%A3Q%9B%A2(%92%A2(j8%1Cj%AB%A9%A9Y%F6%D2%8D7%AE%DD%F0%E3%1F%DF%DF%DE%DE%96%C3%91%08Q%24%02%84%C3%A0H%18%10%14%AF%BF%11B%ABG%24%02%D1%0F%E6h%B9%06%C9h%A1%C7%23%13%D1U%06%07(!%16%17Y%D0!%CF7%8A%11j%EB%B3%A6W9%896%E8R%22%BA%CE%E4%3B%B3%01%2C51%85%1Fe%E6%93%8C%16%83%99%7F%0C%E0N%B39%ED%FEt%F5%CC%CC%A1%C3%AA%85%241%BA%E9v%90%E0(%AA%AArzQ%D1%94~%CC%E3%FF%F1%F8%E3%8B%9C%F9%F9%ABO%3C%F1%C43%FA%F7%EF_%24I%12%C0%AC%B2%D6wV%A7w%A8B%08%08!(%14%0A%85%B7l%D9%B2f%F9%B3%CF%7C%24%BF%F5%D6%ACL%12%A3%9C%00%DB%13QT%EA%B6'H%E2%17%2F%94%07%02%2F%5B%D8%D8k%98%D9etU%10%80%7De~%FF*%93%83%EAf%E6%A10%BE%EEe%DD%DC%60%B0%B9%D7A%82%FD%C5W%DD%3D%3C%F1%BB%CB%00%5Co%E2%10%7B%A6%C2%EB%7D%DA%A40%3A%AB%C2%EB%FD~y%20%60x%5D%D8%A8%EB%AF%F3o%1F9%F2%86%FE'N%7DX%AB%84N%B4%13%EF%BC%E5Jk'%01Y%96%91%9A%95e%9Br%F6%D9sv%06%02%91%7F-Z%B4%AA%BA%BAz%ED%B0Q%A3%F2JKK%FB%A5%A4%A6%3A%B2%B3%B3S%04%11B%A1P%A8%BD%A3%BD%A3%A1%BE%A1a%FD%BAu%5B%F7%7C%F2%89%3D%A7%BE~%B4%BB%ADm%BA%8B%01A%60%98%B4%D0%D2%14%9C%9D%3Dhfw%87%C1%C6%26%1A%04%3Dh%E10_dddh%EB%F3%81%D5M%EFq%0F%A8%0A%AFw5%11%8DE%F2%E2*%02%60%DA%A2%BA%C2%EB%9DOD%DFO2%8F%84%02%D9V%1E%08%A4%5B%99%D7%BE%0D%1B%E6g%0D%1F~-%F6%9B%88%C4%CCP%14%05%91H%04%A1P%08%1D%1D%1Dhmm%E5%A6%A6%26jhh%E0%A6%A6%26%DA%B3g%0F%3AZZ%D4%E6%FA%FA%1D%1D%91H%A3%AA(%A1pC%83%DAZS%2BI%1D%1Dir%5Bk%3E55e%D9%23%11%A4%08%01%A7%10%9C%22I%E4%20%82%9D%086%22%C8D%10q%8B%AA%EB%0B%C4%B4F%C7%7B-%AC%EB%CD%00%EE3%BB%C4A%08%91%A2e%D3%1B%8D%B5%02%C0%A9%267X%CC(%0F%04%DE%3A%12%9C%04%00%961%F38%23%D7%3A%809%00V%99%B0%D6%DB%99%F9Z%23f%C2%CCi%15%5E%EF%5D%E5%81%C0%2F%CC%26%95s%FC%F1%D75UW%7B%DC%3E%DF%B9%AC%BB%012%9E%3C%1FO%26%8A%3B%BATJd%C7%3B%9C%F1%2C%B4%F6%F6v%11)%2C%2C%0A55%15%B5%ED%DC%89%E0%E7%EB%10%DB%BC%19%92%12%83%1C%07%03%3Be%19%0E!%C8FD%5D%C1%D15%0BJw)%C2x%2B%00%A9%F4%F9%5C%CC%7C%8F%C1%25%0E%09%1D%E2%253%80%3CUR%E2VU%F5T%23%8EDD%ED%AA%AAZ%EE3%DF%E3%CC%26%22z%D6%E0%DF%12y%93s%CD%C6)%F3%FBwh%E6p%D2%C4%17m%ADn%5D%E8%F1Xj%91%90QR2%B3q%CB%96%17%F4%8B%AC%07%89%C3%E1%40Jj%0A222%90%95%95E%B99%B9%E8%DF%AF%1F%0A%06%0C%C0%80%BC%3C%E4%A5%A7%23-%1A%85%B4%7B7%B2%04!K%92%90)I%C8%90%24J%13%82R%88%E0%22%82C%03%89%A4q%0F%3Ap%23%13%1CdT%99%DFo%C9%C4d%E6%0A%ED%C0%26%B5%F8%B4%84%26%D3%066%AA%AA%96%1B%D5%24i%26%FDJ%23%CB%F1%B0A%A2%AA%EA%17D%B4%C5%C0%93G%CC%EC%AE%F4%F9.%B20%DC%8D%06%0D%E5%12%A7%8AI%88%95V%E7%975x%F0%B7%F7%AC%5E%7DG%A2%1BQB%2F%91e9%0E%92%94%14%A4%A5%A5!33%13%B9%B9%B9%C8%CD%CDE%BF%DC%3C%E4%B8%DD%C8%14%84%D8%B6m%C8%8A%84%91I%84%0CY%86%5B%92%90%26IH%15%02)B%C0%25%04%EC%1A%17%91%F6s%12%7D%16%DCNM%C4X%02H%A5%CF7%0B%C0%B7%0DZ%8C%25%80%B7%CCJ%B3B%00%B7%24%CB8%D3%01gAO%F6%BC%C7%20%99%1B%0C%B2%D6n%89%0CB%FE%60%E6%9F%99%8D%A5%5D%D4%F3b2SM%939%04P%C9%C2%F1%13%1F%B1%3A%C7~%13%26%FCj%FB%8A%15%B3%C2%8D%8D%8D%BA%86%B9%90e%19N%A7%B3%13(n%B7%1B%D9Y%D9%C8r%BB%91!I%B075A%D9%B6%0D%19%CCH%17%02i%BA%8FK%0884%80%D8%88%20%C7%17%8Fuz%08%01xA%08%E1%B3%22b4%937%8F%99_2%AA7%D6%F9m%BEoa%BC%93%10oYF%06%3Ac%0B%80%D7%8F(H%B4%89W%24%AE3K%A2%970%80I%15%5E%EF%18%0B%AC%F6%7BH%DA%3E%5B%13%AB))%9C9t%C8u%C1%A5K-7%CF%2F%9E1%E3%D5%957%DEX%5C%FF%C5%17OAQHs%D7%B3%5E%FC8%9DN%A4%A5%A6%20%C5%26%C3%19%8D%A0%E1%F3uH%EF%08%C1%0D%82%5B%96%91.IH%95%2485%80%D84%EEA%BA%86%80%BA%12%D7%0B%CA%03%81o%CF%A9%AE%8E%F6%60%1D%3F%D1%F6%80%8C%BFF%0F%95%F9%FDA%0B%E3%FDF7%A7%EE%94U%02%F0fy%20%D0p%C4AR%E6%F7o%02%F0Q%B2%AC%2F%1D%5B%B3%D2R%B2%91%88~%D1m%C3_%26%C0%E1%84%DC%AF%1F%8D%B8%E8%02N-)yv%F3%E2E%13%AD%CE%F3%8Cg%9Ei%CB9%FE%F8%B2u%8F%3E%3A%A2i%CB%96W8%16%23%9D%18%03T%15J%24%8CHc%03%1A%B7n%C3%DE%AA%B5%A0h%14Fi%1C%5D%DAtn%07p%A3%10%C2g%C5%0F%D2%C5%02yE%3B%F5F%D2%96%99%B9IU%D5%9FY%E0%22%C3%01%CC%D0t%C2d%FA%1D%00%FC%B9%A7%FB%7D%C8)%F9%CC%FCg%233Z%E32%B3%B5%8EDf%A0%FB%03%80%2F%0F%E2%246%3B%D8%ED%C6%A8K%2FA%C6%C0%81%E4%CA%CBe%CF%19g%AD%DC%F0%C4%13%A3z2%D71%3F%FC%E1%86%AC%C1%83g%AF%B9%FB%EE%92%FA%0D%1B%EEm%DF%B5k%2B%B4%8B%13%A3-%AD%DC%BEc'%B6%BE%F3%0E%A4%D6V%40Q%18%07%B5%81e%D6%E9N*%11%BDID%17%08!J%CA%03%81%87%E6TW%2B%3D%04%C83%00f%1A%89%19%DDy%BB%EA%CA%9A%1A%D3%A25!%C4%1F%92%ED%87%AE%A7%EB%96%F2%40%E0%FD%1EK%0E%1C%06Ux%BD%3B%01%F43R%BA%00%BCV%1E%08%98%B6%A8%AC%F4%F9%863%F3%86%CE%85%132)%E9%E9%18%F2%AD%8BPr%FAip%0F%2C%85%23%2B%13B%B6%B1%12%0A%85%B7%BE%F0%C2%94%E3%E6%CE%AD%3A%94y%3F%E5%F5%CAC%E7%CD%F3%15%CD%981K%D8m'%ED%DD%B0a%C8%AA%07%1E%F2%8A%86%067%D4%03%F6%5BE%3C%23o%0B%80u%9A%C7%F9%83%F2%40%A0%E90%D6%EC%19f%BE%5C%08ax%85%AD%26%CE_%2C%F3%FB%BFea%CC1%00%3E3*WQU%15Dtuy%20%F0%F8Q%05%C9B%8F%E7%26%22%BA%DF%88e%AA%AAJB%88%A9e~%FF%87%16%5E%F6%3A%00%8F%90dc%25-%95Jg%CFB%E9%993%E0%1E8%08%8E%EClH%0E%07H%08%A8%AA%CA%1C%8D*%C1e%CB%CE*%BD%F0%C2%E5%E8%05%AA%9C1%D3%8E%EAm%92%1Am%934%A5%5C%25%22E%08%11-%F3%FB%95%DEx%86%26bf%26%A2%CD%26%B7%7C%ECP%14%A5t%5Emm%D8%C2%B8%EF%10%D1%B4%EE%5C%2C%3A%EE%DC%A8%AAj%DE%9555%CAQ%05I%A5%CFg%D3%0A%C5%D3%92%B9%81uln%88%25%E0%0D%1A%F22%BB%9C%E7%0D%9C%3D%0B%03g%9C%0Ewi)%9C%D99%9D%B9%22%FA%16%0E%AC(T%FF%C5%17%B7%E5%8D%1E%7D%17%8EaZ%E8%F1%E4iJ%AA%CF%E4%12l%FD%E5Oc%CA%03%81%B5%16%F6%E0Bf~%11%E67z%FE%AC%3C%10%B8%E7P%E6%7FXe%82Z%DB%AA%3B%60%DE%A0vp%A5%CF%F7c%2Bcnjh%BCh%F0%25%17%7FQ%3Ac%06%DC%03K%E1%CC%C9%E1%04%07%D1%2B%60DD%24I%9C%3Bj%D4%9D-55%AF%FC%1A%B0%1F%8B%00%A9%F4%F9fi-%20%BCf%B7%A4'%1A%F7%01%B8%DC%0A%40%16z%3C6%00O%C2%A0%FDz%C2%EC%15B%DCw%A8%EFp%D8%B5%A4%E5%81%C0%3D%CC%DCh%D0%95'%E1%D8%B9%BB%C2%EB%F5%98%8D%F7%87%7D%7B%94%CC%BC%FC%C9i%1E%CFngN%0E%24%BB%03B%96%3B%9Db%DD%3D%26%B5%A8h%E6%2F%5B%5B%9Bv~%F8%E1%B9%C7%108%5C%15%5E%EF%3F%98y%09%11%09%9D%EF%C2H%C4%10%80%5B%CB%03%01%2B%BD%F9AD%F3%9993%99_%04%FB%EFN%FE%D5%9C%EA%EA%D8%D7%06%12m%B27%1BX9%898%8C%80Y%B6%99F%23%AE%BD%B65%F8%9F%FF%8CP%23%91f!%CB%A4Ou%A4%03%AFG%EDtV%C8))%8E%FE'%9C%F0j%DB%EE%DD%EF%7Dx%EB%AD%DE%AF%13%20%15%5E%EF%CDZ%82qROjw%00a%E6%FB%CA%03%81%3FZ%7C%C6)0%C8%F0%D3%89%9F%DDs%83%C1%BF%1E%D6%FE%F6%E2%C2l%0208%E9%A2t%B6%95%12%7F(%F7W%FF%C2%CA%98%EB%E7%CF%CF%2F%BD%F4%D2M%8E%AC%ACL%AB%13M%B8'%DBv%ECxq%C3c%8F%DD%3A%F9%F7%BF%3F*w%06k%09C%D7h%E27%CB%A8%1BS7z%251%F3%7Ds%83%C1%1F%5B%7C%96%9B%88v%11%91%D3L%7C%018%B7%3C%10XzL%80d%A1%C73%5C%08%B1As(P%E7%F0%D4i%C8%03B%02%0B%09%E1%F4%F4%93%AFY%FD%E9%7BV%C6%FD%F0%B6%DB2G%FD%F0%87U%AE%FC%7C%2F%E9%40%60%01(%00%40%AD%3Bv%7C%B0o%ED%DA%07%AB%1E%7C%E0%D5%0B%96.k%E9mph9%A97h%19e%AE%C4%09%B62O%EC%CF%11%B9%D5*%07%D1%0E%E4%C7D4%D1%CCB%22%A27%CB%FC%FE3%0F%F7%1D%A9WOS%C9%C0%FB%04%F3%CD%90%A4x%D1%14%11%40%02%2C%CB%A0%14%17%1Cyy%9C9%A8%14%03%86%0FW2%8B%8BK%BD%B3f%05%AD%8C%FB%8F%09%13%9Cg%BF%F0%C2%F2t%AFw%8A%AE%A4%C0t%03TU%D5%BA%ED%82%22%8D%0D%E1%C6%CD%9B%97%87%EA%EB%FF%F9%C6%23%7F%5B%EE%EA%88%EC%9A%B3bY%C7!%80%22W%AB%8B%B9%18%F1%AC%F6%E1%06!~S%11%A3)%A9%CF%F5%E00%3EAD%F3%CC%EEO%06%40%B1X%2Cm%5Emm%DB1%05%12%00x%FE%C4%93j%A4%F4%F4B)5%15r%86%9B%DC%F9%F9H%CD%CB%83%BB_%7F%B8%F2r%E1%C8%CAd9%3D%1D%92%DD%B1o%E99%E7%14%7Fg%F3%E6%90%D5%B1%F7VU%DD%9F%3Db%C4M%24%84%E1%86%E8o%B6%D2%EE%A4Ah%DF%3E4m%DE%CC%AB%2B%9F%A6%C6%8F%3E%02B%ED%DB%C1%ECG%BC%81%DD%97Z%8F%B2%3A%C4%FB%BA3%E2%F54%E9%88W%F7%0FB%BC6w%20%E2%E5%ACN%BD%DC%EF%01%40%F4%26%EEv%003%ADX1%3A%80%DE%CC%CC%F7%99%3DJ%7B%FF%2B%CA%03%81g%7BE%E7%ECm%90T%FF%E3%1F%23%D8%E9XgKOg%D9%E9%84p8Hr%3A!9%9D%B09%5D%10%0E%07d%BB%03d%93%11%AA%AB%5B%7BmQ%D1%B8g%CC%DBZt%D2%B6%97_%9E%5Dx%DAiO%DB%D2%D3%DD%E8%86%AB%1C%00%10%00j%2C%86hs3%9A%FD%D5%D8%FA%FA%5B%F8j%F1bPS%23%13%2B%894v%D2%2B%C4%BA%CB%0C%A1%AB%B7%E9%AA%0C%F6%98s%E8%B9%07%11%BD%18%8B%C5.%B7%E2(%D3%89%98%8B%01%2C%B6%E0%88%033%BF67%18%9C%D9%5B%7B%DA%EB%20%01%80%DA%15%2B~%945%7C%F8_H%96%20%249QU%07H%02BHZ%13%5D0%09%89Z%FC%FE%F7G%97%94L%F3%F7%E0%C6%88%97%CE%3A%2B%ED%94%07%1F%7C*c%F0%E0%0B%B0%BF%16%85%F5Mk%98%19%AC(%88%85%3A%D0V%5B%8B%BA%CF%AA%F0%F1c%8F%01%3Bv%01%B1%C8Q%B3tt%D1rb%E6%26%22%BA%AA%CC%EF%7F%A1%87F%C1L%C4%EF%11b%13%2F-%98%B9%D1%E1p%E4%7D%E7%AB%AF%94c%1A%24%00P%BFy%F3k%EE%92%92sHP%E2%82%92%AE%26l'%17h%F6%FB%DF%3B%BB%A4%E4%D4%0F%7B%C0Q%00%60%EBK%2FM%2F%3C%E5%94JGff%E1%01%20%D1%DAy%2B%91%08%3A%F6%ECF%E3%17_%60U%E5Sh%AF%FA%1C%08wX0%3Az%07%1F%1A0%12S%7BHU%D5%9FY%09%D6u%05%083%BF%A2%C5z%C8%82%954in0%F8io%BE%C8%11%5B%A93%01%E9%E5%86%86%80%DD%ED.%E8j%16%EBX%7B'PZjj%3E%F9%B5%C7s%E2_%E2%7D7zDu%EB%D7_%EF%F6z%EF%91%D3%D2RYU%19%AAJJ%2C%86p%7D%3D%9A%B7~%85M%AF%BC%8A%E0%ABK!%DA%DA%E2%7D%CB%88%8E88t%96%CB2%22%FA%BE%95%7C%10%13%11CfI%D2%00%AE*%0F%04%9E%E8%ED%17%12Gj%A5%5E%07%94%2F%9F%7C%F2%14%25%14o%FB%D4%DD%0D%DEz%F9%9E%5E%5C%3C%E9%AE%BD%7B%BF%5C~%E5%95%99%3D%7DV%EE%88%11%8F%D8%D3%D3%D3%9A%B6l%B9!%DC%D0P%CF%AA%82hs3%B7o%AF%C5%F65%9Fq%E0M%ED%02E%AD_k%2F%8B%13%EE%AA%94j%DD%0A%5E%22%A2%D2%F2%40%E0%9CC%01H%A5%CFw3%E2%F7%19%B2%811%A7%CFmYp%24%00%82%A3%C1s%B7%BC%F0%C2)%BE%D9%B3%DF%166%1B%9B%D8%F4%C4%CC%1C%EB%E8%E8%D8%FA%CF%7FN%3E%AE%ACl%FD%A1%3E%D3%FF%FA%EBg%B8%B22%7F%B2%7B%ED%DA3%AB%16%2C%04%EF%DE%03D%23%87%A5t%26%E5%EF%076%EF%DB%07%E0A!%C4%3DfY%ED%16%CD%5CC%11%A3%B3%94%96%97%07%02%A7%1F%A9%3D%3C%E2%20%01%80%C0%B2e%97%14%CD%98%B1%C8%CCtM%2C%BE%1A%89P%5DU%D5%9C%FE'%9C%F0%F4%E1%3C7%07%90%EF%3B~%C4%15hm%BD%1C%E03%BB%11w%3D%BA~%BE%ABr%ACY%3E%B5%00%9E'%A2Ef%95u%16%3D%A9o%00%98d%E2%7B%D1%17%B6W)%8A2a%5Em%AD%F2%8D%06%09%00%D4._~u%C1%C9'%FF%0D%E6%3E%8E%CE%13%DA%B8y%F3%A2%D9C%87%5E%B1%D2%BC%09%9DU%16~%82v%E3%D4%14%22%9A%A4%5D%07%22%C1%F8%A2%A6%C4%A9%8D%01%083%F3z%22%FA%80%88%3Ea%E6%E5f%D5%FD%3D%D0%3FN%01%B0Ts%B5%5Br%E5%03%D8%CC%CC%A3%E6%06%83%E1%23%B9wG%0D%24%00P%B3b%C5u%85%D3%A6%3D%02%0B%1C%A5sgZ%5B%1B%FD%AF%BCr%DE%90%EF%7C%E7%BD%231%A7%0A%AF%B7P%BB%ED!%87%99%DDD%E4PUU%08!%A2%88%F7Im%D4%BA%1Cn7%EBQv%88%DC%C3FD%F3%11%0F%D6%19%FA%40%BA%88%98%CD%CC%3Cvn0%D8~%A4%F7%ED%A8%82%04%00%82o%BCQVx%EA%A9%15%24I%96%DC%EB%09%96%DB%F0%E5%97%CFn%98%3F%FFG%D3%1Ex%A0%0E%FF%25T%E9%F3%5D%08%E0I-%DC%0F%2B%B6%B9%C6E%AA%98%F9%84%23%CDA%BE6%90%00%40%F5%92%25%B3%8A%CE8%E3e%C9n'%2B%20I(%00%B1%B6%F6%D0%BE%F5%EB~%BB%F4%82%0B%EE%9B%B7kW%F4%9B%0A%0E-'%F5%AF%00N6r%90u%E3s%01%80%E5%8A%A2%9Cy%24u%90c%02%24%00%F0%C5%82%05%E3%06_r%C9%7B%92%CB%E52r1%13%91%96%C4%0B%B0%1Ag%2B%1D%3Bw%EEn%AD%09%FEf%FE%94%A9%8F%FF%BE%97%F4%95%A3AZ%A4%FC%0F%CC%7C%9EN%B4%18%EE%83%CE%C4%26%CD%CC%9Dw%B4%E7M_%E7%A2-%BD%F4%D2%CCi%F7%DF%FFV%EA%80%01%E3%F4%8B%D1%25%5E%02VU%B0%CAPc%11VBa%0A74p%C7%EE%DD%D4%B8m%EB%9E5%8B%16%DD%AB%84%23%8F%95%BD%FEz%F31%0C%8E%93%B4%C2%A9%19%DA%0BZ%B6%C2u%D1%E2%AB%8E%94%1F%E4%98%06I%82%EA%3E%FF%FC%B1%9C%91%23%AF%D17%BCK4%CA%05%00VbPBaD%5BZ%D0%BEk'%3Av%ED%E6-%EF%BEK%B5%2B%DFg%AA%DFG%08Gb%60u13%CF%9F%1B%0C%BEw%2C%BC%93V%DD_%0E%E0%16h%97!%9A%F8%3D%BA5%B5%B5f%C4g%F5%B6%AB%FD%1B%07%12%00%F0%2F%5BvN%E1%B4i%2F%0B%A7S%063%B1%AA%B2%1A%8B%91%1A%89%20%DA%DA%8AP%5D%1DB%BBwa%C7%E7%EB%B0%F5%8D7%10%DD%B1%03%D4%D1%C1%AC(%09%B6%93x%97z%00%0B%98y%F1%DC%60%F0%E3%A3%F9%0EZ%87%A1%8B%00%94C%EB%0F%A2%DF%F0%1E%A6%9B%103%BF%E6p8%CE%EB%CD%60%DD7%1A%24%00%F0%8F)S%D2%CE%5E%B4%E8Ugv%F6%C9%D1%8E%0E%8E%B5%B6R%B8%A1%1E%E1%3Du%D8%B7u%2B%B6%BD%F5%16%9A7o%86%08%87%80h%F4%007%BB.%AC%AF%07LDk%09%BA%8C%99%DF6%BB%9A%FD%10%B8%85MU%D5%E9%CC%3C%9D%88%CE%070T%BF%D1%9A%3C%B1%1AM%EC%0C%08j%A0%EA%B5%7C%90%FF*%90t%3A%DE%DE%5Eq%B9%B0%DB%17%84%F7%EC%B1%EF%DC%B0%91w%AEZE%CD%5B%B7%40%0AG%80H%18%067x%EB%BD%94%9C%A4%AD%C5z%22%FALU%D5%0DD%B4UK6%DA%A9%AA%EA%BE%AEw%D6%3D%5EP%40v%BB%3D%0B%40%3E3%17%11%D1%40%C4%5Bq%8FF%BC%91n%A6%26F%3A%FB%B5%1EB%8EI%E7%DFi%40%7F%23%16%8B%5D%D8%1B%19e%FF%D5%20%01%807%2F%BD%5C%DE%DE%DC%F88%FB%FD%E5%A4(%40%24%1C%CF%9D%ED%85%20%5D%17n%93%7Cq%BA(%D0%5D%5C%E5%9D%D1%DECYG%7D%BCJ%FB%FB%DD%00%AE%3C%DC%A4%E5%FF)%90t%FA%14J%07%0DB%2C%FA%18%11M%3F%D4%D3z%2CQ7%E0ha%E6_%1Dn%D9%C3%FF4Ht%0E%A8%09D%F4'f%3EU%2F%C3%ADZ%0C%C7%008%F4%9D%AA%89%E2W%A3%FCQ%08q%DF%E1%14N%F5%81%A4%7B%B0%8C%04%F0%0B%00%17%02ptm%C9y%8Cs%0D%20%DE%A1%E0nUU%17%1CJ%F1v%1FHz%E6%A0%CA%13B%5C%CE%CC%D7%25%AC%0A%1D%60%8E%05%91%A4W%9C%5B%00%BC%09%E0%CF%87%D2%1F%A4%0F%24%BD%03%98%91DT%0E%60%26%80a%09%C0%E8.%0E8%1A%A0%E9%F4%18k%5C%ADMk%8F%BE%00%C0%EB%3DmA%D5%07%92%23DO%95%94%90%A2(%3E%CDgq%96%963%92%DD%D529T%D0t%FD%BBn%AC%A4u%CC%FC%01%11-f%E6U%3Di%83%D9%07%92%AF%89%16%14%17%3B%84%10%05%00N%010%05%F1%5B4%86%01%C8Kb%F2%EAE%84%91B%AC%02%D8%84%F8%7D1%EB%00%BC%CD%CCk%AC%F6j%EF%03%C97%80*%7D%3E%19%401%E21%95Bf%CEG%BC%C8%3BU%7F%DF%0D%11%C5TUm%D6%AEE%DD%A9%5Dj%B8%95%99%9B%AD%DC8%D5G%7D%D4G%7D%D4G%7D%D4G%7D%D4G%7D%D4G%7D%D4G%7D%D4G%7D%D4G%7D%D4G%7D%D4G%7D%D4G%7D%D4C%FA%7F%5E_%A9%BB%EE%093F%00%00%00%00IEND%AEB%60%82\" onclick=\"javascript:sendToFLV();\"/><div style=\"position:relative; top:0;\"><select id=\"methodselector\"><option id=\"embedded\" value=\"embedded\" selected=\"true\">"+embeddedstring+"</option><option id=\"newtab\" value=\"newtab\">"+newtabstring+"</option><option id=\"newwindow\" value=\"newwindow\">"+newwindowstring+"</option><option id=\"standalone\" value=\"standalone\">"+standalonestring+"</option></select></div></td></tr></table>";
			}
			if(replacemethod === "newtab"){
				flvideoreplacer.innerHTML = "<table><tr><td width=\""+videowidth+"\" height=\""+videoheight+"\" align=\"center\" valign=\"middle\"><img id=\"flvplaceholder\" src=\"data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%89%00%00%00%89%08%06%00%00%00%18%24%1B%C9%00%00%00%01sRGB%00%AE%CE%1C%E9%00%00%00%06bKGD%00%FF%00%FF%00%FF%A0%BD%A7%93%00%00%00%09pHYs%00%00%0B%13%00%00%0B%13%01%00%9A%9C%18%00%00%00%07tIME%07%DB%03%1C%10(5%FE%8A%1DB%00%00%20%00IDATx%DA%ED%5Dy%7CT%D5%F5%FF%9E%FB%DElY%26%7B%80%2C3%13%C2%26%B2%AF%82%E2%82%B8%02n%B5j%B5%24H%D5%BA%D4Vm%FBk%AD%DD%5DZ%AD%D5%D6%0DmUH%5C)%D6jQ%A1.%E0%82%3B%60%10%10A%203%93%B0%87%EC%CBl%EF%9D%DF%1F%F3%26%3CB%E6%BD%17%08%88m%CE%E73%1Fc%98%DCw%DF%BD%DF%7B%F6s.%D0G%7D%D4G%7D%D4G%7D%D4G%7D%D4G%7D%D4G%7D%D4G%7D%F4%3FA%F4%BF%F0%92%CF%94%96%8AH%24%92%22%84%18%01%60%2C%11%0Dc%E6b%00E%00%FA%03%C8%01%90%92%E4%CFU%22j%60%E6%BD%00v%00%08%00%08%10%D1%E7%CC%BCZ%92%A4%9D%DF%DD%B6-%DA%07%92o%18Ux%BDN%00%3Ef%9E%25%848IU%D5%B1D%E4%01%00%22%023%03%00%13%D1A%EF%CF%CC%E8%FAk%FD%EF8%FE%C7%FA%2FD%01%7C%06%6053%2F%05%F0%FE%DC%60%B0%BE%0F%24%C7%260r%00%9C%06%E0rf%9EJD%FD%12%7BLD%C4%CC%DD%82%E2PI%3F%5E7%C0Y%03%60%19%11%3D%AB%AA%EA%17s%83A%EE%03%C9%D7D%95%3E%9F%83%99%CF%06p%1D%80%93%01%B8%12%DC%22%B1%97_%C3%3B%B2%06%1C%D2%E6%B2%85%99%17%13QE%99%DF%BF%A9%0F%24G%8Fk%94%02%B8%11%C0%E5%00%F2t%07%9A%88%88%8F%B1%F7b%00%A4%89%B8%8F%98%F9%CFs%83%C1%17%FA%40r%84h%A1%C73%1E%C0%EDDt%16%11%89NT%F4%B2(%E9u%94%C4u%1ANp%17%00%BB%98%F9n!%C4%C3e~%7F%B4%0F%24%BD%C39F%03x%40%13)%9D%A7%F3%18%C6ER%B8%00D%F1%1F%88HP%8Bp8%EE%F8%EE%C6%8D%F7%F4%81%E4%D09G%0E%11%3D%09%E0%3CM%BE%F7%AA(%E9j%C9t%B1b%BA%FB9!%3Az%CE%B9X%D3%5D%89%C0Bb%08%89%20I%AC%DA%ED%84%B4%B4%C6%C2%13%A7%DC%7C%E6%BD%F7.%EC%03I%CF%B8%C7%AF%01%FC%AE%8B%22z(%2C%5E%1B%E2%00v%9F%A0%ED%00%FC%00v2%F3%3E!D%0B3%87%98%99%85%1023%A7%02%C8%04%90%AF%F9TJ%13%CA%B1%01hu%BFc%80)%FE%7FB%02l6%A8%92%0C%CAp%23%BD%B0%08Y%83%06r%B6%D7K%EE%82%02%96SSIJI%D9%DC%B1c%C7%85%A5%17_%FCE%1FH%8C%C11%16%C0%12%00%85%87%60%BEv%9E%F4%84%B2(%84%003%87%00%2C%07%F0%3E%80%8F%99%B9jn0%B8%EF0%E68%1C%C0D%00%93%01%9C%0A%E0%B8%83%E6AD%04%02d%1BX%B6%01%E9%A9%C8%19%3A%14%F9%23F%20%BB%D4%07gn%1E%EC%EE%0C%C8%A9%A9%90RR%20%3B%1C%20Yf!%CB%D4V%5B%7B%7F%CE%F1%C7%DF%D2%07%92%EE%17%FFn%00%FF%D7S%B1%D2%8Db%08%00%2B%01%2C%06%F0Jy%20%B0%ED(%98%E3%E70%F3l%10%5D%06%12Y%B0%3B%C0N%07%3B%0B%8A%A8%60%E2x.%1C9%92%9Cy%B9%B0gf%C2%96%91%01%D9%E5%82%ECp%40%D8l%20!%00I%8As%26%22%90%10%14il%AC%DD%F6%F2%CB%E7%1C%3Fo%DE%FA%3E%90%C4%C1Q%08%60%19%80%11%09%3F%83%19%E7%D0%5B6%BA%F7%F8%84%99%E7K%92%F4%DC%9C%EA%EA%F0%D7%A6KM%9E%3A%C1%D5%2Fo%CE%D0%B3%CF%9E%9B%3D%A8%D4%ED%C8%CA%863'%9B%A5%94%14%92%5D.%08Y%06%C9r%1C%1CD%10%89W%3D%F0%95Y%8DF%A9%EE%F3%CFo%EA%3Fq%E2_%FF%A7AR%E1%F5%9E%03%E0e%00rODJ%02'%00%9A%01%FC%8D%88%E6%97%F9%FD%DBp%8C%D1%9E%D5%AB%2F%92SS%7F%96VT4I%D8%ED%00%11%93%10%07%BDjW%259%A1L%81%88%9A%BE%FAji%D9%90!%B3%97%00%CA%FF%1CH*%7D%BE%3B%99%F9%17H%12G1%D27%88h%97%AA%AA%B73%F3%DF%AF%AC%A99%E6%7D%0D%1B%9ExbL%C1%B4i%BFO%F7%F9f%0BY%86%FE%9D%BB%8B%17ur%13f%82%AA%A2c%EF%DE%ED%FE%25KN%19q%CD5%5B%FF'%40%F2xA%01%D9l%B6%17%01%5C%A0-%96%95%B9%248G%03%80_E%22%91G%AF%DE%B9S%C17%8C%D6%3E%F8%E0%F1%DE%B3%CF%BE%C7%5DZz%AE%15%C5%5Ce%06%14%05%D1%B66n%AE%AE%8En%FF%F0%A33%C7%5E%7F%DD%3BGs%CE%E2k%E0%1Ev%9B%CD%F6%01%80%0B%88(%A1%7B%98%EA%1F%CC%0Cf%FE%0B%11%15%96%07%02%0F%7F%13%01%02%00%A3o%BCqC%E6%E0%C13%BF%7C%E2%89%A9%1D%7B%F7n%D1%BF%A3%A9%9CU%14%5B%7Du%F5%DB%0BG%8D%BB%E4%BF%16%24%0B%8A%8BS%98%F93%00'h%16%8C%99xI%AC%DD'D4tn0xs%99%DF%DF%81%FF%02%1A~%F5%D5%1F%A6%F6%EB7d%EF%9A5%3FQB!%D5%12%D7%D7%94%15%0A%B7%2F%AA%F0%F9%AE%3EZs%95%8F%26%40%84%10UD4%D8%CA%A9%D1N%17%01%B8%B9%3C%10%F8K%2F%2B%CBC%88h%A4%AA%AA%25D4%0C%80%17%C0%00%CDq%E6%D4t%9F%18%11%B5%02%A8%03P%03%A2%AD%ECJ%F9%0A%05E%9B%8E%1B%3B%EA%B3%C9%F7%DE%DB%DA%1Bs%C9%1F%3F%FE%CF%1F%FE%E2%17%8BG%DFt%D3%BF%5Cyy%E3%F4%96%5B%92U!%80%19%8C%BFUx%BDry%200%FF%BFB'%A9%F4%F9%EC%CC%FC%19%11%0D%D7%16%C0%F0%D9%1A%86v%10%D1%A9e~%FFW%BD%F0%FC%91%AA%AA%CE%24%A2s%01L%05%20%E9%AD%0A%9DE%A1%B76X%17%EE%07%1C.pN%16F%5D%F6%1D%F4%1F%3F%0E%CE%FE%FDw%0AIz%AD%7D%C7%8Ee%97M%9D%FA%AFwz%C1%F2%D8%5BUuW%CE%A8Q%B7%EA%DD%00%3A%9D%04M%5B%B7b%FDs%CF%A1v%C9%2B%40%A8%23%A1%C8%97%CF%0D%06%2B%BF%D1%20%D1%94%D4%0F%00%9C%60%A4%A4%26%C0%A3m%CC%92%F2%40%E0%BC%C3%E4%16C%01%5C%03%60%1E3g%26%0Ef%8F%1Cu%89x%9C%DD%09%CA%CB%C3%98%2B%CB%91%3Fj%14R%8B%8B%D9%EEv%93%B0%DB!%24%09J%24%82%8E%3D%7BV%86%EB%EB%1F%CD%1B3%E6%99%C3%99w%F5%92%25%D3%8AN%3F%7D%B9%E4tJ%DD%83%E4y%D4.Y%02%0A%85%C0%E8%B4%F4f%97%F9%FD%AF%7Ccu%12%CD%8A9%81%88%ACp%10%02p%F7%E1%00%A4%C2%EB%BD%AC%C2%EB%DDHD_%02%B8%05%40f%E2%D9%3D%F3%E4%26%00%E2%80%D4%AF%1F%C6%CD%9D%8B%BC%B1c%90%E6%F5%C2%91%91A%92%DD%0E%8A%BB%FC!%D9%ED%9C%5E%5C%7CR%EE%E8%D1OG%DB%DB%B9%7D%CF%9E%F9o_%7F%7D%C1%A1%CC%BFd%F6%EC%F7%D6%3D%F2Hi%B4%A5e%9F%8E%AD%F2%81%AAZ'%B7K%18G%2F%2F%F4x%C6%7D%23AR%E9%F3%DD%99%B0b%B4%CD%A1d%D6%8B%F6os%CB%03%81%9F%1F%E2%B3~T%E1%F5%B6%02x%0E%C0%D0%84%98%D0YP%3D%E3%9C%1C%07%08rs1j%CEw%913f%14%D2%8B%8Aaw%BB!%ECv%40%88%83%C6gf%96%5D.8%F3%F2%BE%7F%CA%C3%0Foo%DB%B5k%E9%A7w%DC1%A8%A7%EF2%EE'%3F%09%FEc%D4%A8%E2%B6%1D%3B%D6%92%10t%10%3A%BA%88f%0D%2C%EF-%F4x2%BFQ%20%A9%F0z%CFI8%CA%2C%98%B7DD%E7%97%07%02%15%87%F0%9C%2B*%BC%DE%06f%FE%0B%B4%8C%F7%C3O4%E1x%60.%DD%8D%11%97%5D%86%BC1%A3%91%E6%F1%C0%96%9E%DE%E9N%D7%01%E4%80%93%DD)%A6%00%B8%F2%F3%CF%9Ap%DBm_5%07%02%FF%7C%F9%AC%B3z%B4%81s%02%81%D0%B5%85%85%E3Z%FC%FE%F7u%0F9h-u.%04%17%11%BD%F5%8D%01%89%16%8ByY%A7%83%98%01df%99%DF%FF%EF%9E%3Cc%A1%C73%AC%C2%EB%FD%8C%99%9F%26%A2%0C%1D%FB%3DL%7C0%20d(%A9)%18z%FE%F9%E8%3F~%3C%D2%8A%8B%E1HO%87%A4%05%E3%0C%3C%A4%E8%0ARf%E6%B4%E2%E2%0Bg%BE%F4R%C3%EEU%ABn%ED%C9T%9E%06%D4%11%25%25%D3Z%02%81%F7H%08bfp%02(%D4%ED3%C7-%F4x%1E%FB%A6p%92e%D8%1F%8B%A1%24%E0%60%00%24%848%BF%3C%10x%AD%87%A2%E5%D7D%B4%11%C0haa%D3%0CD%9C%DE%9A%D2%00%22%C0N'%06L%9B%86%A2%93%A6%22%CDS%0CGF%06%C8fc%8AGj!%84%B5e%23%1D%09%87%83%F3%C7%8F%BF%ABm%F7%EE%8Dk%1Fx%60%B8%D5y%D6%00%3C%AD%B4%F4%D4%8E%BA%BAO%A0*%14%D7%DB8%B9%90%24%BAF%8B%87%1D%BB%20%D1%C2%FD%23%8C%8E%B4NG%99%DB%13%0ER%E9%F3eW%FA%7Ck%98%F9w%9A2J%3D%10%2F%AC%F7%DEj%E6%23%989%06%6073%7F%05%A2%B5lw%7C%922%7C%F8%C7%83O%9F%BE%DA%96%91%F9%05%2BJ0%DA%DE%DE%9C%E0R%07%04%DF%0E%81%5CyyC%8F%BF%E6%9A%0D%B5%EF%BCs%9D%D5%BFY%07%A8%0F%0E%1Cxb%B4%B5m%2BG%A2l%2C%C0%C1%00%5E%AE%F0z%D3%8EI%13XK%18Z%03%93%80%9D%B6%C6w%F7DI%5D%E8%F1%9CIDK%00%D8%B4%B1%ADX*%09_%87%FE%BB%01%00%AB%01%AC%00%F0%11%80%DDB%88%869%D5%D5%DD%3A%C7*%8A%8B%E5A%97%5D%96%E9%CC%C9%C9%C9%18%3Cx%B0%7B%E0%C0%E9)%F9%F9S%1C%99%99%E3%E5%94%14%DB%A1%A42%26%FE%A6a%D3%A6%7F%FFv%D8%B0%8B%1E%B0%E8c%D9%F3%F1%A7%99%AB%1E%9D%BF%7D%EF%BB%EF%BA%10%8B!%9E%D5%94%94K%BEW%1E%08%9Cr%2C%82%A4%96%88%0A%12%1A%B7%01%40z%E4%07%A9%F0z%AF%07%F00%ACE%8B%BB%86%DB%89%99%B7%12%D1b%00%15D%B4%B572%D4%DF%9A7%2F%DB%3Bs%E6)%FD%26O%FE%9E%2B7w%A6%E4p%C0(%7B%FF%00%E6%C3%CC*3%08%A0%F6%5D%BB%BEXu%C7%1D%93O%7B%F4QK%1E%DC%8A)'%8E%E0%9D%3B%D6%090%9B9%24%89%E8%8A2%BF%FF%D9c%06%24%89%9CT%23%06%A2M~gy%20P%D8%83q%EF%00p%9B.%D6c%1A%0CL%F8%5C%88h%19%80%DF%95%07%02%1F%1DIS%7F%C9%D9gg%9Cx%FF%FD%3FH%1D0%E0%C7%F6%8C%8C%2C%23%9003XU%C1%8A%02%25%1CF%B4%AD%0D%1D%7B%F6%EC%B6%BB%5C%232%87%0E%AD%B3%B4%26%3E%DFw%C1%FC%941%B3f%00%88*%8A%92%3A%AF%B66%F6%B5%83D%CBj%AF39%E9%89%B5%1Bb%D5%D5%5E%E9%F3%DD%CF%CC7%C1B%3AA%97%14%C6%25DtC%99%DF_%83%A3L%FB6l%F8~%BA%C7s%AF---%A1%13%B0%AA%AADDqp%A8*%D4H%04%91%96%16%84%F6%EDC%C7%CE%5D%A8%DF%F2%15%82%1F%7D%DC%BC%AB%AAj%F0%D5k%AB%F6X%3C%3C%CF%03%B84%D9r%EB8WEy%200%F7k%07I%85%D7%FB2%80%F3L%CC%5D%A0%07%C1%BA%04%07%B1%A0%DF%24X%3C%98%D9%2F%848%BF%CC%EF%FF%1C_3%D5o%DCxW%C6%A0A%B7%92%241%00R%15%05%AC(%88%B5%B7%23%5C_%8F%B6%1D%3B%B0o%FDzlY%F167m%FA%12%22%12%25D%22%8DBQJ%E6%04%FC%8Df%E3%3F%3Fd%88%14%0E%87%EB%00d%24S%DEuN%CA%C1%E5%81%C0%96%AF%0D%24Z%E1TUB%070%98%EC'%E5%81%C0%09%BD%A8%83t%CDT%FBM%99%DF%FF%7B%1CC%B4%E6%EE%BB%0B%8E%BB%EA%AA%95%F6%CC%CC%125%12%E6Hs%0B%B5%EF%DA%85%96%EAjl%5C%BA%14%7BV%AD%82%D4%D6%06%84%C2%DAk0%01%08%08!%86%CD%A9%AE%0EYX%A7i%00%DE5Z'%EDp.%2F%0F%04N%FF%3AA%F2%0E%80%93%93%CDQ'%0A%86Z%113%9A%15%F3%1F%23%1DDg%82%12%80Vf%1E%3F7%18%DC%8Cc%94%F6~%BE%F6%11Wn%DEu%AD%C1%1A%AE%5B%BF%8E%AA%16-%82%B2c'%A8%A3%03P%14t%C6%89%F6o%EA%87%E5%81%C0T%8B%EB%FF%0C%E25%D1%DD%FA%8At%9Cvby%20%B0%EA%A8%FBI%B4%DA%DC%93%0D%12%88%88%99%89%99%FFj%05%20%95%3E_%B6f%E6%1A)%A9z%FD%E4C%22%CA%3B%96%01%02%00y%A3F_%BFo%ED%DA%CB%AB%DFy%9B%3E%7D%ECo%AC%D6%D4%82%DAZ%E3%00!%1C%90%25%AF%BD%DB%94%0A%AF%F7~%8B%0E%BB%1F%01%08ik%D6%AD%DB%5E%3B%A4%7F%FAZ8%C9B%8F%E75%22%3A'9%A7c%00h%24%A2B%2B%19e%9A%A3l%8C%89%F2%9B%98%F7%E2%F2%40%E0%B0%D2%F8%EE.%1D%EA8%E7%A6%1Br%5DEE%E3%DD%C5%C5%C7%A5%0C((%92%1C%0E%17%98%89%84P%3A%EA%EA%EAZkj%B65~%F9e%D5W%CF%3D%B7%E9%5B%EF%BF%DFr8%CF%FB%DB%A8%D1%13%1D%1D%1D%2B%11%89%D8%92%F98p%60%EB%8A%F3%CA%03%81%25%16%F6%E1gD%F4G%03%256%A1%9B%8C*%0F%04%D6%1D5%90h%ED%1F6'%BC%CF%06%F2%F0%07%E5%81%C0%C3%16%00%F2k%CD%93j%A4%A0%26%16%EF%E9%F2%40%60%CE%A1%CC%FB)_I%A6%0A%9A%C5ii%97zg%9E3y%E8%ECYy%19C%86%C6%5D%EF%B2%DCY%F3%DB%F5%9D%94H%04%A1%BA%BA%AAHK%CB%0A%FF%AB%AF%3E9%EE%C7%3F%3E%A4%A2%A9%85%DE%92Q%04%F5c%00%0E%13%7D%0B%CC%DC%A2%AAj%E1%9555%86%3E%94%05%C5%C56!D%0D%E2%E5%A8%C9%94X%00x%BE%3C%10%F8%CE%D1%1477%12%910%D0%19%98%88vE%22%91G-%9C%84a%09W%3B%BA%0FL%E8O%D7%E2C%01H%85%D7%7B%7C%85%D7%FB%9C%CA%EA.%C8%D2Srn%F6L%CF%09%93rS%06%14%40NI%E1D%E8%3F%D9%22Kv%3BR%06%0C%18%9D5t%E8%CDco%B9e%5D%EB%8E%1D%1Bj%DE%7C%F3%AA%E7G%8F%B6%F7d%1Es%03%D5%9F%03%98%02%401p%EF'b%5En!%C4Sfcj%25%25%BF1%3A%B0%DA%1A%5E%B8%D0%E3%C9%3B*%20%A9%F4%F9%1C%88%B7%9D%EA6%CA%AB%C9ARU%F5v%2BY%EDD%F4%9C%CEuN%06%8B%F6aOE%CCB%8F%A7%B8%C2%EB%FD7%80%F5%00.%23%12vv%B8%E0%3B%F9%14%A4%14%7B%C8%9E%91%01%C9%16%F7%F4%F7%24%BA%9B%D2%BF%FFqE%A7%9F%FE%F7%F3%DFz%2BX%BB%7C%F9U%3D%99Sy%20P%C5%CCga%7F%91%19%1Bl%EC%05%0B%3D%9E%E9fc*%8A%F28%80%3D%C9t%13%EDY%0E!%C4%E5G%05%24Z%0B%AA%3C2VF%9A%99%F9%EF%16N%F8%15Fz%88.b%DCJD%D3%7B%C8%3Dn%23%A2%00%80%D9%09%FB%12%B2%8D%1C%03%06%A0p%C2%04J%C9%CD%83%9C%92%02h%E5%96%5D%F3%5C%AD%90%23%3B%3B%BF%E0%B4%D3%FE%DE%5CS%B3%E1%B3%FB%EF%F7Y%E6(%C1%E0r%22%BAM3%3E(%09(%01%80%85%10%A69%AC%F3jk%15%00%F7j%86%02u3%16k%CE%C6%EB%8E%0AH%00%5C%97%2C%1A%AAS%2C%FFf%B1%B2%EE!!D%D2%D3%94H7%60%E6%F1e~%7F%C8%22%A7K%AF%F0z%D7%01%B8%23%B1%D8%14%8F%F1C%B5%DB%E09%E9D%A4%16%0C%80%CD%ED%06IR%D2%24%22%13%EE%A7ol%82%D4%01%03%8E%1B~%D5U%D5%3B%DE%7F%FFz%AB%8BX%E6%F7%DF%05%E0U%BDH%ED%E61%C4%CC%85%9A%EF%C8lN%8F%01%88%19p%12%020t%A1%C73%F2%88%82D%EBrxr2%07N%C2%1C%26%A2%F9%166%F3G%002%93%9D%26%CD%8B%0A%22%FA%8DU3%B7%D2%E7%2Ba%E6%ED%00%8E%3F%C04g%06d%3B%5C%03%0AP0~%2C%9C%B9%B9%F1v%0F%92%84d%3E%06%AB%CA%3F3C%8D%C5H%09%85X%D8l%0F%7F%F8%87%3FX.sPU%F5%22%AD5FR%C6%AD%BD%C7%3D%16%40%D7%8Cx'%05%EA%EE%CC%E9%CA%8B%CB%8F4'9%0D%80%AB%3B%96%86%FD%A1%F9O%AC%14o3%F3%9D0%C8%5E%D3%D8%A3%DF%AA'u%A1%C73%96%99%B7%01HKp%20%DA%AF%8DB%95e%14N%9D%8A%94%82%02%D8%DCn%08Y%86%D0%B8HO%C5L%02%C0%DANC%0DG%D0%5E%B7%17%F5%9B%BE%E4%8D%2F%BD%7Cm%C5%A0!%AFZ%19%E7%CA%9A%9A%08%11%7D%2B%C9z%EA9%40%EAB%8F%E7z%0B%F3%9A%9F%0C%F4%BAd%F0%99O%95%94%D0%91%04%C9%E5z%8E%D1%9DI%9D%98%A8%09G%BA%0C%40*%0C%92%A3%99%99%84%10%E7%5B%E5%20D%B4F%9F%8Ct%20%17%B1%C1%9E%9F%8F%01cG%C3%99%9D%CDR%9C%8BpBYM%00EUU%A8Z%20.%99%93%A6kDW%89F%11imF%C7%F6%ED%B4%F1%95W!773b%91s%2B%BC%DE%C5%16%C5%CEk%00V%1A%253i%EFezX%E6%06%83%EF%01%A8%D7%E9r%DD%ED%D10EQ%7CG%04%24%15%5E%AFSk%A4k%E8.%97%24%E99%0B%C3%FD%26%19%17%D1%BD%DB%12%2B%C1%BAJ%9F%2F%9D%99%D7%22i%22%12%81%25%09%FD%C7%8D%E5%94%82%02%D8%D2%D3!%ECv%A8%D1(%B5%06%83%AF%B7%04%83%3FX%3F%7F%FE%B8%3F%0A%E1%92%24%89%24I%22!I%F4%EE%0F~P%18%7C%FD%F5%F3%DA%F7%EC%F9KG%5D%5D%1D%98%13'c%7F%EA%A3%AAB%E9%E8%40%FB%EE%BD%D8%FEY%15Z6~I%08%87%13%2Fqq%85%D7%7B%BBE%CE%F4%DD%84%B5%93%E4%DF%09%40N%A5%CFw%86%85%E1%16%243%87u%FD%C1%CE%3FR%9C%C4%A7%EB%B4%9CLa%5Di%D6%40%A6%C2%EB%1DJD%C3%8C%B4zMO%B9%C1%E2%02%7F%A0%1318%88%8BH%12%90%99%89%FEcG%C3%95%93%03%B0%DA%D2%B8q%E3O%EF%18%3F%DE%E1%F6%F9%FE%2F%DD%E3%11%23%AE%BB%EE%A6%5B%99%172%F3%A7%CC%BC%8E%99%DF%3C%F9%A1%87%EE%F6%9Cy%E6%E9)%F9%F9%1F%B9rs%87oY%BCxJ%8B%DF%FF%06%E2%16%04%83%19j4%CA%E1%E6ftl%DF%8Emo%BC%05%D1%11%02%D4%18%E9X%FB%2F%2B%7D%BE%99%168%40%80%88%5E%D4%C4%18'%B3t%98%F9'%16%D6cq2e8Q%AB%03%E0%AC%23%02%12f%9Ee%F0%F0%C4%BBYa%B1%D7%18p%D6D%0A%FD2%2B%F9%20%15%5E%EFm%88%E7%D4%26%E3%D3%60%D9%86%CC!%839s%E0%40%0A77%FF%A95%1C%19%913rd%C7o7lx%16%C0%A3%88w%94%9E%0E%60%1A%E2%CD%F3%3C%00Fk%FA%D7%F9%00n%05%B0x%F0%A5%97~%C7%ED%F3%FDr%EB%E2%C5%13Cuu%B5%60F%AC%A3%03%A1%3D%7Bx%DB%CA%F7%10%DD%BE%1D%88F%BA%EA%12%AC%AA%EAS%15%5Eo%AA%85%F5%BD%D5%C8!%A6%FD%FE%CC%0A%AFW6%01%DC%C7%00%22%C9%F4%1C%ED%00NZP%5C%EC%E8u%90%08!NJ%C6%D2%13M%EC%00X)7%9Cg%B0P%89%C5%FD%9D%15G%19%80%DB%91%ACs%033%98%04T%A7%93%8B'NlV%C2%E1Iyc%C7~%90WX%F8%5B%00%D7%028%1D%C0Hf.%60%E6Tfv%C63%0B9%A2%F9%1BR%989%93%99K%00L%02p%11%80%3B%07%5Dz%E9%0C%5BV%D6%19%F5%1B7%3E%11mi%A1%D6%9A%1A%D4%7C%F4%11S%B8%03%DDd%15%12%11e%010%D5%D3%CA%03%81%CD%00%3E0q%AE%81%99%AF%B0%60%0E%BFf%F0o%60%E6l!DA%AF%82%E4%99%D2R%A1%DD%F6%40%06%A6%60%C8%AC%89%5D%A5%CF7%92%993%91%BC.%80%99y%AB%95%94C%22z%18%BA%CA%85nu4I%E2%D4%12%DF%DE%C1%E7%CE%1CW4%FD%F4%E3%89%E8%16%00%171%B3%8F%99%15f%EE%40%FC%A6%09%05%80%AA%9B%17k%BF%8Bi%A7%B2M%03%D2%C9%00%AE%95e%F9G%19%C3%86%3D%D9R%ED%BF%3D%B0f%0D%A1%BE%01%AC(%DC)%E2%B4%CF%FE%5E%9D%98S%E1%F1%1Coa%A9%1FD%F2%98Z%A2%3A%C0%8A%D7t%99%11%AB%D6~%3C%A5WA%12%89DR%88%C8c%E0%F4b%C4%DB%60%9A%F9%05fv)%BD%ECzRHKZ6%8D%C5%24%3C%A9%C9%1D%0C%608%5D%CD%DE%2B.%3F%D1%E5%F3N%07%F0%2Bf%1E%C5%CC*%F6%87%D7%7BB%0A%80%26f%CE%22%A2KeY%BE%AD%FF%C9%D3%5E%DD%13%AC%BD%17%90%08%92-%EE%BD%95%A4%F8G%C4%3F%24%24%82%90%00%C9%F6G%0B%EB%F3*%00%23%9D%8E%01%9CiAt%BDm%E4%08L%A4%24%F4*H%B4%0B%85%8C%B2%E0%09%F1%3E%A9f%A7%FF%5C%23%0Fc%02%03%16%A6%F4%CBd%F3I%B4E%82%90%C8%3D%7C%C4%AC%09%DF%FA%D6(%22%BAKU%D5%0Cf%8Ej%22%05%87%F8!f%8E%A8%AAJ%CC%3C%09%C0%5D%DFz%F2%F1%87R%8E%1B%F6%B6k%C8%10r%0D%1B%0A%E7%D0%F8%C75d%18%9CC%B4%9F%87%0Ea%D7%B0!%B3%96%DCt%8B%CF%C4o%D2%02%60%B9%89%07%1A%95%3E%DF%09%26%A2k%93%09%88%18%07%F7%9F%ED%96z%D2%C4f%AC%05%AF%E4%C7%16%C6%99%9A%AC%BA_%9Bx%90%88%B6%9A%88%ACLf%BE0%D98%89D%1B%D8%EC%7F%3A%F7%A9%05)%CC%7C%A7%AE%9Dgo%91%A2m%D8%08!%C4og%3Ep%FF%D5%7B%AB%AA%D6%A9J%D4%C1%F1d%11%22%AD%E4Gk%0AM%DA%D3o%C0_%EE%FB%A9%C9%D8%FF%04p%8E%C9%26OE%BCn%C8%88%D6%23%DE%F6%14I%D6hX%AF%82D%BB%92%0C%26%C9%CEU%26%22b%08t%0Dd%92p%92%D5fu1%9A%95%E50%94%B7Bj%B9%A4%EA%B3%A7eY%FE%11%80%01%CC%1C5%10%93%04f%A7%AA%AAJ%22%FD%81%99U%10E%8D%DAviV%98%60%E6Y%CE%FC%FC%FF%B8%F2%F3oO%19%D0%FFN%18Xn%91%E6%E6%0B*%8A%3C%B7%96%D7%06c%06k%BD%3Ca%0AwS%9A%91HG%9Cba%CF%3Ec%E6%E3%0D%FC%25y%95%3E%9F%5C%E6%F7%C7zE%DChw%D6%B1%89%E9%B5%CFd%D2%23-(S%2B%2CL%E7R%24%09%B1%C7%17%84%09B%BA%DDn%B7Mf%E6%99%9A%82%9AT%84(%B1%98%AB%AD%A5%25M%92%E5%0CI%96%D3I%884%12%C2%0D%E6%1CUQ2TE%11%C9%FEVUU0%B3%A4%AA%EAU%99%23F%FC%5Bv8%DB%9D9y%AC%7D%D0%E5C%19%83%06%0F%1Av%F5%F7%7C%26%EB%B4%0B%C0%F6%24%B1%B1%84%F2%3A%C9%82~%B3!%99%12%AC%1B%BB%B87M%E0%22%93%0C%B4%ED%16%26%5Db%A4Li%3F~d%22j%1C%00%26'S~%E3%C0!%7C%7B%D5'%2BTU%3D%99%99%DDF%3A%88%AA(%99%20Je%00%7F%BA%E7%1E%AC%FA%F4S(%B1X%A7%8F%05D6%00%D9%AA%A2%D8%0D%80%A6%00%18%0B%60J%B4%BD%FDqa%B7%91%B0%C9%24l2%0E%FAH%12%0AO%3Bm%96%D1%3B%CE%A9%AE%EE%00%E0O%26%1E%B5g%F6%B7%C0I%AC%F4%7C%F5%F5%26H%FA%1B%D9%DD%88%DF%F6%60*%B2L%F4%9A%18%80%DD%26%1C-%17%40%9E%E1%09%91%A4%D7%E5%D4%D4%C9%AA%AANVU5%AC%9D%F6d%00%B1%25%7C%3C%ABV%AD%C2%23%8F%3C%82%A5K%97%A2%B9%A9%09%B2%2CCk%F7%00%10%B9UE%91%0D8%8A%83%99%A7%B4%ED%D8%B1%02%BAxP%D7%0F3s%E6%E0%C1'YX%EF%2F%0D%DE%11%00%24%AD%C5%87%D1Z%05%2C%3C%C7%B4%9A%B2'%8Ak%8E%C9%BF%EF%B40%867%99%5E%A3%1D%9A%7DB%88%06%93%17%1F%AF%BF%7B%A6%DBq%18%FF%060%94%99%8B%00%B4u%3B%8E%AA%BA(~%5DIg%AC%A8_~%3E%DEZ%BE%1C%1D%ED%EDhnj%C2%C4I%930t%D80%C4b1%A8%F1%80_%063%EFK2%AF%08%11%8D%CB%19%3B%F6%C5hkk%CC%9E%9E.'%0B%5D%B0%A2%0C%B1%08%12%23%92%88h%80%11%07'%22%D3%3Da%E6%FC%DE%E4%24)%26%0F%B3r5%C8%00%83%B4%00%00hNV%DD%AF%FB%DEq%5D%CC%E5%83%F9%E7%25%DF%DE%C4%CCy%86%EFGt%D0%FB%D8l6%14%14%14%A0%B6%B6%16O%3D%FD4%16%2F%5E%8C%BD%BBw%83%15%25%EEc%17%82XU%9D%C9%A4)%80A%CC%5C%18nl%5C%99%04%20%F1%DDu%3A%BC%0F%10%ECf%5C%C0%825%99c%22%DE%AD%ECIV%AF%BA%E5%0D%5E%08B%08%2B%E5%06%99FV(%11%B5%5B%D1%8D%0C%FDL%92%8CQ%B7%DC%D2%A1%F9D%94%24bF%C6%FE%FE%24%F1%0D%24%82l%B3%C1%E9t%22''%07%19n7%3E%5B%B3%06%BF%FC%D5%AF%B0e%CB%16%B4%B5%B6BQ%14%00p%24%119%AC%AA%AA%5DQ%94%5C9%25%E5%CBd%0E%20V%15H).%B7%DD%E5%92L%0EC%9D%85uw%9B%F8%5C%3AL%9E%C1D%94zT%40%A2%C9Z%2B%A9%85N%93%97%B6r%FD%88%2B%B9%95E%20%D9%06WFF%86%C6%F9%92)%AC%07%E8%16%09%93U%92%248%1D%0E%B8%5C.%A4%A5%A5!%2B%2B%0B%A1%8E%0E%DCq%C7%1Dx%F7%BD%F7%D0%DC%D4%94%10%D1%DD%8E%ABq%93T%5BzzcW%17%A9%16t%81%AA*%20IBZa%A1%19H%C2%16%DC%3A%8E%C3%DD%3AU5oF%DD%9B%1D%A1%D9%1A%9E%E8%B0%C7%E8%5E%D40%18%02%88%F7%09%91%8C%16%20%B1a%5D%7F'I%12l6%1B%ECv%3B%9CN'%84%10%90e%19%ED%ED%EDX%B8p!%1A%1B%1A0%7D%FAt%CA%EF%D7%CF%11S%D5H%12%91g%03%91%D2%05%FDq%EF%9B%1A%D3%89%1C%A7%A5%16%1A%06%D6d%AF%1Cr%B1%BF%BB%E3%91%05%89%A6%8C%CA%16%BE%173%E9%A5je%0C%A5%5B%A01%81l2%E4%BC%5C%00%88%A9%AA%CA%5Du%01%9D%D2%AA%A2%9B%BEgB%EB%87%26I%12%24I%82%10%02%8A%A2%C0n%B7%E3%F2%F3%CE%C3%A8%91%23%91%9E%96%A6*%8A%12%EB.%0C%AFe%D2%C5%D4p%D8%05%9B%AD%CB3%15%80%D5%F8%AB%13%A1%7D%FBN%B3%23%2C%19%E9o%DA%9AG%0Fs%DF%D8%CA%C1%EC%15%90h%93N%B5%F0%BDVf%CE7%E0%26.%0B%C8%AF%3Bx%E35%A7%A9lC%FF1c%D0%BE%7B%B7l%CF%C9%09u%BA%E7%0F%FEv%F4%20%AFh%17%D1%11%89D%20%88%90%DF%AF%1F%CE%3A%EB%2C%8C%181%02%0E%A7%131E%89(q%16%D5%9D%A3KRU%B5Mmn%1Eh%D7%DA%93%ECOuT%11w%E6%02%B1%F6v5%D2%D1fV%8F%94n%A1a%A0%A1%0E%F7xA%81%19%E7%26%222mp%D3%13ve%86%7C%2B%7DJ%CD%94%B14%B3%84%1A-%D1%19%DD%C8%0ApZ%1A%0A%C6%8DE%AC%B99%87%99%9B%99YN%EA%8A%D7%DC%F4%9D%19%F9%CCP%99%11S%14%B4%B4%B4%C0%E1p%60%CC%D8%B18%FD%F4%D31%F5%A4%93%E0LIALQ%A0*J%BBA2O%98%99%EB%19%18%7F%E0%EF%D5%03%1A%3BGZZv%B4v%84%CC%B8%80%95%5C%0F%C3%3E%26v%BB%3D%CBL%AFQU%B5%B9%D78%09%1150s%8E%81%8F%23%DF%C205%26%EE%E4L%22%CA4%01SU7%93%03%CB6d%0F%19%8C%D4%C2%02%D8%5D%CE%D1%88W%B3%C5t%8D%F5%BA%CE%B9%85%80%EC%CE%FE%BCDPb1%B4%B7%B5!%2F%2F%0F%13%26L%C0%8C%193%D0%AF%7F%7F%B4%B6%B6%C6%07P%D5%10%88%D4%24bL%10Qm%24%14%DA%9B%99%9F_%AA%BF%1BPUb%00%03q%01%A8%B2%1A%8Dl%F9%A9y3%BDA%16%A4%C5n%93%EF%E4%5B%E1%CC%BD%C6I%98y%AF%89%8F%A3%C8%C20%5B%93%E9%09%DAF%BA%999%C7%04%AC%9B%BA%135%AA%D3%89%C2I%13%E0%CA%CB%83%E4J%F9%AE%10b%133%EFD%92%80b%BC%B7%3F%1Fp%8A%3AB!%A4%BB%DD%B8%F0%C2%0Bq%F1%C5%17%23%2B%3B%1B%1D%A1P%02%20%0A%E2W%9B%24%3D%B8%00%3E%15mm%83%B5%EB%D341%ACBe%05*T0TfbR%A2Q%2B%95%FDf%09J1%98%84B4g%A2%19%ED%EC5%90%00%D8ab%95%94Z%00%DAW%06r6%91%E9%3B%D8h%8C2%BF%BFE%E3%26%9CPXa%B7%23%A5%A0%00y%C7%1D%07GF%26%A7%E4%E6%E5%B6n%DB%16%02%B0%16%80%CD%00p%11fn%88%9BF%8C%B6%B66%FC%FC%E7%3F%C7%EC%F3%CF%07%88%10%D3%AC%23V%94%10%88%1AL%C0%2BTU%7DW%00%E7i%2C%84%12%25%17%C4%02%C4%04b%22%01%09u%1F%7F%BA%D4%C2z%0FD%F2%CCy%06%10.%0F%04ZL%E64%D0%A4%1D%05%98%B9%A67A%120%A9%82%B7%A2tn2%E0%24%89%EFX%A9%F7%5D%D1%A9%17%10%81m6%0C%98%3C1%5E%95%97%96F%90%04%5C%E9%E9%970%F3%0A%CD%7FC%C9b.%9A%25T%1F%8B%C5%D4%DF%FF%F6%B7%EC%F5x%B8%AD%B5%15J%2C%A6%B0%A2%84%94X%AC%01q%85%1B%06c%90%AA%AAk%DA%B7mkH%2B*%9A%0C-%F5%0D%CC%40%0C%90T%09%12%CB%10%AA%C4%DC%16V%BEZ%F4%C2%07F%2FW%E9%F3%E5%02(5J%88ff%2B%AD%2F%06%9B%25%2F%25%B8%7B%AF%81%04%C6%B7L%24n%DENJ%8A%A2%7C%D6%A98%26%97%B3S%2Cp%A4'%3B%F9%97l%83%C8%C9E%D1%981p%E4%E4%40%B2%DBAD%9C%EE%F1%9C%D1%5E%5D%DD%08%E0%0D-%A19Y%60.%DE%B2Q%92%9A%DCYY%8DB%96%EB%15U%ADS%81%06%06ZA%A4%98%00%04%CC%ECb%E6%C7S%B2%B3o%D1%3C%BA%04EA%2C%12C%8C%19QV%11Q%15%8E%B1%8A%B6%C6%86%E5%B3_%F9w%93%C9%FB%0D3r%3Cj%DC%F8%03%0B%EB4%DA%C4%BC9H%E4%1E%16H%88%E8%F3dN%1E%DDD%26%9A%B8%89%5B%99yg2%EB%40%CB%BD%1C%BF%A0%B88%DBh%9C%B9%C1%E0z%00_0%81%D9f%E3%C2%13%26%23%A5%A0%00%F6%F4x%E9%26%09AL%C4%EE%01%03%FE%C0%CC%CF2s%B5%99%1F%87%88b%9A%FF%A3'%D9kB%D3y%16%87%FD%FE%5CGV%D6%09%D1%D6V%8E%B6%B6%22%DC%D2%82Pk%13BmM%08%B75%23%D2%D6D%91%8EV%DA%BBf%F5%C3%16%C6%BD8%D9Z%EB%8A%AB%3E%B10%CED%13%3F%C8%A6%B9%C1%60%EF%F9I%98y%B5%91%CBT%CB%0E%9C%0C%93%FCT-%D5%FF%7B%06%D1%60%9B%24I%A7%00%F8%97%89%DB%F5~%96m%7F%97%F2%F2%E0%9D4%09%AE%FC%7CHNg%FC%D6n%CD%D4H%C9%CF%2F%DE%BB~%FD%C5RA%C1%7CI%92%FE%0F%40%3A%F67%8F%E9%0C%A7%E8%8A%DC%0F%D8%98D%91%98%AE%C3%B4%FEo%12%EE%F9%D5%B1%FA%7D%2F%A8%E1%F0%0BM%9B%BE%E4%F8%1D%06%04%8EF%F5%96%9F%96p%40%DBW%94%CF%B3R%23%7C%06%0C%3A*js1L%3A%7F%AA%A4%C4%A6%AAj%A6%89%23m%A3%95%BD%B7%0C%12I%92v*%8A%125P%04%09%C0%A9%16%86Z%06%E0%7B%26E%E2%DF3%03%09X%AAd%BB%FD%8E%FE'L%CEO%F3%14%C3%96%9EN%C2f%D3%F7%19afF%EE%88%11e%81%95%2Bw%BB%06%0F%5E%24%CB%F2%F9%92%24%E5j%0Dv%8C%0A%CC%08%F1%BE%20%9C%E8%F7%A1%2F*%17%F1%14%83%88%A2(U%FBv%EE%7C6PQ%B1%80c1%3B%18%04A%8856%82%23%91%84w%17%00%88U%15%F6%AC%AC%BB%BF%DF%DA%183%D1G%862%F3p%93N%8A%B5%E5%81%C0%5E%13%FF%C7%F4%03%CC%BF%EE%F7k%5D%AF%82%E4%BB%DB%B6E%B5%FBe%26%1A%C89%D3%ECkY%96%FF%15%8B%C5%8Cn%AC%24%003%17z%3C%19s%83%C1%A4%B2%BB%2C%B8-%F2%D4%B7%BE%FD%CB%E2%F1%E3%FE%EE%C8%CD%85-%25%25%0E%90%FDW%9B%103s4%12%E1%FE%13%26%FC%F4%ABw%DEy%C8%E6%F5%FE%DB%EDv%9Fc%B3%D9%06%10%91%AC%AA*b%B1%98%A4%AA%AA%D0%15%8EwN-%D1%9E%8B4%DF%88%14%BF%CADU%14%25%14%0E%87%AB%AA%3F%FA%E8_%FE_%FD%FA%9E%98%12%CB%11%20%12%89%06%06a%7D%AC%93%12iK%DB%C5%F6%ED%F3-p%EC%1B%92%F5%C4%D5y%90%9F%B70%CEt%ADX%CEH'y%DB%AAL%ED%09%AD6y(*%7D%3E%C3%2C%EF%2B%B6nU%98y%A5%D98D%14%C4r%97%00%00%13GIDAT%F4%03%B3%C9%CC%F9%E7%E2%C73%07%96%7Caw%BB%19%DA%5D4%3A%BF%0D4%8E%81h4%CA%FD%C6%8E%FDA%C7%AE%5DS%3Fz%F7%DD%E7%1B%1A%1A%B6E%22%115%1A%8D%8Ah4*G%22%11%7B4%1Au%84%C3ag(%14ri%FFu%86B!g%24%12vD%A3Q%9B%A2(%92%A2(j8%1Cj%AB%A9%A9Y%F6%D2%8D7%AE%DD%F0%E3%1F%DF%DF%DE%DE%96%C3%91%08Q%24%02%84%C3%A0H%18%10%14%AF%BF%11B%ABG%24%02%D1%0F%E6h%B9%06%C9h%A1%C7%23%13%D1U%06%07(!%16%17Y%D0!%CF7%8A%11j%EB%B3%A6W9%896%E8R%22%BA%CE%E4%3B%B3%01%2C51%85%1Fe%E6%93%8C%16%83%99%7F%0C%E0N%B39%ED%FEt%F5%CC%CC%A1%C3%AA%85%241%BA%E9v%90%E0(%AA%AArzQ%D1%94~%CC%E3%FF%F1%F8%E3%8B%9C%F9%F9%ABO%3C%F1%C43%FA%F7%EF_%24I%12%C0%AC%B2%D6wV%A7w%A8B%08%08!(%14%0A%85%B7l%D9%B2f%F9%B3%CF%7C%24%BF%F5%D6%ACL%12%A3%9C%00%DB%13QT%EA%B6'H%E2%17%2F%94%07%02%2F%5B%D8%D8k%98%D9etU%10%80%7De~%FF*%93%83%EAf%E6%A10%BE%EEe%DD%DC%60%B0%B9%D7A%82%FD%C5W%DD%3D%3C%F1%BB%CB%00%5Co%E2%10%7B%A6%C2%EB%7D%DA%A40%3A%AB%C2%EB%FD~y%20%60x%5D%D8%A8%EB%AF%F3o%1F9%F2%86%FE'N%7DX%AB%84N%B4%13%EF%BC%E5Jk'%01Y%96%91%9A%95e%9Br%F6%D9sv%06%02%91%7F-Z%B4%AA%BA%BAz%ED%B0Q%A3%F2JKK%FB%A5%A4%A6%3A%B2%B3%B3S%04%11B%A1P%A8%BD%A3%BD%A3%A1%BE%A1a%FD%BAu%5B%F7%7C%F2%89%3D%A7%BE~%B4%BB%ADm%BA%8B%01A%60%98%B4%D0%D2%14%9C%9D%3Dhfw%87%C1%C6%26%1A%04%3Dh%E10_dddh%EB%F3%81%D5M%EFq%0F%A8%0A%AFw5%11%8DE%F2%E2*%02%60%DA%A2%BA%C2%EB%9DOD%DFO2%8F%84%02%D9V%1E%08%A4%5B%99%D7%BE%0D%1B%E6g%0D%1F~-%F6%9B%88%C4%CCP%14%05%91H%04%A1P%08%1D%1D%1Dhmm%E5%A6%A6%26jhh%E0%A6%A6%26%DA%B3g%0F%3AZZ%D4%E6%FA%FA%1D%1D%91H%A3%AA(%A1pC%83%DAZS%2BI%1D%1Dir%5Bk%3E55e%D9%23%11%A4%08%01%A7%10%9C%22I%E4%20%82%9D%086%22%C8D%10q%8B%AA%EB%0B%C4%B4F%C7%7B-%AC%EB%CD%00%EE3%BB%C4A%08%91%A2e%D3%1B%8D%B5%02%C0%A9%267X%CC(%0F%04%DE%3A%12%9C%04%00%961%F38%23%D7%3A%809%00V%99%B0%D6%DB%99%F9Z%23f%C2%CCi%15%5E%EF%5D%E5%81%C0%2F%CC%26%95s%FC%F1%D75UW%7B%DC%3E%DF%B9%AC%BB%012%9E%3C%1FO%26%8A%3B%BATJd%C7%3B%9C%F1%2C%B4%F6%F6v%11)%2C%2C%0A55%15%B5%ED%DC%89%E0%E7%EB%10%DB%BC%19%92%12%83%1C%07%03%3Be%19%0E!%C8FD%5D%C1%D15%0BJw)%C2x%2B%00%A9%F4%F9%5C%CC%7C%8F%C1%25%0E%09%1D%E2%253%80%3CUR%E2VU%F5T%23%8EDD%ED%AA%AAZ%EE3%DF%E3%CC%26%22z%D6%E0%DF%12y%93s%CD%C6)%F3%FBwh%E6p%D2%C4%17m%ADn%5D%E8%F1Xj%91%90QR2%B3q%CB%96%17%F4%8B%AC%07%89%C3%E1%40Jj%0A222%90%95%95E%B99%B9%E8%DF%AF%1F%0A%06%0C%C0%80%BC%3C%E4%A5%A7%23-%1A%85%B4%7B7%B2%04!K%92%90)I%C8%90%24J%13%82R%88%E0%22%82C%03%89%A4q%0F%3Ap%23%13%1CdT%99%DFo%C9%C4d%E6%0A%ED%C0%26%B5%F8%B4%84%26%D3%066%AA%AA%96%1B%D5%24i%26%FDJ%23%CB%F1%B0A%A2%AA%EA%17D%B4%C5%C0%93G%CC%EC%AE%F4%F9.%B20%DC%8D%06%0D%E5%12%A7%8AI%88%95V%E7%975x%F0%B7%F7%AC%5E%7DG%A2%1BQB%2F%91e9%0E%92%94%14%A4%A5%A5!33%13%B9%B9%B9%C8%CD%CDE%BF%DC%3C%E4%B8%DD%C8%14%84%D8%B6m%C8%8A%84%91I%84%0CY%86%5B%92%90%26IH%15%02)B%C0%25%04%EC%1A%17%91%F6s%12%7D%16%DCNM%C4X%02H%A5%CF7%0B%C0%B7%0DZ%8C%25%80%B7%CCJ%B3B%00%B7%24%CB8%D3%01gAO%F6%BC%C7%20%99%1B%0C%B2%D6n%89%0CB%FE%60%E6%9F%99%8D%A5%5D%D4%F3b2SM%939%04P%C9%C2%F1%13%1F%B1%3A%C7~%13%26%FCj%FB%8A%15%B3%C2%8D%8D%8D%BA%86%B9%90e%19N%A7%B3%13(n%B7%1B%D9Y%D9%C8r%BB%91!I%B075A%D9%B6%0D%19%CCH%17%02i%BA%8FK%0884%80%D8%88%20%C7%17%8Fuz%08%01xA%08%E1%B3%22b4%937%8F%99_2%AA7%D6%F9m%BEoa%BC%93%10oYF%06%3Ac%0B%80%D7%8F(H%B4%89W%24%AE3K%A2%970%80I%15%5E%EF%18%0B%AC%F6%7BH%DA%3E%5B%13%AB))%9C9t%C8u%C1%A5K-7%CF%2F%9E1%E3%D5%957%DEX%5C%FF%C5%17OAQHs%D7%B3%5E%FC8%9DN%A4%A5%A6%20%C5%26%C3%19%8D%A0%E1%F3uH%EF%08%C1%0D%82%5B%96%91.IH%95%2485%80%D84%EEA%BA%86%80%BA%12%D7%0B%CA%03%81o%CF%A9%AE%8E%F6%60%1D%3F%D1%F6%80%8C%BFF%0F%95%F9%FDA%0B%E3%FDF7%A7%EE%94U%02%F0fy%20%D0p%C4AR%E6%F7o%02%F0Q%B2%AC%2F%1D%5B%B3%D2R%B2%91%88~%D1m%C3_%26%C0%E1%84%DC%AF%1F%8D%B8%E8%02N-)yv%F3%E2E%13%AD%CE%F3%8Cg%9Ei%CB9%FE%F8%B2u%8F%3E%3A%A2i%CB%96W8%16%23%9D%18%03T%15J%24%8CHc%03%1A%B7n%C3%DE%AA%B5%A0h%14Fi%1C%5D%DAtn%07p%A3%10%C2g%C5%0F%D2%C5%02yE%3B%F5F%D2%96%99%B9IU%D5%9FY%E0%22%C3%01%CC%D0t%C2d%FA%1D%00%FC%B9%A7%FB%7D%C8)%F9%CC%FCg%233Z%E32%B3%B5%8EDf%A0%FB%03%80%2F%0F%E2%246%3B%D8%ED%C6%A8K%2FA%C6%C0%81%E4%CA%CBe%CF%19g%AD%DC%F0%C4%13%A3z2%D71%3F%FC%E1%86%AC%C1%83g%AF%B9%FB%EE%92%FA%0D%1B%EEm%DF%B5k%2B%B4%8B%13%A3-%AD%DC%BEc'%B6%BE%F3%0E%A4%D6V%40Q%18%07%B5%81e%D6%E9N*%11%BDID%17%08!J%CA%03%81%87%E6TW%2B%3D%04%C83%00f%1A%89%19%DDy%BB%EA%CA%9A%1A%D3%A25!%C4%1F%92%ED%87%AE%A7%EB%96%F2%40%E0%FD%1EK%0E%1C%06Ux%BD%3B%01%F43R%BA%00%BCV%1E%08%98%B6%A8%AC%F4%F9%863%F3%86%CE%85%132)%E9%E9%18%F2%AD%8BPr%FAip%0F%2C%85%23%2B%13B%B6%B1%12%0A%85%B7%BE%F0%C2%94%E3%E6%CE%AD%3A%94y%3F%E5%F5%CAC%E7%CD%F3%15%CD%981K%D8m'%ED%DD%B0a%C8%AA%07%1E%F2%8A%86%067%D4%03%F6%5BE%3C%23o%0B%80u%9A%C7%F9%83%F2%40%A0%E90%D6%EC%19f%BE%5C%08ax%85%AD%26%CE_%2C%F3%FB%BFea%CC1%00%3E3*WQU%15Dtuy%20%F0%F8Q%05%C9B%8F%E7%26%22%BA%DF%88e%AA%AAJB%88%A9e~%FF%87%16%5E%F6%3A%00%8F%90dc%25-%95Jg%CFB%E9%993%E0%1E8%08%8E%EClH%0E%07H%08%A8%AA%CA%1C%8D*%C1e%CB%CE*%BD%F0%C2%E5%E8%05%AA%9C1%D3%8E%EAm%92%1Am%934%A5%5C%25%22E%08%11-%F3%FB%95%DEx%86%26bf%26%A2%CD%26%B7%7C%ECP%14%A5t%5Emm%D8%C2%B8%EF%10%D1%B4%EE%5C%2C%3A%EE%DC%A8%AAj%DE%9555%CAQ%05I%A5%CFg%D3%0A%C5%D3%92%B9%81uln%88%25%E0%0D%1A%F22%BB%9C%E7%0D%9C%3D%0B%03g%9C%0Ewi)%9C%D99%9D%B9%22%FA%16%0E%AC(T%FF%C5%17%B7%E5%8D%1E%7D%17%8EaZ%E8%F1%E4iJ%AA%CF%E4%12l%FD%E5Oc%CA%03%81%B5%16%F6%E0Bf~%11%E67z%FE%AC%3C%10%B8%E7P%E6%7FXe%82Z%DB%AA%3B%60%DE%A0vp%A5%CF%F7c%2Bcnjh%BCh%F0%25%17%7FQ%3Ac%06%DC%03K%E1%CC%C9%E1%04%07%D1%2B%60DD%24I%9C%3Bj%D4%9D-55%AF%FC%1A%B0%1F%8B%00%A9%F4%F9fi-%20%BCf%B7%A4'%1A%F7%01%B8%DC%0A%40%16z%3C6%00O%C2%A0%FDz%C2%EC%15B%DCw%A8%EFp%D8%B5%A4%E5%81%C0%3D%CC%DCh%D0%95'%E1%D8%B9%BB%C2%EB%F5%98%8D%F7%87%7D%7B%94%CC%BC%FC%C9i%1E%CFngN%0E%24%BB%03B%96%3B%9Db%DD%3D%26%B5%A8h%E6%2F%5B%5B%9Bv~%F8%E1%B9%C7%108%5C%15%5E%EF%3F%98y%09%11%09%9D%EF%C2H%C4%10%80%5B%CB%03%01%2B%BD%F9AD%F3%9993%99_%04%FB%EFN%FE%D5%9C%EA%EA%D8%D7%06%12m%B27%1BX9%898%8C%80Y%B6%99F%23%AE%BD%B65%F8%9F%FF%8CP%23%91f!%CB%A4Ou%A4%03%AFG%EDtV%C8))%8E%FE'%9C%F0j%DB%EE%DD%EF%7Dx%EB%AD%DE%AF%13%20%15%5E%EF%CDZ%82qROjw%00a%E6%FB%CA%03%81%3FZ%7C%C6)0%C8%F0%D3%89%9F%DDs%83%C1%BF%1E%D6%FE%F6%E2%C2l%0208%E9%A2t%B6%95%12%7F(%F7W%FF%C2%CA%98%EB%E7%CF%CF%2F%BD%F4%D2M%8E%AC%ACL%AB%13M%B8'%DBv%ECxq%C3c%8F%DD%3A%F9%F7%BF%3F*w%06k%09C%D7h%E27%CB%A8%1BS7z%251%F3%7Ds%83%C1%1F%5B%7C%96%9B%88v%11%91%D3L%7C%018%B7%3C%10XzL%80d%A1%C73%5C%08%B1As(P%E7%F0%D4i%C8%03B%02%0B%09%E1%F4%F4%93%AFY%FD%E9%7BV%C6%FD%F0%B6%DB2G%FD%F0%87U%AE%FC%7C%2F%E9%40%60%01(%00%40%AD%3Bv%7C%B0o%ED%DA%07%AB%1E%7C%E0%D5%0B%96.k%E9mph9%A97h%19e%AE%C4%09%B62O%EC%CF%11%B9%D5*%07%D1%0E%E4%C7D4%D1%CCB%22%A27%CB%FC%FE3%0F%F7%1D%A9WOS%C9%C0%FB%04%F3%CD%90%A4x%D1%14%11%40%02%2C%CB%A0%14%17%1Cyy%9C9%A8%14%03%86%0FW2%8B%8BK%BD%B3f%05%AD%8C%FB%8F%09%13%9Cg%BF%F0%C2%F2t%AFw%8A%AE%A4%C0t%03TU%D5%BA%ED%82%22%8D%0D%E1%C6%CD%9B%97%87%EA%EB%FF%F9%C6%23%7F%5B%EE%EA%88%EC%9A%B3bY%C7!%80%22W%AB%8B%B9%18%F1%AC%F6%E1%06!~S%11%A3)%A9%CF%F5%E00%3EAD%F3%CC%EEO%06%40%B1X%2Cm%5Emm%DB1%05%12%00x%FE%C4%93j%A4%F4%F4B)5%15r%86%9B%DC%F9%F9H%CD%CB%83%BB_%7F%B8%F2r%E1%C8%CAd9%3D%1D%92%DD%B1o%E99%E7%14%7Fg%F3%E6%90%D5%B1%F7VU%DD%9F%3Db%C4M%24%84%E1%86%E8o%B6%D2%EE%A4Ah%DF%3E4m%DE%CC%AB%2B%9F%A6%C6%8F%3E%02B%ED%DB%C1%ECG%BC%81%DD%97Z%8F%B2%3A%C4%FB%BA3%E2%F54%E9%88W%F7%0FB%BC6w%20%E2%E5%ACN%BD%DC%EF%01%40%F4%26%EEv%003%ADX1%3A%80%DE%CC%CC%F7%99%3DJ%7B%FF%2B%CA%03%81g%7BE%E7%ECm%90T%FF%E3%1F%23%D8%E9XgKOg%D9%E9%84p8Hr%3A!9%9D%B09%5D%10%0E%07d%BB%03d%93%11%AA%AB%5B%7BmQ%D1%B8g%CC%DBZt%D2%B6%97_%9E%5Dx%DAiO%DB%D2%D3%DD%E8%86%AB%1C%00%10%00j%2C%86hs3%9A%FD%D5%D8%FA%FA%5B%F8j%F1bPS%23%13%2B%894v%D2%2B%C4%BA%CB%0C%A1%AB%B7%E9%AA%0C%F6%98s%E8%B9%07%11%BD%18%8B%C5.%B7%E2(%D3%89%98%8B%01%2C%B6%E0%88%033%BF67%18%9C%D9%5B%7B%DA%EB%20%01%80%DA%15%2B~%945%7C%F8_H%96%20%249QU%07H%02BHZ%13%5D0%09%89Z%FC%FE%F7G%97%94L%F3%F7%E0%C6%88%97%CE%3A%2B%ED%94%07%1F%7C*c%F0%E0%0B%B0%BF%16%85%F5Mk%98%19%AC(%88%85%3A%D0V%5B%8B%BA%CF%AA%F0%F1c%8F%01%3Bv%01%B1%C8Q%B3tt%D1rb%E6%26%22%BA%AA%CC%EF%7F%A1%87F%C1L%C4%EF%11b%13%2F-%98%B9%D1%E1p%E4%7D%E7%AB%AF%94c%1A%24%00P%BFy%F3k%EE%92%92sHP%E2%82%92%AE%26l'%17h%F6%FB%DF%3B%BB%A4%E4%D4%0F%7B%C0Q%00%60%EBK%2FM%2F%3C%E5%94JGff%E1%01%20%D1%DAy%2B%91%08%3A%F6%ECF%E3%17_%60U%E5Sh%AF%FA%1C%08wX0%3Az%07%1F%1A0%12S%7BHU%D5%9FY%09%D6u%05%083%BF%A2%C5z%C8%82%954in0%F8io%BE%C8%11%5B%A93%01%E9%E5%86%86%80%DD%ED.%E8j%16%EBX%7B'PZjj%3E%F9%B5%C7s%E2_%E2%7D7zDu%EB%D7_%EF%F6z%EF%91%D3%D2RYU%19%AAJJ%2C%86p%7D%3D%9A%B7~%85M%AF%BC%8A%E0%ABK!%DA%DA%E2%7D%CB%88%8E88t%96%CB2%22%FA%BE%95%7C%10%13%11CfI%D2%00%AE*%0F%04%9E%E8%ED%17%12Gj%A5%5E%07%94%2F%9F%7C%F2%14%25%14o%FB%D4%DD%0D%DEz%F9%9E%5E%5C%3C%E9%AE%BD%7B%BF%5C~%E5%95%99%3D%7DV%EE%88%11%8F%D8%D3%D3%D3%9A%B6l%B9!%DC%D0P%CF%AA%82hs3%B7o%AF%C5%F65%9Fq%E0M%ED%02E%AD_k%2F%8B%13%EE%AA%94j%DD%0A%5E%22%A2%D2%F2%40%E0%9CC%01H%A5%CFw3%E2%F7%19%B2%811%A7%CFmYp%24%00%82%A3%C1s%B7%BC%F0%C2)%BE%D9%B3%DF%166%1B%9B%D8%F4%C4%CC%1C%EB%E8%E8%D8%FA%CF%7FN%3E%AE%ACl%FD%A1%3E%D3%FF%FA%EBg%B8%B22%7F%B2%7B%ED%DA3%AB%16%2C%04%EF%DE%03D%23%87%A5t%26%E5%EF%076%EF%DB%07%E0A!%C4%3DfY%ED%16%CD%5CC%11%A3%B3%94%96%97%07%02%A7%1F%A9%3D%3C%E2%20%01%80%C0%B2e%97%14%CD%98%B1%C8%CCtM%2C%BE%1A%89P%5DU%D5%9C%FE'%9C%F0%F4%E1%3C7%07%90%EF%3B~%C4%15hm%BD%1C%E03%BB%11w%3D%BA~%BE%ABr%ACY%3E%B5%00%9E'%A2Ef%95u%16%3D%A9o%00%98d%E2%7B%D1%17%B6W)%8A2a%5Em%AD%F2%8D%06%09%00%D4._~u%C1%C9'%FF%0D%E6%3E%8E%CE%13%DA%B8y%F3%A2%D9C%87%5E%B1%D2%BC%09%9DU%16~%82v%E3%D4%14%22%9A%A4%5D%07%22%C1%F8%A2%A6%C4%A9%8D%01%083%F3z%22%FA%80%88%3Ea%E6%E5f%D5%FD%3D%D0%3FN%01%B0Ts%B5%5Br%E5%03%D8%CC%CC%A3%E6%06%83%E1%23%B9wG%0D%24%00P%B3b%C5u%85%D3%A6%3D%02%0B%1C%A5sgZ%5B%1B%FD%AF%BCr%DE%90%EF%7C%E7%BD%231%A7%0A%AF%B7P%BB%ED!%87%99%DDD%E4PUU%08!%A2%88%F7Im%D4%BA%1Cn7%EBQv%88%DC%C3FD%F3%11%0F%D6%19%FA%40%BA%88%98%CD%CC%3Cvn0%D8~%A4%F7%ED%A8%82%04%00%82o%BCQVx%EA%A9%15%24I%96%DC%EB%09%96%DB%F0%E5%97%CFn%98%3F%FFG%D3%1Ex%A0%0E%FF%25T%E9%F3%5D%08%E0I-%DC%0F%2B%B6%B9%C6E%AA%98%F9%84%23%CDA%BE6%90%00%40%F5%92%25%B3%8A%CE8%E3e%C9n'%2B%20I(%00%B1%B6%F6%D0%BE%F5%EB~%BB%F4%82%0B%EE%9B%B7kW%F4%9B%0A%0E-'%F5%AF%00N6r%90u%E3s%01%80%E5%8A%A2%9Cy%24u%90c%02%24%00%F0%C5%82%05%E3%06_r%C9%7B%92%CB%E52r1%13%91%96%C4%0B%B0%1Ag%2B%1D%3Bw%EEn%AD%09%FEf%FE%94%A9%8F%FF%BE%97%F4%95%A3AZ%A4%FC%0F%CC%7C%9EN%B4%18%EE%83%CE%C4%26%CD%CC%9Dw%B4%E7M_%E7%A2-%BD%F4%D2%CCi%F7%DF%FFV%EA%80%01%E3%F4%8B%D1%25%5E%02VU%B0%CAPc%11VBa%0A74p%C7%EE%DD%D4%B8m%EB%9E5%8B%16%DD%AB%84%23%8F%95%BD%FEz%F31%0C%8E%93%B4%C2%A9%19%DA%0BZ%B6%C2u%D1%E2%AB%8E%94%1F%E4%98%06I%82%EA%3E%FF%FC%B1%9C%91%23%AF%D17%BCK4%CA%05%00VbPBaD%5BZ%D0%BEk'%3Av%ED%E6-%EF%BEK%B5%2B%DFg%AA%DFG%08Gb%60u13%CF%9F%1B%0C%BEw%2C%BC%93V%DD_%0E%E0%16h%97!%9A%F8%3D%BA5%B5%B5f%C4g%F5%B6%AB%FD%1B%07%12%00%F0%2F%5BvN%E1%B4i%2F%0B%A7S%063%B1%AA%B2%1A%8B%91%1A%89%20%DA%DA%8AP%5D%1DB%BBwa%C7%E7%EB%B0%F5%8D7%10%DD%B1%03%D4%D1%C1%AC(%09%B6%93x%97z%00%0B%98y%F1%DC%60%F0%E3%A3%F9%0EZ%87%A1%8B%00%94C%EB%0F%A2%DF%F0%1E%A6%9B%103%BF%E6p8%CE%EB%CD%60%DD7%1A%24%00%F0%8F)S%D2%CE%5E%B4%E8Ugv%F6%C9%D1%8E%0E%8E%B5%B6R%B8%A1%1E%E1%3Du%D8%B7u%2B%B6%BD%F5%16%9A7o%86%08%87%80h%F4%007%BB.%AC%AF%07LDk%09%BA%8C%99%DF6%BB%9A%FD%10%B8%85MU%D5%E9%CC%3C%9D%88%CE%070T%BF%D1%9A%3C%B1%1AM%EC%0C%08j%A0%EA%B5%7C%90%FF*%90t%3A%DE%DE%5Eq%B9%B0%DB%17%84%F7%EC%B1%EF%DC%B0%91w%AEZE%CD%5B%B7%40%0AG%80H%18%067x%EB%BD%94%9C%A4%AD%C5z%22%FALU%D5%0DD%B4UK6%DA%A9%AA%EA%BE%AEw%D6%3D%5EP%40v%BB%3D%0B%40%3E3%17%11%D1%40%C4%5Bq%8FF%BC%91n%A6%26F%3A%FB%B5%1EB%8EI%E7%DFi%40%7F%23%16%8B%5D%D8%1B%19e%FF%D5%20%01%807%2F%BD%5C%DE%DE%DC%F88%FB%FD%E5%A4(%40%24%1C%CF%9D%ED%85%20%5D%17n%93%7Cq%BA(%D0%5D%5C%E5%9D%D1%DECYG%7D%BCJ%FB%FB%DD%00%AE%3C%DC%A4%E5%FF)%90t%FA%14J%07%0DB%2C%FA%18%11M%3F%D4%D3z%2CQ7%E0ha%E6_%1Dn%D9%C3%FF4Ht%0E%A8%09D%F4'f%3EU%2F%C3%ADZ%0C%C7%008%F4%9D%AA%89%E2W%A3%FCQ%08q%DF%E1%14N%F5%81%A4%7B%B0%8C%04%F0%0B%00%17%02ptm%C9y%8Cs%0D%20%DE%A1%E0nUU%17%1CJ%F1v%1FHz%E6%A0%CA%13B%5C%CE%CC%D7%25%AC%0A%1D%60%8E%05%91%A4W%9C%5B%00%BC%09%E0%CF%87%D2%1F%A4%0F%24%BD%03%98%91DT%0E%60%26%80a%09%C0%E8.%0E8%1A%A0%E9%F4%18k%5C%ADMk%8F%BE%00%C0%EB%3DmA%D5%07%92%23DO%95%94%90%A2(%3E%CDgq%96%963%92%DD%D529T%D0t%FD%BBn%AC%A4u%CC%FC%01%11-f%E6U%3Di%83%D9%07%92%AF%89%16%14%17%3B%84%10%05%00N%010%05%F1%5B4%86%01%C8Kb%F2%EAE%84%91B%AC%02%D8%84%F8%7D1%EB%00%BC%CD%CCk%AC%F6j%EF%03%C97%80*%7D%3E%19%401%E21%95Bf%CEG%BC%C8%3BU%7F%DF%0D%11%C5TUm%D6%AEE%DD%A9%5Dj%B8%95%99%9B%AD%DC8%D5G%7D%D4G%7D%D4G%7D%D4G%7D%D4G%7D%D4G%7D%D4G%7D%D4G%7D%D4G%7D%D4G%7D%D4G%7D%D4G%7D%D4C%FA%7F%5E_%A9%BB%EE%093F%00%00%00%00IEND%AEB%60%82\" onclick=\"javascript:sendToFLV();\"/><div style=\"position:relative; top:0;\"><select id=\"methodselector\"><option id=\"embedded\" value=\"embedded\">"+embeddedstring+"</option><option id=\"newtab\" value=\"newtab\" selected=\"true\">"+newtabstring+"</option><option id=\"newwindow\" value=\"newwindow\">"+newwindowstring+"</option><option id=\"standalone\" value=\"standalone\">"+standalonestring+"</option></select></div></td></tr></table>";
			}
			if(replacemethod === "newwindow"){
				flvideoreplacer.innerHTML = "<table><tr><td width=\""+videowidth+"\" height=\""+videoheight+"\" align=\"center\" valign=\"middle\"><img id=\"flvplaceholder\" src=\"data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%89%00%00%00%89%08%06%00%00%00%18%24%1B%C9%00%00%00%01sRGB%00%AE%CE%1C%E9%00%00%00%06bKGD%00%FF%00%FF%00%FF%A0%BD%A7%93%00%00%00%09pHYs%00%00%0B%13%00%00%0B%13%01%00%9A%9C%18%00%00%00%07tIME%07%DB%03%1C%10(5%FE%8A%1DB%00%00%20%00IDATx%DA%ED%5Dy%7CT%D5%F5%FF%9E%FB%DElY%26%7B%80%2C3%13%C2%26%B2%AF%82%E2%82%B8%02n%B5j%B5%24H%D5%BA%D4Vm%FBk%AD%DD%5DZ%AD%D5%D6%0DmUH%5C)%D6jQ%A1.%E0%82%3B%60%10%10A%203%93%B0%87%EC%CBl%EF%9D%DF%1F%F3%26%3CB%E6%BD%17%08%88m%CE%E73%1Fc%98%DCw%DF%BD%DF%7B%F6s.%D0G%7D%D4G%7D%D4G%7D%D4G%7D%D4G%7D%D4G%7D%D4G%7D%F4%3FA%F4%BF%F0%92%CF%94%96%8AH%24%92%22%84%18%01%60%2C%11%0Dc%E6b%00E%00%FA%03%C8%01%90%92%E4%CFU%22j%60%E6%BD%00v%00%08%00%08%10%D1%E7%CC%BCZ%92%A4%9D%DF%DD%B6-%DA%07%92o%18Ux%BDN%00%3Ef%9E%25%848IU%D5%B1D%E4%01%00%22%023%03%00%13%D1A%EF%CF%CC%E8%FAk%FD%EF8%FE%C7%FA%2FD%01%7C%06%6053%2F%05%F0%FE%DC%60%B0%BE%0F%24%C7%260r%00%9C%06%E0rf%9EJD%FD%12%7BLD%C4%CC%DD%82%E2PI%3F%5E7%C0Y%03%60%19%11%3D%AB%AA%EA%17s%83A%EE%03%C9%D7D%95%3E%9F%83%99%CF%06p%1D%80%93%01%B8%12%DC%22%B1%97_%C3%3B%B2%06%1C%D2%E6%B2%85%99%17%13QE%99%DF%BF%A9%0F%24G%8Fk%94%02%B8%11%C0%E5%00%F2t%07%9A%88%88%8F%B1%F7b%00%A4%89%B8%8F%98%F9%CFs%83%C1%17%FA%40r%84h%A1%C73%1E%C0%EDDt%16%11%89NT%F4%B2(%E9u%94%C4u%1ANp%17%00%BB%98%F9n!%C4%C3e~%7F%B4%0F%24%BD%C39F%03x%40%13)%9D%A7%F3%18%C6ER%B8%00D%F1%1F%88HP%8Bp8%EE%F8%EE%C6%8D%F7%F4%81%E4%D09G%0E%11%3D%09%E0%3CM%BE%F7%AA(%E9j%C9t%B1b%BA%FB9!%3Az%CE%B9X%D3%5D%89%C0Bb%08%89%20I%AC%DA%ED%84%B4%B4%C6%C2%13%A7%DC%7C%E6%BD%F7.%EC%03I%CF%B8%C7%AF%01%FC%AE%8B%22z(%2C%5E%1B%E2%00v%9F%A0%ED%00%FC%00v2%F3%3E!D%0B3%87%98%99%85%1023%A7%02%C8%04%90%AF%F9TJ%13%CA%B1%01hu%BFc%80)%FE%7FB%02l6%A8%92%0C%CAp%23%BD%B0%08Y%83%06r%B6%D7K%EE%82%02%96SSIJI%D9%DC%B1c%C7%85%A5%17_%FCE%1FH%8C%C11%16%C0%12%00%85%87%60%BEv%9E%F4%84%B2(%84%003%87%00%2C%07%F0%3E%80%8F%99%B9jn0%B8%EF0%E68%1C%C0D%00%93%01%9C%0A%E0%B8%83%E6AD%04%02d%1BX%B6%01%E9%A9%C8%19%3A%14%F9%23F%20%BB%D4%07gn%1E%EC%EE%0C%C8%A9%A9%90RR%20%3B%1C%20Yf!%CB%D4V%5B%7B%7F%CE%F1%C7%DF%D2%07%92%EE%17%FFn%00%FF%D7S%B1%D2%8Db%08%00%2B%01%2C%06%F0Jy%20%B0%ED(%98%E3%E70%F3l%10%5D%06%12Y%B0%3B%C0N%07%3B%0B%8A%A8%60%E2x.%1C9%92%9Cy%B9%B0gf%C2%96%91%01%D9%E5%82%ECp%40%D8l%20!%00I%8As%26%22%90%10%14il%AC%DD%F6%F2%CB%E7%1C%3Fo%DE%FA%3E%90%C4%C1Q%08%60%19%80%11%09%3F%83%19%E7%D0%5B6%BA%F7%F8%84%99%E7K%92%F4%DC%9C%EA%EA%F0%D7%A6KM%9E%3A%C1%D5%2Fo%CE%D0%B3%CF%9E%9B%3D%A8%D4%ED%C8%CA%863'%9B%A5%94%14%92%5D.%08Y%06%C9r%1C%1CD%10%89W%3D%F0%95Y%8DF%A9%EE%F3%CFo%EA%3Fq%E2_%FF%A7AR%E1%F5%9E%03%E0e%00rODJ%02'%00%9A%01%FC%8D%88%E6%97%F9%FD%DBp%8C%D1%9E%D5%AB%2F%92SS%7F%96VT4I%D8%ED%00%11%93%10%07%BDjW%259%A1L%81%88%9A%BE%FAji%D9%90!%B3%97%00%CA%FF%1CH*%7D%BE%3B%99%F9%17H%12G1%D27%88h%97%AA%AA%B73%F3%DF%AF%AC%A99%E6%7D%0D%1B%9ExbL%C1%B4i%BFO%F7%F9f%0BY%86%FE%9D%BB%8B%17ur%13f%82%AA%A2c%EF%DE%ED%FE%25KN%19q%CD5%5B%FF'%40%F2xA%01%D9l%B6%17%01%5C%A0-%96%95%B9%248G%03%80_E%22%91G%AF%DE%B9S%C17%8C%D6%3E%F8%E0%F1%DE%B3%CF%BE%C7%5DZz%AE%15%C5%5Ce%06%14%05%D1%B66n%AE%AE%8En%FF%F0%A33%C7%5E%7F%DD%3BGs%CE%E2k%E0%1Ev%9B%CD%F6%01%80%0B%88(%A1%7B%98%EA%1F%CC%0Cf%FE%0B%11%15%96%07%02%0F%7F%13%01%02%00%A3o%BCqC%E6%E0%C13%BF%7C%E2%89%A9%1D%7B%F7n%D1%BF%A3%A9%9CU%14%5B%7Du%F5%DB%0BG%8D%BB%E4%BF%16%24%0B%8A%8BS%98%F93%00'h%16%8C%99xI%AC%DD'D4tn0xs%99%DF%DF%81%FF%02%1A~%F5%D5%1F%A6%F6%EB7d%EF%9A5%3FQB!%D5%12%D7%D7%94%15%0A%B7%2F%AA%F0%F9%AE%3EZs%95%8F%26%40%84%10UD4%D8%CA%A9%D1N%17%01%B8%B9%3C%10%F8K%2F%2B%CBC%88h%A4%AA%AA%25D4%0C%80%17%C0%00%CDq%E6%D4t%9F%18%11%B5%02%A8%03P%03%A2%AD%ECJ%F9%0A%05E%9B%8E%1B%3B%EA%B3%C9%F7%DE%DB%DA%1Bs%C9%1F%3F%FE%CF%1F%FE%E2%17%8BG%DFt%D3%BF%5Cyy%E3%F4%96%5B%92U!%80%19%8C%BFUx%BDry%200%FF%BFB'%A9%F4%F9%EC%CC%FC%19%11%0D%D7%16%C0%F0%D9%1A%86v%10%D1%A9e~%FFW%BD%F0%FC%91%AA%AA%CE%24%A2s%01L%05%20%E9%AD%0A%9DE%A1%B76X%17%EE%07%1C.pN%16F%5D%F6%1D%F4%1F%3F%0E%CE%FE%FDw%0AIz%AD%7D%C7%8Ee%97M%9D%FA%AFwz%C1%F2%D8%5BUuW%CE%A8Q%B7%EA%DD%00%3A%9D%04M%5B%B7b%FDs%CF%A1v%C9%2B%40%A8%23%A1%C8%97%CF%0D%06%2B%BF%D1%20%D1%94%D4%0F%00%9C%60%A4%A4%26%C0%A3m%CC%92%F2%40%E0%BC%C3%E4%16C%01%5C%03%60%1E3g%26%0Ef%8F%1Cu%89x%9C%DD%09%CA%CB%C3%98%2B%CB%91%3Fj%14R%8B%8B%D9%EEv%93%B0%DB!%24%09J%24%82%8E%3D%7BV%86%EB%EB%1F%CD%1B3%E6%99%C3%99w%F5%92%25%D3%8AN%3F%7D%B9%E4tJ%DD%83%E4y%D4.Y%02%0A%85%C0%E8%B4%F4f%97%F9%FD%AF%7Ccu%12%CD%8A9%81%88%ACp%10%02p%F7%E1%00%A4%C2%EB%BD%AC%C2%EB%DDHD_%02%B8%05%40f%E2%D9%3D%F3%E4%26%00%E2%80%D4%AF%1F%C6%CD%9D%8B%BC%B1c%90%E6%F5%C2%91%91A%92%DD%0E%8A%BB%FC!%D9%ED%9C%5E%5C%7CR%EE%E8%D1OG%DB%DB%B9%7D%CF%9E%F9o_%7F%7D%C1%A1%CC%BFd%F6%EC%F7%D6%3D%F2Hi%B4%A5e%9F%8E%AD%F2%81%AAZ'%B7K%18G%2F%2F%F4x%C6%7D%23AR%E9%F3%DD%99%B0b%B4%CD%A1d%D6%8B%F6os%CB%03%81%9F%1F%E2%B3~T%E1%F5%B6%02x%0E%C0%D0%84%98%D0YP%3D%E3%9C%1C%07%08rs1j%CEw%913f%14%D2%8B%8Aaw%BB!%ECv%40%88%83%C6gf%96%5D.8%F3%F2%BE%7F%CA%C3%0Foo%DB%B5k%E9%A7w%DC1%A8%A7%EF2%EE'%3F%09%FEc%D4%A8%E2%B6%1D%3B%D6%92%10t%10%3A%BA%88f%0D%2C%EF-%F4x2%BFQ%20%A9%F0z%CFI8%CA%2C%98%B7DD%E7%97%07%02%15%87%F0%9C%2B*%BC%DE%06f%FE%0B%B4%8C%F7%C3O4%E1x%60.%DD%8D%11%97%5D%86%BC1%A3%91%E6%F1%C0%96%9E%DE%E9N%D7%01%E4%80%93%DD)%A6%00%B8%F2%F3%CF%9Ap%DBm_5%07%02%FF%7C%F9%AC%B3z%B4%81s%02%81%D0%B5%85%85%E3Z%FC%FE%F7u%0F9h-u.%04%17%11%BD%F5%8D%01%89%16%8ByY%A7%83%98%01df%99%DF%FF%EF%9E%3Cc%A1%C73%AC%C2%EB%FD%8C%99%9F%26%A2%0C%1D%FB%3DL%7C0%20d(%A9)%18z%FE%F9%E8%3F~%3C%D2%8A%8B%E1HO%87%A4%05%E3%0C%3C%A4%E8%0ARf%E6%B4%E2%E2%0Bg%BE%F4R%C3%EEU%ABn%ED%C9T%9E%06%D4%11%25%25%D3Z%02%81%F7H%08bfp%02(%D4%ED3%C7-%F4x%1E%FB%A6p%92e%D8%1F%8B%A1%24%E0%60%00%24%848%BF%3C%10x%AD%87%A2%E5%D7D%B4%11%C0haa%D3%0CD%9C%DE%9A%D2%00%22%C0N'%06L%9B%86%A2%93%A6%22%CDS%0CGF%06%C8fc%8AGj!%84%B5e%23%1D%09%87%83%F3%C7%8F%BF%ABm%F7%EE%8Dk%1Fx%60%B8%D5y%D6%00%3C%AD%B4%F4%D4%8E%BA%BAO%A0*%14%D7%DB8%B9%90%24%BAF%8B%87%1D%BB%20%D1%C2%FD%23%8C%8E%B4NG%99%DB%13%0ER%E9%F3eW%FA%7Ck%98%F9w%9A2J%3D%10%2F%AC%F7%DEj%E6%23%989%06%6073%7F%05%A2%B5lw%7C%922%7C%F8%C7%83O%9F%BE%DA%96%91%F9%05%2BJ0%DA%DE%DE%9C%E0R%07%04%DF%0E%81%5CyyC%8F%BF%E6%9A%0D%B5%EF%BCs%9D%D5%BFY%07%A8%0F%0E%1Cxb%B4%B5m%2BG%A2l%2C%C0%C1%00%5E%AE%F0z%D3%8EI%13XK%18Z%03%93%80%9D%B6%C6w%F7DI%5D%E8%F1%9CIDK%00%D8%B4%B1%ADX*%09_%87%FE%BB%01%00%AB%01%AC%00%F0%11%80%DDB%88%869%D5%D5%DD%3A%C7*%8A%8B%E5A%97%5D%96%E9%CC%C9%C9%C9%18%3Cx%B0%7B%E0%C0%E9)%F9%F9S%1C%99%99%E3%E5%94%14%DB%A1%A42%26%FE%A6a%D3%A6%7F%FFv%D8%B0%8B%1E%B0%E8c%D9%F3%F1%A7%99%AB%1E%9D%BF%7D%EF%BB%EF%BA%10%8B!%9E%D5%94%94K%BEW%1E%08%9Cr%2C%82%A4%96%88%0A%12%1A%B7%01%40z%E4%07%A9%F0z%AF%07%F00%ACE%8B%BB%86%DB%89%99%B7%12%D1b%00%15D%B4%B572%D4%DF%9A7%2F%DB%3Bs%E6)%FD%26O%FE%9E%2B7w%A6%E4p%C0(%7B%FF%00%E6%C3%CC*3%08%A0%F6%5D%BB%BEXu%C7%1D%93O%7B%F4QK%1E%DC%8A)'%8E%E0%9D%3B%D6%090%9B9%24%89%E8%8A2%BF%FF%D9c%06%24%89%9CT%23%06%A2M~gy%20P%D8%83q%EF%00p%9B.%D6c%1A%0CL%F8%5C%88h%19%80%DF%95%07%02%1F%1DIS%7F%C9%D9gg%9Cx%FF%FD%3FH%1D0%E0%C7%F6%8C%8C%2C%23%9003XU%C1%8A%02%25%1CF%B4%AD%0D%1D%7B%F6%EC%B6%BB%5C%232%87%0E%AD%B3%B4%26%3E%DFw%C1%FC%941%B3f%00%88*%8A%92%3A%AF%B66%F6%B5%83D%CBj%AF39%E9%89%B5%1Bb%D5%D5%5E%E9%F3%DD%CF%CC7%C1B%3AA%97%14%C6%25DtC%99%DF_%83%A3L%FB6l%F8~%BA%C7s%AF---%A1%13%B0%AA%AADDqp%A8*%D4H%04%91%96%16%84%F6%EDC%C7%CE%5D%A8%DF%F2%15%82%1F%7D%DC%BC%AB%AAj%F0%D5k%AB%F6X%3C%3C%CF%03%B84%D9r%EB8WEy%200%F7k%07I%85%D7%FB2%80%F3L%CC%5D%A0%07%C1%BA%04%07%B1%A0%DF%24X%3C%98%D9%2F%848%BF%CC%EF%FF%1C_3%D5o%DCxW%C6%A0A%B7%92%241%00R%15%05%AC(%88%B5%B7%23%5C_%8F%B6%1D%3B%B0o%FDzlY%F167m%FA%12%22%12%25D%22%8DBQJ%E6%04%FC%8Df%E3%3F%3Fd%88%14%0E%87%EB%00d%24S%DEuN%CA%C1%E5%81%C0%96%AF%0D%24Z%E1TUB%070%98%EC'%E5%81%C0%09%BD%A8%83t%CDT%FBM%99%DF%FF%7B%1CC%B4%E6%EE%BB%0B%8E%BB%EA%AA%95%F6%CC%CC%125%12%E6Hs%0B%B5%EF%DA%85%96%EAjl%5C%BA%14%7BV%AD%82%D4%D6%06%84%C2%DAk0%01%08%08!%86%CD%A9%AE%0EYX%A7i%00%DE5Z'%EDp.%2F%0F%04N%FF%3AA%F2%0E%80%93%93%CDQ'%0A%86Z%113%9A%15%F3%1F%23%1DDg%82%12%80Vf%1E%3F7%18%DC%8Cc%94%F6~%BE%F6%11Wn%DEu%AD%C1%1A%AE%5B%BF%8E%AA%16-%82%B2c'%A8%A3%03P%14t%C6%89%F6o%EA%87%E5%81%C0T%8B%EB%FF%0C%E25%D1%DD%FA%8At%9Cvby%20%B0%EA%A8%FBI%B4%DA%DC%93%0D%12%88%88%99%89%99%FFj%05%20%95%3E_%B6f%E6%1A)%A9z%FD%E4C%22%CA%3B%96%01%02%00y%A3F_%BFo%ED%DA%CB%AB%DFy%9B%3E%7D%ECo%AC%D6%D4%82%DAZ%E3%00!%1C%90%25%AF%BD%DB%94%0A%AF%F7~%8B%0E%BB%1F%01%08ik%D6%AD%DB%5E%3B%A4%7F%FAZ8%C9B%8F%E75%22%3A'9%A7c%00h%24%A2B%2B%19e%9A%A3l%8C%89%F2%9B%98%F7%E2%F2%40%E0%B0%D2%F8%EE.%1D%EA8%E7%A6%1Br%5DEE%E3%DD%C5%C5%C7%A5%0C((%92%1C%0E%17%98%89%84P%3A%EA%EA%EAZkj%B65~%F9e%D5W%CF%3D%B7%E9%5B%EF%BF%DFr8%CF%FB%DB%A8%D1%13%1D%1D%1D%2B%11%89%D8%92%F98p%60%EB%8A%F3%CA%03%81%25%16%F6%E1gD%F4G%03%256%A1%9B%8C*%0F%04%D6%1D5%90h%ED%1F6'%BC%CF%06%F2%F0%07%E5%81%C0%C3%16%00%F2k%CD%93j%A4%A0%26%16%EF%E9%F2%40%60%CE%A1%CC%FB)_I%A6%0A%9A%C5ii%97zg%9E3y%E8%ECYy%19C%86%C6%5D%EF%B2%DCY%F3%DB%F5%9D%94H%04%A1%BA%BA%AAHK%CB%0A%FF%AB%AF%3E9%EE%C7%3F%3E%A4%A2%A9%85%DE%92Q%04%F5c%00%0E%13%7D%0B%CC%DC%A2%AAj%E1%9555%86%3E%94%05%C5%C56!D%0D%E2%E5%A8%C9%94X%00x%BE%3C%10%F8%CE%D1%1477%12%910%D0%19%98%88vE%22%91G-%9C%84a%09W%3B%BA%0FL%E8O%D7%E2C%01H%85%D7%7B%7C%85%D7%FB%9C%CA%EA.%C8%D2Srn%F6L%CF%09%93rS%06%14%40NI%E1D%E8%3F%D9%22Kv%3BR%06%0C%18%9D5t%E8%CDco%B9e%5D%EB%8E%1D%1Bj%DE%7C%F3%AA%E7G%8F%B6%F7d%1Es%03%D5%9F%03%98%02%401p%EF'b%5En!%C4Sfcj%25%25%BF1%3A%B0%DA%1A%5E%B8%D0%E3%C9%3B*%20%A9%F4%F9%1C%88%B7%9D%EA6%CA%AB%C9ARU%F5v%2BY%EDD%F4%9C%CEuN%06%8B%F6aOE%CCB%8F%A7%B8%C2%EB%FD7%80%F5%00.%23%12vv%B8%E0%3B%F9%14%A4%14%7B%C8%9E%91%01%C9%16%F7%F4%F7%24%BA%9B%D2%BF%FFqE%A7%9F%FE%F7%F3%DFz%2BX%BB%7C%F9U%3D%99Sy%20P%C5%CCga%7F%91%19%1Bl%EC%05%0B%3D%9E%E9fc*%8A%F28%80%3D%C9t%13%EDY%0E!%C4%E5G%05%24Z%0B%AA%3C2VF%9A%99%F9%EF%16N%F8%15Fz%88.b%DCJD%D3%7B%C8%3Dn%23%A2%00%80%D9%09%FB%12%B2%8D%1C%03%06%A0p%C2%04J%C9%CD%83%9C%92%02h%E5%96%5D%F3%5C%AD%90%23%3B%3B%BF%E0%B4%D3%FE%DE%5CS%B3%E1%B3%FB%EF%F7Y%E6(%C1%E0r%22%BAM3%3E(%09(%01%80%85%10%A69%AC%F3jk%15%00%F7j%86%02u3%16k%CE%C6%EB%8E%0AH%00%5C%97%2C%1A%AAS%2C%FFf%B1%B2%EE!!D%D2%D3%94H7%60%E6%F1e~%7F%C8%22%A7K%AF%F0z%D7%01%B8%23%B1%D8%14%8F%F1C%B5%DB%E09%E9D%A4%16%0C%80%CD%ED%06IR%D2%24%22%13%EE%A7ol%82%D4%01%03%8E%1B~%D5U%D5%3B%DE%7F%FFz%AB%8BX%E6%F7%DF%05%E0U%BDH%ED%E61%C4%CC%85%9A%EF%C8lN%8F%01%88%19p%12%020t%A1%C73%F2%88%82D%EBrxr2%07N%C2%1C%26%A2%F9%166%F3G%002%93%9D%26%CD%8B%0A%22%FA%8DU3%B7%D2%E7%2Ba%E6%ED%00%8E%3F%C04g%06d%3B%5C%03%0AP0~%2C%9C%B9%B9%F1v%0F%92%84d%3E%06%AB%CA%3F3C%8D%C5H%09%85X%D8l%0F%7F%F8%87%3FX.sPU%F5%22%AD5FR%C6%AD%BD%C7%3D%16%40%D7%8Cx'%05%EA%EE%CC%E9%CA%8B%CB%8F4'9%0D%80%AB%3B%96%86%FD%A1%F9O%AC%14o3%F3%9D0%C8%5E%D3%D8%A3%DF%AA'u%A1%C73%96%99%B7%01HKp%20%DA%AF%8DB%95e%14N%9D%8A%94%82%02%D8%DCn%08Y%86%D0%B8HO%C5L%02%C0%DANC%0DG%D0%5E%B7%17%F5%9B%BE%E4%8D%2F%BD%7Cm%C5%A0!%AFZ%19%E7%CA%9A%9A%08%11%7D%2B%C9z%EA9%40%EAB%8F%E7z%0B%F3%9A%9F%0C%F4%BAd%F0%99O%95%94%D0%91%04%C9%E5z%8E%D1%9DI%9D%98%A8%09G%BA%0C%40*%0C%92%A3%99%99%84%10%E7%5B%E5%20D%B4F%9F%8Ct%20%17%B1%C1%9E%9F%8F%01cG%C3%99%9D%CDR%9C%8BpBYM%00EUU%A8Z%20.%99%93%A6kDW%89F%11imF%C7%F6%ED%B4%F1%95W!773b%91s%2B%BC%DE%C5%16%C5%CEk%00V%1A%253i%EFezX%E6%06%83%EF%01%A8%D7%E9r%DD%ED%D10EQ%7CG%04%24%15%5E%AFSk%A4k%E8.%97%24%E99%0B%C3%FD%26%19%17%D1%BD%DB%12%2B%C1%BAJ%9F%2F%9D%99%D7%22i%22%12%81%25%09%FD%C7%8D%E5%94%82%02%D8%D2%D3!%ECv%A8%D1(%B5%06%83%AF%B7%04%83%3FX%3F%7F%FE%B8%3F%0A%E1%92%24%89%24I%22!I%F4%EE%0F~P%18%7C%FD%F5%F3%DA%F7%EC%F9KG%5D%5D%1D%98%13'c%7F%EA%A3%AAB%E9%E8%40%FB%EE%BD%D8%FEY%15Z6~I%08%87%13%2Fqq%85%D7%7B%BBE%CE%F4%DD%84%B5%93%E4%DF%09%40N%A5%CFw%86%85%E1%16%243%87u%FD%C1%CE%3FR%9C%C4%A7%EB%B4%9CLa%5Di%D6%40%A6%C2%EB%1DJD%C3%8C%B4zMO%B9%C1%E2%02%7F%A0%1318%88%8BH%12%90%99%89%FEcG%C3%95%93%03%B0%DA%D2%B8q%E3O%EF%18%3F%DE%E1%F6%F9%FE%2F%DD%E3%11%23%AE%BB%EE%A6%5B%99%172%F3%A7%CC%BC%8E%99%DF%3C%F9%A1%87%EE%F6%9Cy%E6%E9)%F9%F9%1F%B9rs%87oY%BCxJ%8B%DF%FF%06%E2%16%04%83%19j4%CA%E1%E6ftl%DF%8Emo%BC%05%D1%11%02%D4%18%E9X%FB%2F%2B%7D%BE%99%168%40%80%88%5E%D4%C4%18'%B3t%98%F9'%16%D6cq2e8Q%AB%03%E0%AC%23%02%12f%9Ee%F0%F0%C4%BBYa%B1%D7%18p%D6D%0A%FD2%2B%F9%20%15%5E%EFm%88%E7%D4%26%E3%D3%60%D9%86%CC!%839s%E0%40%0A77%FF%A95%1C%19%913rd%C7o7lx%16%C0%A3%88w%94%9E%0E%60%1A%E2%CD%F3%3C%00Fk%FA%D7%F9%00n%05%B0x%F0%A5%97~%C7%ED%F3%FDr%EB%E2%C5%13Cuu%B5%60F%AC%A3%03%A1%3D%7Bx%DB%CA%F7%10%DD%BE%1D%88F%BA%EA%12%AC%AA%EAS%15%5Eo%AA%85%F5%BD%D5%C8!%A6%FD%FE%CC%0A%AFW6%01%DC%C7%00%22%C9%F4%1C%ED%00NZP%5C%EC%E8u%90%08!NJ%C6%D2%13M%EC%00X)7%9Cg%B0P%89%C5%FD%9D%15G%19%80%DB%91%ACs%033%98%04T%A7%93%8B'NlV%C2%E1Iyc%C7~%90WX%F8%5B%00%D7%028%1D%C0Hf.%60%E6Tfv%C63%0B9%A2%F9%1BR%989%93%99K%00L%02p%11%80%3B%07%5Dz%E9%0C%5BV%D6%19%F5%1B7%3E%11mi%A1%D6%9A%1A%D4%7C%F4%11S%B8%03%DDd%15%12%11e%010%D5%D3%CA%03%81%CD%00%3E0q%AE%81%99%AF%B0%60%0E%BFf%F0o%60%E6l!DA%AF%82%E4%99%D2R%A1%DD%F6%40%06%A6%60%C8%AC%89%5D%A5%CF7%92%993%91%BC.%80%99y%AB%95%94C%22z%18%BA%CA%85nu4I%E2%D4%12%DF%DE%C1%E7%CE%1CW4%FD%F4%E3%89%E8%16%00%171%B3%8F%99%15f%EE%40%FC%A6%09%05%80%AA%9B%17k%BF%8Bi%A7%B2M%03%D2%C9%00%AE%95e%F9G%19%C3%86%3D%D9R%ED%BF%3D%B0f%0D%A1%BE%01%AC(%DC)%E2%B4%CF%FE%5E%9D%98S%E1%F1%1Coa%A9%1FD%F2%98Z%A2%3A%C0%8A%D7t%99%11%AB%D6~%3C%A5WA%12%89DR%88%C8c%E0%F4b%C4%DB%60%9A%F9%05fv)%BD%ECzRHKZ6%8D%C5%24%3C%A9%C9%1D%0C%608%5D%CD%DE%2B.%3F%D1%E5%F3N%07%F0%2Bf%1E%C5%CC*%F6%87%D7%7BB%0A%80%26f%CE%22%A2KeY%BE%AD%FF%C9%D3%5E%DD%13%AC%BD%17%90%08%92-%EE%BD%95%A4%F8G%C4%3F%24%24%82%90%00%C9%F6G%0B%EB%F3*%00%23%9D%8E%01%9CiAt%BDm%E4%08L%A4%24%F4*H%B4%0B%85%8C%B2%E0%09%F1%3E%A9f%A7%FF%5C%23%0Fc%02%03%16%A6%F4%CBd%F3I%B4E%82%90%C8%3D%7C%C4%AC%09%DF%FA%D6(%22%BAKU%D5%0Cf%8Ej%22%05%87%F8!f%8E%A8%AAJ%CC%3C%09%C0%5D%DFz%F2%F1%87R%8E%1B%F6%B6k%C8%10r%0D%1B%0A%E7%D0%F8%C75d%18%9CC%B4%9F%87%0Ea%D7%B0!%B3%96%DCt%8B%CF%C4o%D2%02%60%B9%89%07%1A%95%3E%DF%09%26%A2k%93%09%88%18%07%F7%9F%ED%96z%D2%C4f%AC%05%AF%E4%C7%16%C6%99%9A%AC%BA_%9Bx%90%88%B6%9A%88%ACLf%BE0%D98%89D%1B%D8%EC%7F%3A%F7%A9%05)%CC%7C%A7%AE%9Dgo%91%A2m%D8%08!%C4og%3Ep%FF%D5%7B%AB%AA%D6%A9J%D4%C1%F1d%11%22%AD%E4Gk%0AM%DA%D3o%C0_%EE%FB%A9%C9%D8%FF%04p%8E%C9%26OE%BCn%C8%88%D6%23%DE%F6%14I%D6hX%AF%82D%BB%92%0C%26%C9%CEU%26%22b%08t%0Dd%92p%92%D5fu1%9A%95%E50%94%B7Bj%B9%A4%EA%B3%A7eY%FE%11%80%01%CC%1C5%10%93%04f%A7%AA%AAJ%22%FD%81%99U%10E%8D%DAviV%98%60%E6Y%CE%FC%FC%FF%B8%F2%F3oO%19%D0%FFN%18Xn%91%E6%E6%0B*%8A%3C%B7%96%D7%06c%06k%BD%3Ca%0AwS%9A%91HG%9Cba%CF%3Ec%E6%E3%0D%FC%25y%95%3E%9F%5C%E6%F7%C7zE%DChw%D6%B1%89%E9%B5%CFd%D2%23-(S%2B%2CL%E7R%24%09%B1%C7%17%84%09B%BA%DDn%B7Mf%E6%99%9A%82%9AT%84(%B1%98%AB%AD%A5%25M%92%E5%0CI%96%D3I%884%12%C2%0D%E6%1CUQ2TE%11%C9%FEVUU0%B3%A4%AA%EAU%99%23F%FC%5Bv8%DB%9D9y%AC%7D%D0%E5C%19%83%06%0F%1Av%F5%F7%7C%26%EB%B4%0B%C0%F6%24%B1%B1%84%F2%3A%C9%82~%B3!%99%12%AC%1B%BB%B87M%E0%22%93%0C%B4%ED%16%26%5Db%A4Li%3F~d%22j%1C%00%26'S~%E3%C0!%7C%7B%D5'%2BTU%3D%99%99%DDF%3A%88%AA(%99%20Je%00%7F%BA%E7%1E%AC%FA%F4S(%B1X%A7%8F%05D6%00%D9%AA%A2%D8%0D%80%A6%00%18%0B%60J%B4%BD%FDqa%B7%91%B0%C9%24l2%0E%FAH%12%0AO%3Bm%96%D1%3B%CE%A9%AE%EE%00%E0O%26%1E%B5g%F6%B7%C0I%AC%F4%7C%F5%F5%26H%FA%1B%D9%DD%88%DF%F6%60*%B2L%F4%9A%18%80%DD%26%1C-%17%40%9E%E1%09%91%A4%D7%E5%D4%D4%C9%AA%AANVU5%AC%9D%F6d%00%B1%25%7C%3C%ABV%AD%C2%23%8F%3C%82%A5K%97%A2%B9%A9%09%B2%2CCk%F7%00%10%B9UE%91%0D8%8A%83%99%A7%B4%ED%D8%B1%02%BAxP%D7%0F3s%E6%E0%C1'YX%EF%2F%0D%DE%11%00%24%AD%C5%87%D1Z%05%2C%3C%C7%B4%9A%B2'%8Ak%8E%C9%BF%EF%B40%867%99%5E%A3%1D%9A%7DB%88%06%93%17%1F%AF%BF%7B%A6%DBq%18%FF%060%94%99%8B%00%B4u%3B%8E%AA%BA(~%5DIg%AC%A8_~%3E%DEZ%BE%1C%1D%ED%EDhnj%C2%C4I%930t%D80%C4b1%A8%F1%80_%063%EFK2%AF%08%11%8D%CB%19%3B%F6%C5hkk%CC%9E%9E.'%0B%5D%B0%A2%0C%B1%08%12%23%92%88h%80%11%07'%22%D3%3Da%E6%FC%DE%E4%24)%26%0F%B3r5%C8%00%83%B4%00%00hNV%DD%AF%FB%DEq%5D%CC%E5%83%F9%E7%25%DF%DE%C4%CCy%86%EFGt%D0%FB%D8l6%14%14%14%A0%B6%B6%16O%3D%FD4%16%2F%5E%8C%BD%BBw%83%15%25%EEc%17%82XU%9D%C9%A4)%80A%CC%5C%18nl%5C%99%04%20%F1%DDu%3A%BC%0F%10%ECf%5C%C0%825%99c%22%DE%AD%ECIV%AF%BA%E5%0D%5E%08B%08%2B%E5%06%99FV(%11%B5%5B%D1%8D%0C%FDL%92%8CQ%B7%DC%D2%A1%F9D%94%24bF%C6%FE%FE%24%F1%0D%24%82l%B3%C1%E9t%22''%07%19n7%3E%5B%B3%06%BF%FC%D5%AF%B0e%CB%16%B4%B5%B6BQ%14%00p%24%119%AC%AA%AA%5DQ%94%5C9%25%E5%CBd%0E%20V%15H).%B7%DD%E5%92L%0EC%9D%85uw%9B%F8%5C%3AL%9E%C1D%94zT%40%A2%C9Z%2B%A9%85N%93%97%B6r%FD%88%2B%B9%95E%20%D9%06WFF%86%C6%F9%92)%AC%07%E8%16%09%93U%92%248%1D%0E%B8%5C.%A4%A5%A5!%2B%2B%0B%A1%8E%0E%DCq%C7%1Dx%F7%BD%F7%D0%DC%D4%94%10%D1%DD%8E%ABq%93T%5BzzcW%17%A9%16t%81%AA*%20IBZa%A1%19H%C2%16%DC%3A%8E%C3%DD%3AU5oF%DD%9B%1D%A1%D9%1A%9E%E8%B0%C7%E8%5E%D40%18%02%88%F7%09%91%8C%16%20%B1a%5D%7F'I%12l6%1B%ECv%3B%9CN'%84%10%90e%19%ED%ED%EDX%B8p!%1A%1B%1A0%7D%FAt%CA%EF%D7%CF%11S%D5H%12%91g%03%91%D2%05%FDq%EF%9B%1A%D3%89%1C%A7%A5%16%1A%06%D6d%AF%1Cr%B1%BF%BB%E3%91%05%89%A6%8C%CA%16%BE%173%E9%A5je%0C%A5%5B%A01%81l2%E4%BC%5C%00%88%A9%AA%CA%5Du%01%9D%D2%AA%A2%9B%BEgB%EB%87%26I%12%24I%82%10%02%8A%A2%C0n%B7%E3%F2%F3%CE%C3%A8%91%23%91%9E%96%A6*%8A%12%EB.%0C%AFe%D2%C5%D4p%D8%05%9B%AD%CB3%15%80%D5%F8%AB%13%A1%7D%FBN%B3%23%2C%19%E9o%DA%9AG%0Fs%DF%D8%CA%C1%EC%15%90h%93N%B5%F0%BDVf%CE7%E0%26.%0B%C8%AF%3Bx%E35%A7%A9lC%FF1c%D0%BE%7B%B7l%CF%C9%09u%BA%E7%0F%FEv%F4%20%AFh%17%D1%11%89D%20%88%90%DF%AF%1F%CE%3A%EB%2C%8C%181%02%0E%A7%131E%89(q%16%D5%9D%A3KRU%B5Mmn%1Eh%D7%DA%93%ECOuT%11w%E6%02%B1%F6v5%D2%D1fV%8F%94n%A1a%A0%A1%0E%F7xA%81%19%E7%26%222mp%D3%13ve%86%7C%2B%7DJ%CD%94%B14%B3%84%1A-%D1%19%DD%C8%0ApZ%1A%0A%C6%8DE%AC%B99%87%99%9B%99YN%EA%8A%D7%DC%F4%9D%19%F9%CCP%99%11S%14%B4%B4%B4%C0%E1p%60%CC%D8%B18%FD%F4%D31%F5%A4%93%E0LIALQ%A0*J%BBA2O%98%99%EB%19%18%7F%E0%EF%D5%03%1A%3BGZZv%B4v%84%CC%B8%80%95%5C%0F%C3%3E%26v%BB%3D%CBL%AFQU%B5%B9%D78%09%1150s%8E%81%8F%23%DF%C205%26%EE%E4L%22%CA4%01SU7%93%03%CB6d%0F%19%8C%D4%C2%02%D8%5D%CE%D1%88W%B3%C5t%8D%F5%BA%CE%B9%85%80%EC%CE%FE%BCDPb1%B4%B7%B5!%2F%2F%0F%13%26L%C0%8C%193%D0%AF%7F%7F%B4%B6%B6%C6%07P%D5%10%88%D4%24bL%10Qm%24%14%DA%9B%99%9F_%AA%BF%1BPUb%00%03q%01%A8%B2%1A%8Dl%F9%A9y3%BDA%16%A4%C5n%93%EF%E4%5B%E1%CC%BD%C6I%98y%AF%89%8F%A3%C8%C20%5B%93%E9%09%DAF%BA%999%C7%04%AC%9B%BA%135%AA%D3%89%C2I%13%E0%CA%CB%83%E4J%F9%AE%10b%133%EFD%92%80b%BC%B7%3F%1Fp%8A%3AB!%A4%BB%DD%B8%F0%C2%0Bq%F1%C5%17%23%2B%3B%1B%1D%A1P%02%20%0A%E2W%9B%24%3D%B8%00%3E%15mm%83%B5%EB%D341%ACBe%05*T0TfbR%A2Q%2B%95%FDf%09J1%98%84B4g%A2%19%ED%EC5%90%00%D8ab%95%94Z%00%DAW%06r6%91%E9%3B%D8h%8C2%BF%BFE%E3%26%9CPXa%B7%23%A5%A0%00y%C7%1D%07GF%26%A7%E4%E6%E5%B6n%DB%16%02%B0%16%80%CD%00p%11fn%88%9BF%8C%B6%B66%FC%FC%E7%3F%C7%EC%F3%CF%07%88%10%D3%AC%23V%94%10%88%1AL%C0%2BTU%7DW%00%E7i%2C%84%12%25%17%C4%02%C4%04b%22%01%09u%1F%7F%BA%D4%C2z%0FD%F2%CCy%06%10.%0F%04ZL%E64%D0%A4%1D%05%98%B9%A67A%120%A9%82%B7%A2tn2%E0%24%89%EFX%A9%F7%5D%D1%A9%17%10%81m6%0C%98%3C1%5E%95%97%96F%90%04%5C%E9%E9%970%F3%0A%CD%7FC%C9b.%9A%25T%1F%8B%C5%D4%DF%FF%F6%B7%EC%F5x%B8%AD%B5%15J%2C%A6%B0%A2%84%94X%AC%01q%85%1B%06c%90%AA%AAk%DA%B7mkH%2B*%9A%0C-%F5%0D%CC%40%0C%90T%09%12%CB%10%AA%C4%DC%16V%BEZ%F4%C2%07F%2FW%E9%F3%E5%02(5J%88ff%2B%AD%2F%06%9B%25%2F%25%B8%7B%AF%81%04%C6%B7L%24n%DENJ%8A%A2%7C%D6%A98%26%97%B3S%2Cp%A4'%3B%F9%97l%83%C8%C9E%D1%981p%E4%E4%40%B2%DBAD%9C%EE%F1%9C%D1%5E%5D%DD%08%E0%0D-%A19Y%60.%DE%B2Q%92%9A%DCYY%8DB%96%EB%15U%ADS%81%06%06ZA%A4%98%00%04%CC%ECb%E6%C7S%B2%B3o%D1%3C%BA%04EA%2C%12C%8C%19QV%11Q%15%8E%B1%8A%B6%C6%86%E5%B3_%F9w%93%C9%FB%0D3r%3Cj%DC%F8%03%0B%EB4%DA%C4%BC9H%E4%1E%16H%88%E8%F3dN%1E%DDD%26%9A%B8%89%5B%99yg2%EB%40%CB%BD%1C%BF%A0%B88%DBh%9C%B9%C1%E0z%00_0%81%D9f%E3%C2%13%26%23%A5%A0%00%F6%F4x%E9%26%09AL%C4%EE%01%03%FE%C0%CC%CF2s%B5%99%1F%87%88b%9A%FF%A3'%D9kB%D3y%16%87%FD%FE%5CGV%D6%09%D1%D6V%8E%B6%B6%22%DC%D2%82Pk%13BmM%08%B75%23%D2%D6D%91%8EV%DA%BBf%F5%C3%16%C6%BD8%D9Z%EB%8A%AB%3E%B10%CED%13%3F%C8%A6%B9%C1%60%EF%F9I%98y%B5%91%CBT%CB%0E%9C%0C%93%FCT-%D5%FF%7B%06%D1%60%9B%24I%A7%00%F8%97%89%DB%F5~%96m%7F%97%F2%F2%E0%9D4%09%AE%FC%7CHNg%FC%D6n%CD%D4H%C9%CF%2F%DE%BB~%FD%C5RA%C1%7CI%92%FE%0F%40%3A%F67%8F%E9%0C%A7%E8%8A%DC%0F%D8%98D%91%98%AE%C3%B4%FEo%12%EE%F9%D5%B1%FA%7D%2F%A8%E1%F0%0BM%9B%BE%E4%F8%1D%06%04%8EF%F5%96%9F%96p%40%DBW%94%CF%B3R%23%7C%06%0C%3A*js1L%3A%7F%AA%A4%C4%A6%AAj%A6%89%23m%A3%95%BD%B7%0C%12I%92v*%8A%125P%04%09%C0%A9%16%86Z%06%E0%7B%26E%E2%DF3%03%09X%AAd%BB%FD%8E%FE'L%CEO%F3%14%C3%96%9EN%C2f%D3%F7%19afF%EE%88%11e%81%95%2Bw%BB%06%0F%5E%24%CB%F2%F9%92%24%E5j%0Dv%8C%0A%CC%08%F1%BE%20%9C%E8%F7%A1%2F*%17%F1%14%83%88%A2(U%FBv%EE%7C6PQ%B1%80c1%3B%18%04A%8856%82%23%91%84w%17%00%88U%15%F6%AC%AC%BB%BF%DF%DA%183%D1G%862%F3p%93N%8A%B5%E5%81%C0%5E%13%FF%C7%F4%03%CC%BF%EE%F7k%5D%AF%82%E4%BB%DB%B6E%B5%FBe%26%1A%C89%D3%ECkY%96%FF%15%8B%C5%8Cn%AC%24%003%17z%3C%19s%83%C1%A4%B2%BB%2C%B8-%F2%D4%B7%BE%FD%CB%E2%F1%E3%FE%EE%C8%CD%85-%25%25%0E%90%FDW%9B%103s4%12%E1%FE%13%26%FC%F4%ABw%DEy%C8%E6%F5%FE%DB%EDv%9Fc%B3%D9%06%10%91%AC%AA*b%B1%98%A4%AA%AA%D0%15%8EwN-%D1%9E%8B4%DF%88%14%BF%CADU%14%25%14%0E%87%AB%AA%3F%FA%E8_%FE_%FD%FA%9E%98%12%CB%11%20%12%89%06%06a%7D%AC%93%12iK%DB%C5%F6%ED%F3-p%EC%1B%92%F5%C4%D5y%90%9F%B70%CEt%ADX%CEH'y%DB%AAL%ED%09%AD6y(*%7D%3E%C3%2C%EF%2B%B6nU%98y%A5%D98D%14%C4r%97%00%00%13GIDAT%F4%03%B3%C9%CC%F9%E7%E2%C73%07%96%7Caw%BB%19%DA%5D4%3A%BF%0D4%8E%81h4%CA%FD%C6%8E%FDA%C7%AE%5DS%3Fz%F7%DD%E7%1B%1A%1A%B6E%22%115%1A%8D%8Ah4*G%22%11%7B4%1Au%84%C3ag(%14ri%FFu%86B!g%24%12vD%A3Q%9B%A2(%92%A2(j8%1Cj%AB%A9%A9Y%F6%D2%8D7%AE%DD%F0%E3%1F%DF%DF%DE%DE%96%C3%91%08Q%24%02%84%C3%A0H%18%10%14%AF%BF%11B%ABG%24%02%D1%0F%E6h%B9%06%C9h%A1%C7%23%13%D1U%06%07(!%16%17Y%D0!%CF7%8A%11j%EB%B3%A6W9%896%E8R%22%BA%CE%E4%3B%B3%01%2C51%85%1Fe%E6%93%8C%16%83%99%7F%0C%E0N%B39%ED%FEt%F5%CC%CC%A1%C3%AA%85%241%BA%E9v%90%E0(%AA%AArzQ%D1%94~%CC%E3%FF%F1%F8%E3%8B%9C%F9%F9%ABO%3C%F1%C43%FA%F7%EF_%24I%12%C0%AC%B2%D6wV%A7w%A8B%08%08!(%14%0A%85%B7l%D9%B2f%F9%B3%CF%7C%24%BF%F5%D6%ACL%12%A3%9C%00%DB%13QT%EA%B6'H%E2%17%2F%94%07%02%2F%5B%D8%D8k%98%D9etU%10%80%7De~%FF*%93%83%EAf%E6%A10%BE%EEe%DD%DC%60%B0%B9%D7A%82%FD%C5W%DD%3D%3C%F1%BB%CB%00%5Co%E2%10%7B%A6%C2%EB%7D%DA%A40%3A%AB%C2%EB%FD~y%20%60x%5D%D8%A8%EB%AF%F3o%1F9%F2%86%FE'N%7DX%AB%84N%B4%13%EF%BC%E5Jk'%01Y%96%91%9A%95e%9Br%F6%D9sv%06%02%91%7F-Z%B4%AA%BA%BAz%ED%B0Q%A3%F2JKK%FB%A5%A4%A6%3A%B2%B3%B3S%04%11B%A1P%A8%BD%A3%BD%A3%A1%BE%A1a%FD%BAu%5B%F7%7C%F2%89%3D%A7%BE~%B4%BB%ADm%BA%8B%01A%60%98%B4%D0%D2%14%9C%9D%3Dhfw%87%C1%C6%26%1A%04%3Dh%E10_dddh%EB%F3%81%D5M%EFq%0F%A8%0A%AFw5%11%8DE%F2%E2*%02%60%DA%A2%BA%C2%EB%9DOD%DFO2%8F%84%02%D9V%1E%08%A4%5B%99%D7%BE%0D%1B%E6g%0D%1F~-%F6%9B%88%C4%CCP%14%05%91H%04%A1P%08%1D%1D%1Dhmm%E5%A6%A6%26jhh%E0%A6%A6%26%DA%B3g%0F%3AZZ%D4%E6%FA%FA%1D%1D%91H%A3%AA(%A1pC%83%DAZS%2BI%1D%1Dir%5Bk%3E55e%D9%23%11%A4%08%01%A7%10%9C%22I%E4%20%82%9D%086%22%C8D%10q%8B%AA%EB%0B%C4%B4F%C7%7B-%AC%EB%CD%00%EE3%BB%C4A%08%91%A2e%D3%1B%8D%B5%02%C0%A9%267X%CC(%0F%04%DE%3A%12%9C%04%00%961%F38%23%D7%3A%809%00V%99%B0%D6%DB%99%F9Z%23f%C2%CCi%15%5E%EF%5D%E5%81%C0%2F%CC%26%95s%FC%F1%D75UW%7B%DC%3E%DF%B9%AC%BB%012%9E%3C%1FO%26%8A%3B%BATJd%C7%3B%9C%F1%2C%B4%F6%F6v%11)%2C%2C%0A55%15%B5%ED%DC%89%E0%E7%EB%10%DB%BC%19%92%12%83%1C%07%03%3Be%19%0E!%C8FD%5D%C1%D15%0BJw)%C2x%2B%00%A9%F4%F9%5C%CC%7C%8F%C1%25%0E%09%1D%E2%253%80%3CUR%E2VU%F5T%23%8EDD%ED%AA%AAZ%EE3%DF%E3%CC%26%22z%D6%E0%DF%12y%93s%CD%C6)%F3%FBwh%E6p%D2%C4%17m%ADn%5D%E8%F1Xj%91%90QR2%B3q%CB%96%17%F4%8B%AC%07%89%C3%E1%40Jj%0A222%90%95%95E%B99%B9%E8%DF%AF%1F%0A%06%0C%C0%80%BC%3C%E4%A5%A7%23-%1A%85%B4%7B7%B2%04!K%92%90)I%C8%90%24J%13%82R%88%E0%22%82C%03%89%A4q%0F%3Ap%23%13%1CdT%99%DFo%C9%C4d%E6%0A%ED%C0%26%B5%F8%B4%84%26%D3%066%AA%AA%96%1B%D5%24i%26%FDJ%23%CB%F1%B0A%A2%AA%EA%17D%B4%C5%C0%93G%CC%EC%AE%F4%F9.%B20%DC%8D%06%0D%E5%12%A7%8AI%88%95V%E7%975x%F0%B7%F7%AC%5E%7DG%A2%1BQB%2F%91e9%0E%92%94%14%A4%A5%A5!33%13%B9%B9%B9%C8%CD%CDE%BF%DC%3C%E4%B8%DD%C8%14%84%D8%B6m%C8%8A%84%91I%84%0CY%86%5B%92%90%26IH%15%02)B%C0%25%04%EC%1A%17%91%F6s%12%7D%16%DCNM%C4X%02H%A5%CF7%0B%C0%B7%0DZ%8C%25%80%B7%CCJ%B3B%00%B7%24%CB8%D3%01gAO%F6%BC%C7%20%99%1B%0C%B2%D6n%89%0CB%FE%60%E6%9F%99%8D%A5%5D%D4%F3b2SM%939%04P%C9%C2%F1%13%1F%B1%3A%C7~%13%26%FCj%FB%8A%15%B3%C2%8D%8D%8D%BA%86%B9%90e%19N%A7%B3%13(n%B7%1B%D9Y%D9%C8r%BB%91!I%B075A%D9%B6%0D%19%CCH%17%02i%BA%8FK%0884%80%D8%88%20%C7%17%8Fuz%08%01xA%08%E1%B3%22b4%937%8F%99_2%AA7%D6%F9m%BEoa%BC%93%10oYF%06%3Ac%0B%80%D7%8F(H%B4%89W%24%AE3K%A2%970%80I%15%5E%EF%18%0B%AC%F6%7BH%DA%3E%5B%13%AB))%9C9t%C8u%C1%A5K-7%CF%2F%9E1%E3%D5%957%DEX%5C%FF%C5%17OAQHs%D7%B3%5E%FC8%9DN%A4%A5%A6%20%C5%26%C3%19%8D%A0%E1%F3uH%EF%08%C1%0D%82%5B%96%91.IH%95%2485%80%D84%EEA%BA%86%80%BA%12%D7%0B%CA%03%81o%CF%A9%AE%8E%F6%60%1D%3F%D1%F6%80%8C%BFF%0F%95%F9%FDA%0B%E3%FDF7%A7%EE%94U%02%F0fy%20%D0p%C4AR%E6%F7o%02%F0Q%B2%AC%2F%1D%5B%B3%D2R%B2%91%88~%D1m%C3_%26%C0%E1%84%DC%AF%1F%8D%B8%E8%02N-)yv%F3%E2E%13%AD%CE%F3%8Cg%9Ei%CB9%FE%F8%B2u%8F%3E%3A%A2i%CB%96W8%16%23%9D%18%03T%15J%24%8CHc%03%1A%B7n%C3%DE%AA%B5%A0h%14Fi%1C%5D%DAtn%07p%A3%10%C2g%C5%0F%D2%C5%02yE%3B%F5F%D2%96%99%B9IU%D5%9FY%E0%22%C3%01%CC%D0t%C2d%FA%1D%00%FC%B9%A7%FB%7D%C8)%F9%CC%FCg%233Z%E32%B3%B5%8EDf%A0%FB%03%80%2F%0F%E2%246%3B%D8%ED%C6%A8K%2FA%C6%C0%81%E4%CA%CBe%CF%19g%AD%DC%F0%C4%13%A3z2%D71%3F%FC%E1%86%AC%C1%83g%AF%B9%FB%EE%92%FA%0D%1B%EEm%DF%B5k%2B%B4%8B%13%A3-%AD%DC%BEc'%B6%BE%F3%0E%A4%D6V%40Q%18%07%B5%81e%D6%E9N*%11%BDID%17%08!J%CA%03%81%87%E6TW%2B%3D%04%C83%00f%1A%89%19%DDy%BB%EA%CA%9A%1A%D3%A25!%C4%1F%92%ED%87%AE%A7%EB%96%F2%40%E0%FD%1EK%0E%1C%06Ux%BD%3B%01%F43R%BA%00%BCV%1E%08%98%B6%A8%AC%F4%F9%863%F3%86%CE%85%132)%E9%E9%18%F2%AD%8BPr%FAip%0F%2C%85%23%2B%13B%B6%B1%12%0A%85%B7%BE%F0%C2%94%E3%E6%CE%AD%3A%94y%3F%E5%F5%CAC%E7%CD%F3%15%CD%981K%D8m'%ED%DD%B0a%C8%AA%07%1E%F2%8A%86%067%D4%03%F6%5BE%3C%23o%0B%80u%9A%C7%F9%83%F2%40%A0%E90%D6%EC%19f%BE%5C%08ax%85%AD%26%CE_%2C%F3%FB%BFea%CC1%00%3E3*WQU%15Dtuy%20%F0%F8Q%05%C9B%8F%E7%26%22%BA%DF%88e%AA%AAJB%88%A9e~%FF%87%16%5E%F6%3A%00%8F%90dc%25-%95Jg%CFB%E9%993%E0%1E8%08%8E%EClH%0E%07H%08%A8%AA%CA%1C%8D*%C1e%CB%CE*%BD%F0%C2%E5%E8%05%AA%9C1%D3%8E%EAm%92%1Am%934%A5%5C%25%22E%08%11-%F3%FB%95%DEx%86%26bf%26%A2%CD%26%B7%7C%ECP%14%A5t%5Emm%D8%C2%B8%EF%10%D1%B4%EE%5C%2C%3A%EE%DC%A8%AAj%DE%9555%CAQ%05I%A5%CFg%D3%0A%C5%D3%92%B9%81uln%88%25%E0%0D%1A%F22%BB%9C%E7%0D%9C%3D%0B%03g%9C%0Ewi)%9C%D99%9D%B9%22%FA%16%0E%AC(T%FF%C5%17%B7%E5%8D%1E%7D%17%8EaZ%E8%F1%E4iJ%AA%CF%E4%12l%FD%E5Oc%CA%03%81%B5%16%F6%E0Bf~%11%E67z%FE%AC%3C%10%B8%E7P%E6%7FXe%82Z%DB%AA%3B%60%DE%A0vp%A5%CF%F7c%2Bcnjh%BCh%F0%25%17%7FQ%3Ac%06%DC%03K%E1%CC%C9%E1%04%07%D1%2B%60DD%24I%9C%3Bj%D4%9D-55%AF%FC%1A%B0%1F%8B%00%A9%F4%F9fi-%20%BCf%B7%A4'%1A%F7%01%B8%DC%0A%40%16z%3C6%00O%C2%A0%FDz%C2%EC%15B%DCw%A8%EFp%D8%B5%A4%E5%81%C0%3D%CC%DCh%D0%95'%E1%D8%B9%BB%C2%EB%F5%98%8D%F7%87%7D%7B%94%CC%BC%FC%C9i%1E%CFngN%0E%24%BB%03B%96%3B%9Db%DD%3D%26%B5%A8h%E6%2F%5B%5B%9Bv~%F8%E1%B9%C7%108%5C%15%5E%EF%3F%98y%09%11%09%9D%EF%C2H%C4%10%80%5B%CB%03%01%2B%BD%F9AD%F3%9993%99_%04%FB%EFN%FE%D5%9C%EA%EA%D8%D7%06%12m%B27%1BX9%898%8C%80Y%B6%99F%23%AE%BD%B65%F8%9F%FF%8CP%23%91f!%CB%A4Ou%A4%03%AFG%EDtV%C8))%8E%FE'%9C%F0j%DB%EE%DD%EF%7Dx%EB%AD%DE%AF%13%20%15%5E%EF%CDZ%82qROjw%00a%E6%FB%CA%03%81%3FZ%7C%C6)0%C8%F0%D3%89%9F%DDs%83%C1%BF%1E%D6%FE%F6%E2%C2l%0208%E9%A2t%B6%95%12%7F(%F7W%FF%C2%CA%98%EB%E7%CF%CF%2F%BD%F4%D2M%8E%AC%ACL%AB%13M%B8'%DBv%ECxq%C3c%8F%DD%3A%F9%F7%BF%3F*w%06k%09C%D7h%E27%CB%A8%1BS7z%251%F3%7Ds%83%C1%1F%5B%7C%96%9B%88v%11%91%D3L%7C%018%B7%3C%10XzL%80d%A1%C73%5C%08%B1As(P%E7%F0%D4i%C8%03B%02%0B%09%E1%F4%F4%93%AFY%FD%E9%7BV%C6%FD%F0%B6%DB2G%FD%F0%87U%AE%FC%7C%2F%E9%40%60%01(%00%40%AD%3Bv%7C%B0o%ED%DA%07%AB%1E%7C%E0%D5%0B%96.k%E9mph9%A97h%19e%AE%C4%09%B62O%EC%CF%11%B9%D5*%07%D1%0E%E4%C7D4%D1%CCB%22%A27%CB%FC%FE3%0F%F7%1D%A9WOS%C9%C0%FB%04%F3%CD%90%A4x%D1%14%11%40%02%2C%CB%A0%14%17%1Cyy%9C9%A8%14%03%86%0FW2%8B%8BK%BD%B3f%05%AD%8C%FB%8F%09%13%9Cg%BF%F0%C2%F2t%AFw%8A%AE%A4%C0t%03TU%D5%BA%ED%82%22%8D%0D%E1%C6%CD%9B%97%87%EA%EB%FF%F9%C6%23%7F%5B%EE%EA%88%EC%9A%B3bY%C7!%80%22W%AB%8B%B9%18%F1%AC%F6%E1%06!~S%11%A3)%A9%CF%F5%E00%3EAD%F3%CC%EEO%06%40%B1X%2Cm%5Emm%DB1%05%12%00x%FE%C4%93j%A4%F4%F4B)5%15r%86%9B%DC%F9%F9H%CD%CB%83%BB_%7F%B8%F2r%E1%C8%CAd9%3D%1D%92%DD%B1o%E99%E7%14%7Fg%F3%E6%90%D5%B1%F7VU%DD%9F%3Db%C4M%24%84%E1%86%E8o%B6%D2%EE%A4Ah%DF%3E4m%DE%CC%AB%2B%9F%A6%C6%8F%3E%02B%ED%DB%C1%ECG%BC%81%DD%97Z%8F%B2%3A%C4%FB%BA3%E2%F54%E9%88W%F7%0FB%BC6w%20%E2%E5%ACN%BD%DC%EF%01%40%F4%26%EEv%003%ADX1%3A%80%DE%CC%CC%F7%99%3DJ%7B%FF%2B%CA%03%81g%7BE%E7%ECm%90T%FF%E3%1F%23%D8%E9XgKOg%D9%E9%84p8Hr%3A!9%9D%B09%5D%10%0E%07d%BB%03d%93%11%AA%AB%5B%7BmQ%D1%B8g%CC%DBZt%D2%B6%97_%9E%5Dx%DAiO%DB%D2%D3%DD%E8%86%AB%1C%00%10%00j%2C%86hs3%9A%FD%D5%D8%FA%FA%5B%F8j%F1bPS%23%13%2B%894v%D2%2B%C4%BA%CB%0C%A1%AB%B7%E9%AA%0C%F6%98s%E8%B9%07%11%BD%18%8B%C5.%B7%E2(%D3%89%98%8B%01%2C%B6%E0%88%033%BF67%18%9C%D9%5B%7B%DA%EB%20%01%80%DA%15%2B~%945%7C%F8_H%96%20%249QU%07H%02BHZ%13%5D0%09%89Z%FC%FE%F7G%97%94L%F3%F7%E0%C6%88%97%CE%3A%2B%ED%94%07%1F%7C*c%F0%E0%0B%B0%BF%16%85%F5Mk%98%19%AC(%88%85%3A%D0V%5B%8B%BA%CF%AA%F0%F1c%8F%01%3Bv%01%B1%C8Q%B3tt%D1rb%E6%26%22%BA%AA%CC%EF%7F%A1%87F%C1L%C4%EF%11b%13%2F-%98%B9%D1%E1p%E4%7D%E7%AB%AF%94c%1A%24%00P%BFy%F3k%EE%92%92sHP%E2%82%92%AE%26l'%17h%F6%FB%DF%3B%BB%A4%E4%D4%0F%7B%C0Q%00%60%EBK%2FM%2F%3C%E5%94JGff%E1%01%20%D1%DAy%2B%91%08%3A%F6%ECF%E3%17_%60U%E5Sh%AF%FA%1C%08wX0%3Az%07%1F%1A0%12S%7BHU%D5%9FY%09%D6u%05%083%BF%A2%C5z%C8%82%954in0%F8io%BE%C8%11%5B%A93%01%E9%E5%86%86%80%DD%ED.%E8j%16%EBX%7B'PZjj%3E%F9%B5%C7s%E2_%E2%7D7zDu%EB%D7_%EF%F6z%EF%91%D3%D2RYU%19%AAJJ%2C%86p%7D%3D%9A%B7~%85M%AF%BC%8A%E0%ABK!%DA%DA%E2%7D%CB%88%8E88t%96%CB2%22%FA%BE%95%7C%10%13%11CfI%D2%00%AE*%0F%04%9E%E8%ED%17%12Gj%A5%5E%07%94%2F%9F%7C%F2%14%25%14o%FB%D4%DD%0D%DEz%F9%9E%5E%5C%3C%E9%AE%BD%7B%BF%5C~%E5%95%99%3D%7DV%EE%88%11%8F%D8%D3%D3%D3%9A%B6l%B9!%DC%D0P%CF%AA%82hs3%B7o%AF%C5%F65%9Fq%E0M%ED%02E%AD_k%2F%8B%13%EE%AA%94j%DD%0A%5E%22%A2%D2%F2%40%E0%9CC%01H%A5%CFw3%E2%F7%19%B2%811%A7%CFmYp%24%00%82%A3%C1s%B7%BC%F0%C2)%BE%D9%B3%DF%166%1B%9B%D8%F4%C4%CC%1C%EB%E8%E8%D8%FA%CF%7FN%3E%AE%ACl%FD%A1%3E%D3%FF%FA%EBg%B8%B22%7F%B2%7B%ED%DA3%AB%16%2C%04%EF%DE%03D%23%87%A5t%26%E5%EF%076%EF%DB%07%E0A!%C4%3DfY%ED%16%CD%5CC%11%A3%B3%94%96%97%07%02%A7%1F%A9%3D%3C%E2%20%01%80%C0%B2e%97%14%CD%98%B1%C8%CCtM%2C%BE%1A%89P%5DU%D5%9C%FE'%9C%F0%F4%E1%3C7%07%90%EF%3B~%C4%15hm%BD%1C%E03%BB%11w%3D%BA~%BE%ABr%ACY%3E%B5%00%9E'%A2Ef%95u%16%3D%A9o%00%98d%E2%7B%D1%17%B6W)%8A2a%5Em%AD%F2%8D%06%09%00%D4._~u%C1%C9'%FF%0D%E6%3E%8E%CE%13%DA%B8y%F3%A2%D9C%87%5E%B1%D2%BC%09%9DU%16~%82v%E3%D4%14%22%9A%A4%5D%07%22%C1%F8%A2%A6%C4%A9%8D%01%083%F3z%22%FA%80%88%3Ea%E6%E5f%D5%FD%3D%D0%3FN%01%B0Ts%B5%5Br%E5%03%D8%CC%CC%A3%E6%06%83%E1%23%B9wG%0D%24%00P%B3b%C5u%85%D3%A6%3D%02%0B%1C%A5sgZ%5B%1B%FD%AF%BCr%DE%90%EF%7C%E7%BD%231%A7%0A%AF%B7P%BB%ED!%87%99%DDD%E4PUU%08!%A2%88%F7Im%D4%BA%1Cn7%EBQv%88%DC%C3FD%F3%11%0F%D6%19%FA%40%BA%88%98%CD%CC%3Cvn0%D8~%A4%F7%ED%A8%82%04%00%82o%BCQVx%EA%A9%15%24I%96%DC%EB%09%96%DB%F0%E5%97%CFn%98%3F%FFG%D3%1Ex%A0%0E%FF%25T%E9%F3%5D%08%E0I-%DC%0F%2B%B6%B9%C6E%AA%98%F9%84%23%CDA%BE6%90%00%40%F5%92%25%B3%8A%CE8%E3e%C9n'%2B%20I(%00%B1%B6%F6%D0%BE%F5%EB~%BB%F4%82%0B%EE%9B%B7kW%F4%9B%0A%0E-'%F5%AF%00N6r%90u%E3s%01%80%E5%8A%A2%9Cy%24u%90c%02%24%00%F0%C5%82%05%E3%06_r%C9%7B%92%CB%E52r1%13%91%96%C4%0B%B0%1Ag%2B%1D%3Bw%EEn%AD%09%FEf%FE%94%A9%8F%FF%BE%97%F4%95%A3AZ%A4%FC%0F%CC%7C%9EN%B4%18%EE%83%CE%C4%26%CD%CC%9Dw%B4%E7M_%E7%A2-%BD%F4%D2%CCi%F7%DF%FFV%EA%80%01%E3%F4%8B%D1%25%5E%02VU%B0%CAPc%11VBa%0A74p%C7%EE%DD%D4%B8m%EB%9E5%8B%16%DD%AB%84%23%8F%95%BD%FEz%F31%0C%8E%93%B4%C2%A9%19%DA%0BZ%B6%C2u%D1%E2%AB%8E%94%1F%E4%98%06I%82%EA%3E%FF%FC%B1%9C%91%23%AF%D17%BCK4%CA%05%00VbPBaD%5BZ%D0%BEk'%3Av%ED%E6-%EF%BEK%B5%2B%DFg%AA%DFG%08Gb%60u13%CF%9F%1B%0C%BEw%2C%BC%93V%DD_%0E%E0%16h%97!%9A%F8%3D%BA5%B5%B5f%C4g%F5%B6%AB%FD%1B%07%12%00%F0%2F%5BvN%E1%B4i%2F%0B%A7S%063%B1%AA%B2%1A%8B%91%1A%89%20%DA%DA%8AP%5D%1DB%BBwa%C7%E7%EB%B0%F5%8D7%10%DD%B1%03%D4%D1%C1%AC(%09%B6%93x%97z%00%0B%98y%F1%DC%60%F0%E3%A3%F9%0EZ%87%A1%8B%00%94C%EB%0F%A2%DF%F0%1E%A6%9B%103%BF%E6p8%CE%EB%CD%60%DD7%1A%24%00%F0%8F)S%D2%CE%5E%B4%E8Ugv%F6%C9%D1%8E%0E%8E%B5%B6R%B8%A1%1E%E1%3Du%D8%B7u%2B%B6%BD%F5%16%9A7o%86%08%87%80h%F4%007%BB.%AC%AF%07LDk%09%BA%8C%99%DF6%BB%9A%FD%10%B8%85MU%D5%E9%CC%3C%9D%88%CE%070T%BF%D1%9A%3C%B1%1AM%EC%0C%08j%A0%EA%B5%7C%90%FF*%90t%3A%DE%DE%5Eq%B9%B0%DB%17%84%F7%EC%B1%EF%DC%B0%91w%AEZE%CD%5B%B7%40%0AG%80H%18%067x%EB%BD%94%9C%A4%AD%C5z%22%FALU%D5%0DD%B4UK6%DA%A9%AA%EA%BE%AEw%D6%3D%5EP%40v%BB%3D%0B%40%3E3%17%11%D1%40%C4%5Bq%8FF%BC%91n%A6%26F%3A%FB%B5%1EB%8EI%E7%DFi%40%7F%23%16%8B%5D%D8%1B%19e%FF%D5%20%01%807%2F%BD%5C%DE%DE%DC%F88%FB%FD%E5%A4(%40%24%1C%CF%9D%ED%85%20%5D%17n%93%7Cq%BA(%D0%5D%5C%E5%9D%D1%DECYG%7D%BCJ%FB%FB%DD%00%AE%3C%DC%A4%E5%FF)%90t%FA%14J%07%0DB%2C%FA%18%11M%3F%D4%D3z%2CQ7%E0ha%E6_%1Dn%D9%C3%FF4Ht%0E%A8%09D%F4'f%3EU%2F%C3%ADZ%0C%C7%008%F4%9D%AA%89%E2W%A3%FCQ%08q%DF%E1%14N%F5%81%A4%7B%B0%8C%04%F0%0B%00%17%02ptm%C9y%8Cs%0D%20%DE%A1%E0nUU%17%1CJ%F1v%1FHz%E6%A0%CA%13B%5C%CE%CC%D7%25%AC%0A%1D%60%8E%05%91%A4W%9C%5B%00%BC%09%E0%CF%87%D2%1F%A4%0F%24%BD%03%98%91DT%0E%60%26%80a%09%C0%E8.%0E8%1A%A0%E9%F4%18k%5C%ADMk%8F%BE%00%C0%EB%3DmA%D5%07%92%23DO%95%94%90%A2(%3E%CDgq%96%963%92%DD%D529T%D0t%FD%BBn%AC%A4u%CC%FC%01%11-f%E6U%3Di%83%D9%07%92%AF%89%16%14%17%3B%84%10%05%00N%010%05%F1%5B4%86%01%C8Kb%F2%EAE%84%91B%AC%02%D8%84%F8%7D1%EB%00%BC%CD%CCk%AC%F6j%EF%03%C97%80*%7D%3E%19%401%E21%95Bf%CEG%BC%C8%3BU%7F%DF%0D%11%C5TUm%D6%AEE%DD%A9%5Dj%B8%95%99%9B%AD%DC8%D5G%7D%D4G%7D%D4G%7D%D4G%7D%D4G%7D%D4G%7D%D4G%7D%D4G%7D%D4G%7D%D4G%7D%D4G%7D%D4G%7D%D4C%FA%7F%5E_%A9%BB%EE%093F%00%00%00%00IEND%AEB%60%82\" onclick=\"javascript:sendToFLV();\"/><div style=\"position:relative; top:0;\"><select id=\"methodselector\"><option id=\"embedded\" value=\"embedded\">"+embeddedstring+"</option><option id=\"newtab\" value=\"newtab\">"+newtabstring+"</option><option id=\"newwindow\" value=\"newwindow\" selected=\"true\">"+newwindowstring+"</option><option id=\"standalone\" value=\"standalone\">"+standalonestring+"</option></select></div></td></tr></table>";
			}
			if(replacemethod === "standalone"){
				flvideoreplacer.innerHTML = "<table><tr><td width=\""+videowidth+"\" height=\""+videoheight+"\" align=\"center\" valign=\"middle\"><img id=\"flvplaceholder\" src=\"data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%89%00%00%00%89%08%06%00%00%00%18%24%1B%C9%00%00%00%01sRGB%00%AE%CE%1C%E9%00%00%00%06bKGD%00%FF%00%FF%00%FF%A0%BD%A7%93%00%00%00%09pHYs%00%00%0B%13%00%00%0B%13%01%00%9A%9C%18%00%00%00%07tIME%07%DB%03%1C%10(5%FE%8A%1DB%00%00%20%00IDATx%DA%ED%5Dy%7CT%D5%F5%FF%9E%FB%DElY%26%7B%80%2C3%13%C2%26%B2%AF%82%E2%82%B8%02n%B5j%B5%24H%D5%BA%D4Vm%FBk%AD%DD%5DZ%AD%D5%D6%0DmUH%5C)%D6jQ%A1.%E0%82%3B%60%10%10A%203%93%B0%87%EC%CBl%EF%9D%DF%1F%F3%26%3CB%E6%BD%17%08%88m%CE%E73%1Fc%98%DCw%DF%BD%DF%7B%F6s.%D0G%7D%D4G%7D%D4G%7D%D4G%7D%D4G%7D%D4G%7D%D4G%7D%F4%3FA%F4%BF%F0%92%CF%94%96%8AH%24%92%22%84%18%01%60%2C%11%0Dc%E6b%00E%00%FA%03%C8%01%90%92%E4%CFU%22j%60%E6%BD%00v%00%08%00%08%10%D1%E7%CC%BCZ%92%A4%9D%DF%DD%B6-%DA%07%92o%18Ux%BDN%00%3Ef%9E%25%848IU%D5%B1D%E4%01%00%22%023%03%00%13%D1A%EF%CF%CC%E8%FAk%FD%EF8%FE%C7%FA%2FD%01%7C%06%6053%2F%05%F0%FE%DC%60%B0%BE%0F%24%C7%260r%00%9C%06%E0rf%9EJD%FD%12%7BLD%C4%CC%DD%82%E2PI%3F%5E7%C0Y%03%60%19%11%3D%AB%AA%EA%17s%83A%EE%03%C9%D7D%95%3E%9F%83%99%CF%06p%1D%80%93%01%B8%12%DC%22%B1%97_%C3%3B%B2%06%1C%D2%E6%B2%85%99%17%13QE%99%DF%BF%A9%0F%24G%8Fk%94%02%B8%11%C0%E5%00%F2t%07%9A%88%88%8F%B1%F7b%00%A4%89%B8%8F%98%F9%CFs%83%C1%17%FA%40r%84h%A1%C73%1E%C0%EDDt%16%11%89NT%F4%B2(%E9u%94%C4u%1ANp%17%00%BB%98%F9n!%C4%C3e~%7F%B4%0F%24%BD%C39F%03x%40%13)%9D%A7%F3%18%C6ER%B8%00D%F1%1F%88HP%8Bp8%EE%F8%EE%C6%8D%F7%F4%81%E4%D09G%0E%11%3D%09%E0%3CM%BE%F7%AA(%E9j%C9t%B1b%BA%FB9!%3Az%CE%B9X%D3%5D%89%C0Bb%08%89%20I%AC%DA%ED%84%B4%B4%C6%C2%13%A7%DC%7C%E6%BD%F7.%EC%03I%CF%B8%C7%AF%01%FC%AE%8B%22z(%2C%5E%1B%E2%00v%9F%A0%ED%00%FC%00v2%F3%3E!D%0B3%87%98%99%85%1023%A7%02%C8%04%90%AF%F9TJ%13%CA%B1%01hu%BFc%80)%FE%7FB%02l6%A8%92%0C%CAp%23%BD%B0%08Y%83%06r%B6%D7K%EE%82%02%96SSIJI%D9%DC%B1c%C7%85%A5%17_%FCE%1FH%8C%C11%16%C0%12%00%85%87%60%BEv%9E%F4%84%B2(%84%003%87%00%2C%07%F0%3E%80%8F%99%B9jn0%B8%EF0%E68%1C%C0D%00%93%01%9C%0A%E0%B8%83%E6AD%04%02d%1BX%B6%01%E9%A9%C8%19%3A%14%F9%23F%20%BB%D4%07gn%1E%EC%EE%0C%C8%A9%A9%90RR%20%3B%1C%20Yf!%CB%D4V%5B%7B%7F%CE%F1%C7%DF%D2%07%92%EE%17%FFn%00%FF%D7S%B1%D2%8Db%08%00%2B%01%2C%06%F0Jy%20%B0%ED(%98%E3%E70%F3l%10%5D%06%12Y%B0%3B%C0N%07%3B%0B%8A%A8%60%E2x.%1C9%92%9Cy%B9%B0gf%C2%96%91%01%D9%E5%82%ECp%40%D8l%20!%00I%8As%26%22%90%10%14il%AC%DD%F6%F2%CB%E7%1C%3Fo%DE%FA%3E%90%C4%C1Q%08%60%19%80%11%09%3F%83%19%E7%D0%5B6%BA%F7%F8%84%99%E7K%92%F4%DC%9C%EA%EA%F0%D7%A6KM%9E%3A%C1%D5%2Fo%CE%D0%B3%CF%9E%9B%3D%A8%D4%ED%C8%CA%863'%9B%A5%94%14%92%5D.%08Y%06%C9r%1C%1CD%10%89W%3D%F0%95Y%8DF%A9%EE%F3%CFo%EA%3Fq%E2_%FF%A7AR%E1%F5%9E%03%E0e%00rODJ%02'%00%9A%01%FC%8D%88%E6%97%F9%FD%DBp%8C%D1%9E%D5%AB%2F%92SS%7F%96VT4I%D8%ED%00%11%93%10%07%BDjW%259%A1L%81%88%9A%BE%FAji%D9%90!%B3%97%00%CA%FF%1CH*%7D%BE%3B%99%F9%17H%12G1%D27%88h%97%AA%AA%B73%F3%DF%AF%AC%A99%E6%7D%0D%1B%9ExbL%C1%B4i%BFO%F7%F9f%0BY%86%FE%9D%BB%8B%17ur%13f%82%AA%A2c%EF%DE%ED%FE%25KN%19q%CD5%5B%FF'%40%F2xA%01%D9l%B6%17%01%5C%A0-%96%95%B9%248G%03%80_E%22%91G%AF%DE%B9S%C17%8C%D6%3E%F8%E0%F1%DE%B3%CF%BE%C7%5DZz%AE%15%C5%5Ce%06%14%05%D1%B66n%AE%AE%8En%FF%F0%A33%C7%5E%7F%DD%3BGs%CE%E2k%E0%1Ev%9B%CD%F6%01%80%0B%88(%A1%7B%98%EA%1F%CC%0Cf%FE%0B%11%15%96%07%02%0F%7F%13%01%02%00%A3o%BCqC%E6%E0%C13%BF%7C%E2%89%A9%1D%7B%F7n%D1%BF%A3%A9%9CU%14%5B%7Du%F5%DB%0BG%8D%BB%E4%BF%16%24%0B%8A%8BS%98%F93%00'h%16%8C%99xI%AC%DD'D4tn0xs%99%DF%DF%81%FF%02%1A~%F5%D5%1F%A6%F6%EB7d%EF%9A5%3FQB!%D5%12%D7%D7%94%15%0A%B7%2F%AA%F0%F9%AE%3EZs%95%8F%26%40%84%10UD4%D8%CA%A9%D1N%17%01%B8%B9%3C%10%F8K%2F%2B%CBC%88h%A4%AA%AA%25D4%0C%80%17%C0%00%CDq%E6%D4t%9F%18%11%B5%02%A8%03P%03%A2%AD%ECJ%F9%0A%05E%9B%8E%1B%3B%EA%B3%C9%F7%DE%DB%DA%1Bs%C9%1F%3F%FE%CF%1F%FE%E2%17%8BG%DFt%D3%BF%5Cyy%E3%F4%96%5B%92U!%80%19%8C%BFUx%BDry%200%FF%BFB'%A9%F4%F9%EC%CC%FC%19%11%0D%D7%16%C0%F0%D9%1A%86v%10%D1%A9e~%FFW%BD%F0%FC%91%AA%AA%CE%24%A2s%01L%05%20%E9%AD%0A%9DE%A1%B76X%17%EE%07%1C.pN%16F%5D%F6%1D%F4%1F%3F%0E%CE%FE%FDw%0AIz%AD%7D%C7%8Ee%97M%9D%FA%AFwz%C1%F2%D8%5BUuW%CE%A8Q%B7%EA%DD%00%3A%9D%04M%5B%B7b%FDs%CF%A1v%C9%2B%40%A8%23%A1%C8%97%CF%0D%06%2B%BF%D1%20%D1%94%D4%0F%00%9C%60%A4%A4%26%C0%A3m%CC%92%F2%40%E0%BC%C3%E4%16C%01%5C%03%60%1E3g%26%0Ef%8F%1Cu%89x%9C%DD%09%CA%CB%C3%98%2B%CB%91%3Fj%14R%8B%8B%D9%EEv%93%B0%DB!%24%09J%24%82%8E%3D%7BV%86%EB%EB%1F%CD%1B3%E6%99%C3%99w%F5%92%25%D3%8AN%3F%7D%B9%E4tJ%DD%83%E4y%D4.Y%02%0A%85%C0%E8%B4%F4f%97%F9%FD%AF%7Ccu%12%CD%8A9%81%88%ACp%10%02p%F7%E1%00%A4%C2%EB%BD%AC%C2%EB%DDHD_%02%B8%05%40f%E2%D9%3D%F3%E4%26%00%E2%80%D4%AF%1F%C6%CD%9D%8B%BC%B1c%90%E6%F5%C2%91%91A%92%DD%0E%8A%BB%FC!%D9%ED%9C%5E%5C%7CR%EE%E8%D1OG%DB%DB%B9%7D%CF%9E%F9o_%7F%7D%C1%A1%CC%BFd%F6%EC%F7%D6%3D%F2Hi%B4%A5e%9F%8E%AD%F2%81%AAZ'%B7K%18G%2F%2F%F4x%C6%7D%23AR%E9%F3%DD%99%B0b%B4%CD%A1d%D6%8B%F6os%CB%03%81%9F%1F%E2%B3~T%E1%F5%B6%02x%0E%C0%D0%84%98%D0YP%3D%E3%9C%1C%07%08rs1j%CEw%913f%14%D2%8B%8Aaw%BB!%ECv%40%88%83%C6gf%96%5D.8%F3%F2%BE%7F%CA%C3%0Foo%DB%B5k%E9%A7w%DC1%A8%A7%EF2%EE'%3F%09%FEc%D4%A8%E2%B6%1D%3B%D6%92%10t%10%3A%BA%88f%0D%2C%EF-%F4x2%BFQ%20%A9%F0z%CFI8%CA%2C%98%B7DD%E7%97%07%02%15%87%F0%9C%2B*%BC%DE%06f%FE%0B%B4%8C%F7%C3O4%E1x%60.%DD%8D%11%97%5D%86%BC1%A3%91%E6%F1%C0%96%9E%DE%E9N%D7%01%E4%80%93%DD)%A6%00%B8%F2%F3%CF%9Ap%DBm_5%07%02%FF%7C%F9%AC%B3z%B4%81s%02%81%D0%B5%85%85%E3Z%FC%FE%F7u%0F9h-u.%04%17%11%BD%F5%8D%01%89%16%8ByY%A7%83%98%01df%99%DF%FF%EF%9E%3Cc%A1%C73%AC%C2%EB%FD%8C%99%9F%26%A2%0C%1D%FB%3DL%7C0%20d(%A9)%18z%FE%F9%E8%3F~%3C%D2%8A%8B%E1HO%87%A4%05%E3%0C%3C%A4%E8%0ARf%E6%B4%E2%E2%0Bg%BE%F4R%C3%EEU%ABn%ED%C9T%9E%06%D4%11%25%25%D3Z%02%81%F7H%08bfp%02(%D4%ED3%C7-%F4x%1E%FB%A6p%92e%D8%1F%8B%A1%24%E0%60%00%24%848%BF%3C%10x%AD%87%A2%E5%D7D%B4%11%C0haa%D3%0CD%9C%DE%9A%D2%00%22%C0N'%06L%9B%86%A2%93%A6%22%CDS%0CGF%06%C8fc%8AGj!%84%B5e%23%1D%09%87%83%F3%C7%8F%BF%ABm%F7%EE%8Dk%1Fx%60%B8%D5y%D6%00%3C%AD%B4%F4%D4%8E%BA%BAO%A0*%14%D7%DB8%B9%90%24%BAF%8B%87%1D%BB%20%D1%C2%FD%23%8C%8E%B4NG%99%DB%13%0ER%E9%F3eW%FA%7Ck%98%F9w%9A2J%3D%10%2F%AC%F7%DEj%E6%23%989%06%6073%7F%05%A2%B5lw%7C%922%7C%F8%C7%83O%9F%BE%DA%96%91%F9%05%2BJ0%DA%DE%DE%9C%E0R%07%04%DF%0E%81%5CyyC%8F%BF%E6%9A%0D%B5%EF%BCs%9D%D5%BFY%07%A8%0F%0E%1Cxb%B4%B5m%2BG%A2l%2C%C0%C1%00%5E%AE%F0z%D3%8EI%13XK%18Z%03%93%80%9D%B6%C6w%F7DI%5D%E8%F1%9CIDK%00%D8%B4%B1%ADX*%09_%87%FE%BB%01%00%AB%01%AC%00%F0%11%80%DDB%88%869%D5%D5%DD%3A%C7*%8A%8B%E5A%97%5D%96%E9%CC%C9%C9%C9%18%3Cx%B0%7B%E0%C0%E9)%F9%F9S%1C%99%99%E3%E5%94%14%DB%A1%A42%26%FE%A6a%D3%A6%7F%FFv%D8%B0%8B%1E%B0%E8c%D9%F3%F1%A7%99%AB%1E%9D%BF%7D%EF%BB%EF%BA%10%8B!%9E%D5%94%94K%BEW%1E%08%9Cr%2C%82%A4%96%88%0A%12%1A%B7%01%40z%E4%07%A9%F0z%AF%07%F00%ACE%8B%BB%86%DB%89%99%B7%12%D1b%00%15D%B4%B572%D4%DF%9A7%2F%DB%3Bs%E6)%FD%26O%FE%9E%2B7w%A6%E4p%C0(%7B%FF%00%E6%C3%CC*3%08%A0%F6%5D%BB%BEXu%C7%1D%93O%7B%F4QK%1E%DC%8A)'%8E%E0%9D%3B%D6%090%9B9%24%89%E8%8A2%BF%FF%D9c%06%24%89%9CT%23%06%A2M~gy%20P%D8%83q%EF%00p%9B.%D6c%1A%0CL%F8%5C%88h%19%80%DF%95%07%02%1F%1DIS%7F%C9%D9gg%9Cx%FF%FD%3FH%1D0%E0%C7%F6%8C%8C%2C%23%9003XU%C1%8A%02%25%1CF%B4%AD%0D%1D%7B%F6%EC%B6%BB%5C%232%87%0E%AD%B3%B4%26%3E%DFw%C1%FC%941%B3f%00%88*%8A%92%3A%AF%B66%F6%B5%83D%CBj%AF39%E9%89%B5%1Bb%D5%D5%5E%E9%F3%DD%CF%CC7%C1B%3AA%97%14%C6%25DtC%99%DF_%83%A3L%FB6l%F8~%BA%C7s%AF---%A1%13%B0%AA%AADDqp%A8*%D4H%04%91%96%16%84%F6%EDC%C7%CE%5D%A8%DF%F2%15%82%1F%7D%DC%BC%AB%AAj%F0%D5k%AB%F6X%3C%3C%CF%03%B84%D9r%EB8WEy%200%F7k%07I%85%D7%FB2%80%F3L%CC%5D%A0%07%C1%BA%04%07%B1%A0%DF%24X%3C%98%D9%2F%848%BF%CC%EF%FF%1C_3%D5o%DCxW%C6%A0A%B7%92%241%00R%15%05%AC(%88%B5%B7%23%5C_%8F%B6%1D%3B%B0o%FDzlY%F167m%FA%12%22%12%25D%22%8DBQJ%E6%04%FC%8Df%E3%3F%3Fd%88%14%0E%87%EB%00d%24S%DEuN%CA%C1%E5%81%C0%96%AF%0D%24Z%E1TUB%070%98%EC'%E5%81%C0%09%BD%A8%83t%CDT%FBM%99%DF%FF%7B%1CC%B4%E6%EE%BB%0B%8E%BB%EA%AA%95%F6%CC%CC%125%12%E6Hs%0B%B5%EF%DA%85%96%EAjl%5C%BA%14%7BV%AD%82%D4%D6%06%84%C2%DAk0%01%08%08!%86%CD%A9%AE%0EYX%A7i%00%DE5Z'%EDp.%2F%0F%04N%FF%3AA%F2%0E%80%93%93%CDQ'%0A%86Z%113%9A%15%F3%1F%23%1DDg%82%12%80Vf%1E%3F7%18%DC%8Cc%94%F6~%BE%F6%11Wn%DEu%AD%C1%1A%AE%5B%BF%8E%AA%16-%82%B2c'%A8%A3%03P%14t%C6%89%F6o%EA%87%E5%81%C0T%8B%EB%FF%0C%E25%D1%DD%FA%8At%9Cvby%20%B0%EA%A8%FBI%B4%DA%DC%93%0D%12%88%88%99%89%99%FFj%05%20%95%3E_%B6f%E6%1A)%A9z%FD%E4C%22%CA%3B%96%01%02%00y%A3F_%BFo%ED%DA%CB%AB%DFy%9B%3E%7D%ECo%AC%D6%D4%82%DAZ%E3%00!%1C%90%25%AF%BD%DB%94%0A%AF%F7~%8B%0E%BB%1F%01%08ik%D6%AD%DB%5E%3B%A4%7F%FAZ8%C9B%8F%E75%22%3A'9%A7c%00h%24%A2B%2B%19e%9A%A3l%8C%89%F2%9B%98%F7%E2%F2%40%E0%B0%D2%F8%EE.%1D%EA8%E7%A6%1Br%5DEE%E3%DD%C5%C5%C7%A5%0C((%92%1C%0E%17%98%89%84P%3A%EA%EA%EAZkj%B65~%F9e%D5W%CF%3D%B7%E9%5B%EF%BF%DFr8%CF%FB%DB%A8%D1%13%1D%1D%1D%2B%11%89%D8%92%F98p%60%EB%8A%F3%CA%03%81%25%16%F6%E1gD%F4G%03%256%A1%9B%8C*%0F%04%D6%1D5%90h%ED%1F6'%BC%CF%06%F2%F0%07%E5%81%C0%C3%16%00%F2k%CD%93j%A4%A0%26%16%EF%E9%F2%40%60%CE%A1%CC%FB)_I%A6%0A%9A%C5ii%97zg%9E3y%E8%ECYy%19C%86%C6%5D%EF%B2%DCY%F3%DB%F5%9D%94H%04%A1%BA%BA%AAHK%CB%0A%FF%AB%AF%3E9%EE%C7%3F%3E%A4%A2%A9%85%DE%92Q%04%F5c%00%0E%13%7D%0B%CC%DC%A2%AAj%E1%9555%86%3E%94%05%C5%C56!D%0D%E2%E5%A8%C9%94X%00x%BE%3C%10%F8%CE%D1%1477%12%910%D0%19%98%88vE%22%91G-%9C%84a%09W%3B%BA%0FL%E8O%D7%E2C%01H%85%D7%7B%7C%85%D7%FB%9C%CA%EA.%C8%D2Srn%F6L%CF%09%93rS%06%14%40NI%E1D%E8%3F%D9%22Kv%3BR%06%0C%18%9D5t%E8%CDco%B9e%5D%EB%8E%1D%1Bj%DE%7C%F3%AA%E7G%8F%B6%F7d%1Es%03%D5%9F%03%98%02%401p%EF'b%5En!%C4Sfcj%25%25%BF1%3A%B0%DA%1A%5E%B8%D0%E3%C9%3B*%20%A9%F4%F9%1C%88%B7%9D%EA6%CA%AB%C9ARU%F5v%2BY%EDD%F4%9C%CEuN%06%8B%F6aOE%CCB%8F%A7%B8%C2%EB%FD7%80%F5%00.%23%12vv%B8%E0%3B%F9%14%A4%14%7B%C8%9E%91%01%C9%16%F7%F4%F7%24%BA%9B%D2%BF%FFqE%A7%9F%FE%F7%F3%DFz%2BX%BB%7C%F9U%3D%99Sy%20P%C5%CCga%7F%91%19%1Bl%EC%05%0B%3D%9E%E9fc*%8A%F28%80%3D%C9t%13%EDY%0E!%C4%E5G%05%24Z%0B%AA%3C2VF%9A%99%F9%EF%16N%F8%15Fz%88.b%DCJD%D3%7B%C8%3Dn%23%A2%00%80%D9%09%FB%12%B2%8D%1C%03%06%A0p%C2%04J%C9%CD%83%9C%92%02h%E5%96%5D%F3%5C%AD%90%23%3B%3B%BF%E0%B4%D3%FE%DE%5CS%B3%E1%B3%FB%EF%F7Y%E6(%C1%E0r%22%BAM3%3E(%09(%01%80%85%10%A69%AC%F3jk%15%00%F7j%86%02u3%16k%CE%C6%EB%8E%0AH%00%5C%97%2C%1A%AAS%2C%FFf%B1%B2%EE!!D%D2%D3%94H7%60%E6%F1e~%7F%C8%22%A7K%AF%F0z%D7%01%B8%23%B1%D8%14%8F%F1C%B5%DB%E09%E9D%A4%16%0C%80%CD%ED%06IR%D2%24%22%13%EE%A7ol%82%D4%01%03%8E%1B~%D5U%D5%3B%DE%7F%FFz%AB%8BX%E6%F7%DF%05%E0U%BDH%ED%E61%C4%CC%85%9A%EF%C8lN%8F%01%88%19p%12%020t%A1%C73%F2%88%82D%EBrxr2%07N%C2%1C%26%A2%F9%166%F3G%002%93%9D%26%CD%8B%0A%22%FA%8DU3%B7%D2%E7%2Ba%E6%ED%00%8E%3F%C04g%06d%3B%5C%03%0AP0~%2C%9C%B9%B9%F1v%0F%92%84d%3E%06%AB%CA%3F3C%8D%C5H%09%85X%D8l%0F%7F%F8%87%3FX.sPU%F5%22%AD5FR%C6%AD%BD%C7%3D%16%40%D7%8Cx'%05%EA%EE%CC%E9%CA%8B%CB%8F4'9%0D%80%AB%3B%96%86%FD%A1%F9O%AC%14o3%F3%9D0%C8%5E%D3%D8%A3%DF%AA'u%A1%C73%96%99%B7%01HKp%20%DA%AF%8DB%95e%14N%9D%8A%94%82%02%D8%DCn%08Y%86%D0%B8HO%C5L%02%C0%DANC%0DG%D0%5E%B7%17%F5%9B%BE%E4%8D%2F%BD%7Cm%C5%A0!%AFZ%19%E7%CA%9A%9A%08%11%7D%2B%C9z%EA9%40%EAB%8F%E7z%0B%F3%9A%9F%0C%F4%BAd%F0%99O%95%94%D0%91%04%C9%E5z%8E%D1%9DI%9D%98%A8%09G%BA%0C%40*%0C%92%A3%99%99%84%10%E7%5B%E5%20D%B4F%9F%8Ct%20%17%B1%C1%9E%9F%8F%01cG%C3%99%9D%CDR%9C%8BpBYM%00EUU%A8Z%20.%99%93%A6kDW%89F%11imF%C7%F6%ED%B4%F1%95W!773b%91s%2B%BC%DE%C5%16%C5%CEk%00V%1A%253i%EFezX%E6%06%83%EF%01%A8%D7%E9r%DD%ED%D10EQ%7CG%04%24%15%5E%AFSk%A4k%E8.%97%24%E99%0B%C3%FD%26%19%17%D1%BD%DB%12%2B%C1%BAJ%9F%2F%9D%99%D7%22i%22%12%81%25%09%FD%C7%8D%E5%94%82%02%D8%D2%D3!%ECv%A8%D1(%B5%06%83%AF%B7%04%83%3FX%3F%7F%FE%B8%3F%0A%E1%92%24%89%24I%22!I%F4%EE%0F~P%18%7C%FD%F5%F3%DA%F7%EC%F9KG%5D%5D%1D%98%13'c%7F%EA%A3%AAB%E9%E8%40%FB%EE%BD%D8%FEY%15Z6~I%08%87%13%2Fqq%85%D7%7B%BBE%CE%F4%DD%84%B5%93%E4%DF%09%40N%A5%CFw%86%85%E1%16%243%87u%FD%C1%CE%3FR%9C%C4%A7%EB%B4%9CLa%5Di%D6%40%A6%C2%EB%1DJD%C3%8C%B4zMO%B9%C1%E2%02%7F%A0%1318%88%8BH%12%90%99%89%FEcG%C3%95%93%03%B0%DA%D2%B8q%E3O%EF%18%3F%DE%E1%F6%F9%FE%2F%DD%E3%11%23%AE%BB%EE%A6%5B%99%172%F3%A7%CC%BC%8E%99%DF%3C%F9%A1%87%EE%F6%9Cy%E6%E9)%F9%F9%1F%B9rs%87oY%BCxJ%8B%DF%FF%06%E2%16%04%83%19j4%CA%E1%E6ftl%DF%8Emo%BC%05%D1%11%02%D4%18%E9X%FB%2F%2B%7D%BE%99%168%40%80%88%5E%D4%C4%18'%B3t%98%F9'%16%D6cq2e8Q%AB%03%E0%AC%23%02%12f%9Ee%F0%F0%C4%BBYa%B1%D7%18p%D6D%0A%FD2%2B%F9%20%15%5E%EFm%88%E7%D4%26%E3%D3%60%D9%86%CC!%839s%E0%40%0A77%FF%A95%1C%19%913rd%C7o7lx%16%C0%A3%88w%94%9E%0E%60%1A%E2%CD%F3%3C%00Fk%FA%D7%F9%00n%05%B0x%F0%A5%97~%C7%ED%F3%FDr%EB%E2%C5%13Cuu%B5%60F%AC%A3%03%A1%3D%7Bx%DB%CA%F7%10%DD%BE%1D%88F%BA%EA%12%AC%AA%EAS%15%5Eo%AA%85%F5%BD%D5%C8!%A6%FD%FE%CC%0A%AFW6%01%DC%C7%00%22%C9%F4%1C%ED%00NZP%5C%EC%E8u%90%08!NJ%C6%D2%13M%EC%00X)7%9Cg%B0P%89%C5%FD%9D%15G%19%80%DB%91%ACs%033%98%04T%A7%93%8B'NlV%C2%E1Iyc%C7~%90WX%F8%5B%00%D7%028%1D%C0Hf.%60%E6Tfv%C63%0B9%A2%F9%1BR%989%93%99K%00L%02p%11%80%3B%07%5Dz%E9%0C%5BV%D6%19%F5%1B7%3E%11mi%A1%D6%9A%1A%D4%7C%F4%11S%B8%03%DDd%15%12%11e%010%D5%D3%CA%03%81%CD%00%3E0q%AE%81%99%AF%B0%60%0E%BFf%F0o%60%E6l!DA%AF%82%E4%99%D2R%A1%DD%F6%40%06%A6%60%C8%AC%89%5D%A5%CF7%92%993%91%BC.%80%99y%AB%95%94C%22z%18%BA%CA%85nu4I%E2%D4%12%DF%DE%C1%E7%CE%1CW4%FD%F4%E3%89%E8%16%00%171%B3%8F%99%15f%EE%40%FC%A6%09%05%80%AA%9B%17k%BF%8Bi%A7%B2M%03%D2%C9%00%AE%95e%F9G%19%C3%86%3D%D9R%ED%BF%3D%B0f%0D%A1%BE%01%AC(%DC)%E2%B4%CF%FE%5E%9D%98S%E1%F1%1Coa%A9%1FD%F2%98Z%A2%3A%C0%8A%D7t%99%11%AB%D6~%3C%A5WA%12%89DR%88%C8c%E0%F4b%C4%DB%60%9A%F9%05fv)%BD%ECzRHKZ6%8D%C5%24%3C%A9%C9%1D%0C%608%5D%CD%DE%2B.%3F%D1%E5%F3N%07%F0%2Bf%1E%C5%CC*%F6%87%D7%7BB%0A%80%26f%CE%22%A2KeY%BE%AD%FF%C9%D3%5E%DD%13%AC%BD%17%90%08%92-%EE%BD%95%A4%F8G%C4%3F%24%24%82%90%00%C9%F6G%0B%EB%F3*%00%23%9D%8E%01%9CiAt%BDm%E4%08L%A4%24%F4*H%B4%0B%85%8C%B2%E0%09%F1%3E%A9f%A7%FF%5C%23%0Fc%02%03%16%A6%F4%CBd%F3I%B4E%82%90%C8%3D%7C%C4%AC%09%DF%FA%D6(%22%BAKU%D5%0Cf%8Ej%22%05%87%F8!f%8E%A8%AAJ%CC%3C%09%C0%5D%DFz%F2%F1%87R%8E%1B%F6%B6k%C8%10r%0D%1B%0A%E7%D0%F8%C75d%18%9CC%B4%9F%87%0Ea%D7%B0!%B3%96%DCt%8B%CF%C4o%D2%02%60%B9%89%07%1A%95%3E%DF%09%26%A2k%93%09%88%18%07%F7%9F%ED%96z%D2%C4f%AC%05%AF%E4%C7%16%C6%99%9A%AC%BA_%9Bx%90%88%B6%9A%88%ACLf%BE0%D98%89D%1B%D8%EC%7F%3A%F7%A9%05)%CC%7C%A7%AE%9Dgo%91%A2m%D8%08!%C4og%3Ep%FF%D5%7B%AB%AA%D6%A9J%D4%C1%F1d%11%22%AD%E4Gk%0AM%DA%D3o%C0_%EE%FB%A9%C9%D8%FF%04p%8E%C9%26OE%BCn%C8%88%D6%23%DE%F6%14I%D6hX%AF%82D%BB%92%0C%26%C9%CEU%26%22b%08t%0Dd%92p%92%D5fu1%9A%95%E50%94%B7Bj%B9%A4%EA%B3%A7eY%FE%11%80%01%CC%1C5%10%93%04f%A7%AA%AAJ%22%FD%81%99U%10E%8D%DAviV%98%60%E6Y%CE%FC%FC%FF%B8%F2%F3oO%19%D0%FFN%18Xn%91%E6%E6%0B*%8A%3C%B7%96%D7%06c%06k%BD%3Ca%0AwS%9A%91HG%9Cba%CF%3Ec%E6%E3%0D%FC%25y%95%3E%9F%5C%E6%F7%C7zE%DChw%D6%B1%89%E9%B5%CFd%D2%23-(S%2B%2CL%E7R%24%09%B1%C7%17%84%09B%BA%DDn%B7Mf%E6%99%9A%82%9AT%84(%B1%98%AB%AD%A5%25M%92%E5%0CI%96%D3I%884%12%C2%0D%E6%1CUQ2TE%11%C9%FEVUU0%B3%A4%AA%EAU%99%23F%FC%5Bv8%DB%9D9y%AC%7D%D0%E5C%19%83%06%0F%1Av%F5%F7%7C%26%EB%B4%0B%C0%F6%24%B1%B1%84%F2%3A%C9%82~%B3!%99%12%AC%1B%BB%B87M%E0%22%93%0C%B4%ED%16%26%5Db%A4Li%3F~d%22j%1C%00%26'S~%E3%C0!%7C%7B%D5'%2BTU%3D%99%99%DDF%3A%88%AA(%99%20Je%00%7F%BA%E7%1E%AC%FA%F4S(%B1X%A7%8F%05D6%00%D9%AA%A2%D8%0D%80%A6%00%18%0B%60J%B4%BD%FDqa%B7%91%B0%C9%24l2%0E%FAH%12%0AO%3Bm%96%D1%3B%CE%A9%AE%EE%00%E0O%26%1E%B5g%F6%B7%C0I%AC%F4%7C%F5%F5%26H%FA%1B%D9%DD%88%DF%F6%60*%B2L%F4%9A%18%80%DD%26%1C-%17%40%9E%E1%09%91%A4%D7%E5%D4%D4%C9%AA%AANVU5%AC%9D%F6d%00%B1%25%7C%3C%ABV%AD%C2%23%8F%3C%82%A5K%97%A2%B9%A9%09%B2%2CCk%F7%00%10%B9UE%91%0D8%8A%83%99%A7%B4%ED%D8%B1%02%BAxP%D7%0F3s%E6%E0%C1'YX%EF%2F%0D%DE%11%00%24%AD%C5%87%D1Z%05%2C%3C%C7%B4%9A%B2'%8Ak%8E%C9%BF%EF%B40%867%99%5E%A3%1D%9A%7DB%88%06%93%17%1F%AF%BF%7B%A6%DBq%18%FF%060%94%99%8B%00%B4u%3B%8E%AA%BA(~%5DIg%AC%A8_~%3E%DEZ%BE%1C%1D%ED%EDhnj%C2%C4I%930t%D80%C4b1%A8%F1%80_%063%EFK2%AF%08%11%8D%CB%19%3B%F6%C5hkk%CC%9E%9E.'%0B%5D%B0%A2%0C%B1%08%12%23%92%88h%80%11%07'%22%D3%3Da%E6%FC%DE%E4%24)%26%0F%B3r5%C8%00%83%B4%00%00hNV%DD%AF%FB%DEq%5D%CC%E5%83%F9%E7%25%DF%DE%C4%CCy%86%EFGt%D0%FB%D8l6%14%14%14%A0%B6%B6%16O%3D%FD4%16%2F%5E%8C%BD%BBw%83%15%25%EEc%17%82XU%9D%C9%A4)%80A%CC%5C%18nl%5C%99%04%20%F1%DDu%3A%BC%0F%10%ECf%5C%C0%825%99c%22%DE%AD%ECIV%AF%BA%E5%0D%5E%08B%08%2B%E5%06%99FV(%11%B5%5B%D1%8D%0C%FDL%92%8CQ%B7%DC%D2%A1%F9D%94%24bF%C6%FE%FE%24%F1%0D%24%82l%B3%C1%E9t%22''%07%19n7%3E%5B%B3%06%BF%FC%D5%AF%B0e%CB%16%B4%B5%B6BQ%14%00p%24%119%AC%AA%AA%5DQ%94%5C9%25%E5%CBd%0E%20V%15H).%B7%DD%E5%92L%0EC%9D%85uw%9B%F8%5C%3AL%9E%C1D%94zT%40%A2%C9Z%2B%A9%85N%93%97%B6r%FD%88%2B%B9%95E%20%D9%06WFF%86%C6%F9%92)%AC%07%E8%16%09%93U%92%248%1D%0E%B8%5C.%A4%A5%A5!%2B%2B%0B%A1%8E%0E%DCq%C7%1Dx%F7%BD%F7%D0%DC%D4%94%10%D1%DD%8E%ABq%93T%5BzzcW%17%A9%16t%81%AA*%20IBZa%A1%19H%C2%16%DC%3A%8E%C3%DD%3AU5oF%DD%9B%1D%A1%D9%1A%9E%E8%B0%C7%E8%5E%D40%18%02%88%F7%09%91%8C%16%20%B1a%5D%7F'I%12l6%1B%ECv%3B%9CN'%84%10%90e%19%ED%ED%EDX%B8p!%1A%1B%1A0%7D%FAt%CA%EF%D7%CF%11S%D5H%12%91g%03%91%D2%05%FDq%EF%9B%1A%D3%89%1C%A7%A5%16%1A%06%D6d%AF%1Cr%B1%BF%BB%E3%91%05%89%A6%8C%CA%16%BE%173%E9%A5je%0C%A5%5B%A01%81l2%E4%BC%5C%00%88%A9%AA%CA%5Du%01%9D%D2%AA%A2%9B%BEgB%EB%87%26I%12%24I%82%10%02%8A%A2%C0n%B7%E3%F2%F3%CE%C3%A8%91%23%91%9E%96%A6*%8A%12%EB.%0C%AFe%D2%C5%D4p%D8%05%9B%AD%CB3%15%80%D5%F8%AB%13%A1%7D%FBN%B3%23%2C%19%E9o%DA%9AG%0Fs%DF%D8%CA%C1%EC%15%90h%93N%B5%F0%BDVf%CE7%E0%26.%0B%C8%AF%3Bx%E35%A7%A9lC%FF1c%D0%BE%7B%B7l%CF%C9%09u%BA%E7%0F%FEv%F4%20%AFh%17%D1%11%89D%20%88%90%DF%AF%1F%CE%3A%EB%2C%8C%181%02%0E%A7%131E%89(q%16%D5%9D%A3KRU%B5Mmn%1Eh%D7%DA%93%ECOuT%11w%E6%02%B1%F6v5%D2%D1fV%8F%94n%A1a%A0%A1%0E%F7xA%81%19%E7%26%222mp%D3%13ve%86%7C%2B%7DJ%CD%94%B14%B3%84%1A-%D1%19%DD%C8%0ApZ%1A%0A%C6%8DE%AC%B99%87%99%9B%99YN%EA%8A%D7%DC%F4%9D%19%F9%CCP%99%11S%14%B4%B4%B4%C0%E1p%60%CC%D8%B18%FD%F4%D31%F5%A4%93%E0LIALQ%A0*J%BBA2O%98%99%EB%19%18%7F%E0%EF%D5%03%1A%3BGZZv%B4v%84%CC%B8%80%95%5C%0F%C3%3E%26v%BB%3D%CBL%AFQU%B5%B9%D78%09%1150s%8E%81%8F%23%DF%C205%26%EE%E4L%22%CA4%01SU7%93%03%CB6d%0F%19%8C%D4%C2%02%D8%5D%CE%D1%88W%B3%C5t%8D%F5%BA%CE%B9%85%80%EC%CE%FE%BCDPb1%B4%B7%B5!%2F%2F%0F%13%26L%C0%8C%193%D0%AF%7F%7F%B4%B6%B6%C6%07P%D5%10%88%D4%24bL%10Qm%24%14%DA%9B%99%9F_%AA%BF%1BPUb%00%03q%01%A8%B2%1A%8Dl%F9%A9y3%BDA%16%A4%C5n%93%EF%E4%5B%E1%CC%BD%C6I%98y%AF%89%8F%A3%C8%C20%5B%93%E9%09%DAF%BA%999%C7%04%AC%9B%BA%135%AA%D3%89%C2I%13%E0%CA%CB%83%E4J%F9%AE%10b%133%EFD%92%80b%BC%B7%3F%1Fp%8A%3AB!%A4%BB%DD%B8%F0%C2%0Bq%F1%C5%17%23%2B%3B%1B%1D%A1P%02%20%0A%E2W%9B%24%3D%B8%00%3E%15mm%83%B5%EB%D341%ACBe%05*T0TfbR%A2Q%2B%95%FDf%09J1%98%84B4g%A2%19%ED%EC5%90%00%D8ab%95%94Z%00%DAW%06r6%91%E9%3B%D8h%8C2%BF%BFE%E3%26%9CPXa%B7%23%A5%A0%00y%C7%1D%07GF%26%A7%E4%E6%E5%B6n%DB%16%02%B0%16%80%CD%00p%11fn%88%9BF%8C%B6%B66%FC%FC%E7%3F%C7%EC%F3%CF%07%88%10%D3%AC%23V%94%10%88%1AL%C0%2BTU%7DW%00%E7i%2C%84%12%25%17%C4%02%C4%04b%22%01%09u%1F%7F%BA%D4%C2z%0FD%F2%CCy%06%10.%0F%04ZL%E64%D0%A4%1D%05%98%B9%A67A%120%A9%82%B7%A2tn2%E0%24%89%EFX%A9%F7%5D%D1%A9%17%10%81m6%0C%98%3C1%5E%95%97%96F%90%04%5C%E9%E9%970%F3%0A%CD%7FC%C9b.%9A%25T%1F%8B%C5%D4%DF%FF%F6%B7%EC%F5x%B8%AD%B5%15J%2C%A6%B0%A2%84%94X%AC%01q%85%1B%06c%90%AA%AAk%DA%B7mkH%2B*%9A%0C-%F5%0D%CC%40%0C%90T%09%12%CB%10%AA%C4%DC%16V%BEZ%F4%C2%07F%2FW%E9%F3%E5%02(5J%88ff%2B%AD%2F%06%9B%25%2F%25%B8%7B%AF%81%04%C6%B7L%24n%DENJ%8A%A2%7C%D6%A98%26%97%B3S%2Cp%A4'%3B%F9%97l%83%C8%C9E%D1%981p%E4%E4%40%B2%DBAD%9C%EE%F1%9C%D1%5E%5D%DD%08%E0%0D-%A19Y%60.%DE%B2Q%92%9A%DCYY%8DB%96%EB%15U%ADS%81%06%06ZA%A4%98%00%04%CC%ECb%E6%C7S%B2%B3o%D1%3C%BA%04EA%2C%12C%8C%19QV%11Q%15%8E%B1%8A%B6%C6%86%E5%B3_%F9w%93%C9%FB%0D3r%3Cj%DC%F8%03%0B%EB4%DA%C4%BC9H%E4%1E%16H%88%E8%F3dN%1E%DDD%26%9A%B8%89%5B%99yg2%EB%40%CB%BD%1C%BF%A0%B88%DBh%9C%B9%C1%E0z%00_0%81%D9f%E3%C2%13%26%23%A5%A0%00%F6%F4x%E9%26%09AL%C4%EE%01%03%FE%C0%CC%CF2s%B5%99%1F%87%88b%9A%FF%A3'%D9kB%D3y%16%87%FD%FE%5CGV%D6%09%D1%D6V%8E%B6%B6%22%DC%D2%82Pk%13BmM%08%B75%23%D2%D6D%91%8EV%DA%BBf%F5%C3%16%C6%BD8%D9Z%EB%8A%AB%3E%B10%CED%13%3F%C8%A6%B9%C1%60%EF%F9I%98y%B5%91%CBT%CB%0E%9C%0C%93%FCT-%D5%FF%7B%06%D1%60%9B%24I%A7%00%F8%97%89%DB%F5~%96m%7F%97%F2%F2%E0%9D4%09%AE%FC%7CHNg%FC%D6n%CD%D4H%C9%CF%2F%DE%BB~%FD%C5RA%C1%7CI%92%FE%0F%40%3A%F67%8F%E9%0C%A7%E8%8A%DC%0F%D8%98D%91%98%AE%C3%B4%FEo%12%EE%F9%D5%B1%FA%7D%2F%A8%E1%F0%0BM%9B%BE%E4%F8%1D%06%04%8EF%F5%96%9F%96p%40%DBW%94%CF%B3R%23%7C%06%0C%3A*js1L%3A%7F%AA%A4%C4%A6%AAj%A6%89%23m%A3%95%BD%B7%0C%12I%92v*%8A%125P%04%09%C0%A9%16%86Z%06%E0%7B%26E%E2%DF3%03%09X%AAd%BB%FD%8E%FE'L%CEO%F3%14%C3%96%9EN%C2f%D3%F7%19afF%EE%88%11e%81%95%2Bw%BB%06%0F%5E%24%CB%F2%F9%92%24%E5j%0Dv%8C%0A%CC%08%F1%BE%20%9C%E8%F7%A1%2F*%17%F1%14%83%88%A2(U%FBv%EE%7C6PQ%B1%80c1%3B%18%04A%8856%82%23%91%84w%17%00%88U%15%F6%AC%AC%BB%BF%DF%DA%183%D1G%862%F3p%93N%8A%B5%E5%81%C0%5E%13%FF%C7%F4%03%CC%BF%EE%F7k%5D%AF%82%E4%BB%DB%B6E%B5%FBe%26%1A%C89%D3%ECkY%96%FF%15%8B%C5%8Cn%AC%24%003%17z%3C%19s%83%C1%A4%B2%BB%2C%B8-%F2%D4%B7%BE%FD%CB%E2%F1%E3%FE%EE%C8%CD%85-%25%25%0E%90%FDW%9B%103s4%12%E1%FE%13%26%FC%F4%ABw%DEy%C8%E6%F5%FE%DB%EDv%9Fc%B3%D9%06%10%91%AC%AA*b%B1%98%A4%AA%AA%D0%15%8EwN-%D1%9E%8B4%DF%88%14%BF%CADU%14%25%14%0E%87%AB%AA%3F%FA%E8_%FE_%FD%FA%9E%98%12%CB%11%20%12%89%06%06a%7D%AC%93%12iK%DB%C5%F6%ED%F3-p%EC%1B%92%F5%C4%D5y%90%9F%B70%CEt%ADX%CEH'y%DB%AAL%ED%09%AD6y(*%7D%3E%C3%2C%EF%2B%B6nU%98y%A5%D98D%14%C4r%97%00%00%13GIDAT%F4%03%B3%C9%CC%F9%E7%E2%C73%07%96%7Caw%BB%19%DA%5D4%3A%BF%0D4%8E%81h4%CA%FD%C6%8E%FDA%C7%AE%5DS%3Fz%F7%DD%E7%1B%1A%1A%B6E%22%115%1A%8D%8Ah4*G%22%11%7B4%1Au%84%C3ag(%14ri%FFu%86B!g%24%12vD%A3Q%9B%A2(%92%A2(j8%1Cj%AB%A9%A9Y%F6%D2%8D7%AE%DD%F0%E3%1F%DF%DF%DE%DE%96%C3%91%08Q%24%02%84%C3%A0H%18%10%14%AF%BF%11B%ABG%24%02%D1%0F%E6h%B9%06%C9h%A1%C7%23%13%D1U%06%07(!%16%17Y%D0!%CF7%8A%11j%EB%B3%A6W9%896%E8R%22%BA%CE%E4%3B%B3%01%2C51%85%1Fe%E6%93%8C%16%83%99%7F%0C%E0N%B39%ED%FEt%F5%CC%CC%A1%C3%AA%85%241%BA%E9v%90%E0(%AA%AArzQ%D1%94~%CC%E3%FF%F1%F8%E3%8B%9C%F9%F9%ABO%3C%F1%C43%FA%F7%EF_%24I%12%C0%AC%B2%D6wV%A7w%A8B%08%08!(%14%0A%85%B7l%D9%B2f%F9%B3%CF%7C%24%BF%F5%D6%ACL%12%A3%9C%00%DB%13QT%EA%B6'H%E2%17%2F%94%07%02%2F%5B%D8%D8k%98%D9etU%10%80%7De~%FF*%93%83%EAf%E6%A10%BE%EEe%DD%DC%60%B0%B9%D7A%82%FD%C5W%DD%3D%3C%F1%BB%CB%00%5Co%E2%10%7B%A6%C2%EB%7D%DA%A40%3A%AB%C2%EB%FD~y%20%60x%5D%D8%A8%EB%AF%F3o%1F9%F2%86%FE'N%7DX%AB%84N%B4%13%EF%BC%E5Jk'%01Y%96%91%9A%95e%9Br%F6%D9sv%06%02%91%7F-Z%B4%AA%BA%BAz%ED%B0Q%A3%F2JKK%FB%A5%A4%A6%3A%B2%B3%B3S%04%11B%A1P%A8%BD%A3%BD%A3%A1%BE%A1a%FD%BAu%5B%F7%7C%F2%89%3D%A7%BE~%B4%BB%ADm%BA%8B%01A%60%98%B4%D0%D2%14%9C%9D%3Dhfw%87%C1%C6%26%1A%04%3Dh%E10_dddh%EB%F3%81%D5M%EFq%0F%A8%0A%AFw5%11%8DE%F2%E2*%02%60%DA%A2%BA%C2%EB%9DOD%DFO2%8F%84%02%D9V%1E%08%A4%5B%99%D7%BE%0D%1B%E6g%0D%1F~-%F6%9B%88%C4%CCP%14%05%91H%04%A1P%08%1D%1D%1Dhmm%E5%A6%A6%26jhh%E0%A6%A6%26%DA%B3g%0F%3AZZ%D4%E6%FA%FA%1D%1D%91H%A3%AA(%A1pC%83%DAZS%2BI%1D%1Dir%5Bk%3E55e%D9%23%11%A4%08%01%A7%10%9C%22I%E4%20%82%9D%086%22%C8D%10q%8B%AA%EB%0B%C4%B4F%C7%7B-%AC%EB%CD%00%EE3%BB%C4A%08%91%A2e%D3%1B%8D%B5%02%C0%A9%267X%CC(%0F%04%DE%3A%12%9C%04%00%961%F38%23%D7%3A%809%00V%99%B0%D6%DB%99%F9Z%23f%C2%CCi%15%5E%EF%5D%E5%81%C0%2F%CC%26%95s%FC%F1%D75UW%7B%DC%3E%DF%B9%AC%BB%012%9E%3C%1FO%26%8A%3B%BATJd%C7%3B%9C%F1%2C%B4%F6%F6v%11)%2C%2C%0A55%15%B5%ED%DC%89%E0%E7%EB%10%DB%BC%19%92%12%83%1C%07%03%3Be%19%0E!%C8FD%5D%C1%D15%0BJw)%C2x%2B%00%A9%F4%F9%5C%CC%7C%8F%C1%25%0E%09%1D%E2%253%80%3CUR%E2VU%F5T%23%8EDD%ED%AA%AAZ%EE3%DF%E3%CC%26%22z%D6%E0%DF%12y%93s%CD%C6)%F3%FBwh%E6p%D2%C4%17m%ADn%5D%E8%F1Xj%91%90QR2%B3q%CB%96%17%F4%8B%AC%07%89%C3%E1%40Jj%0A222%90%95%95E%B99%B9%E8%DF%AF%1F%0A%06%0C%C0%80%BC%3C%E4%A5%A7%23-%1A%85%B4%7B7%B2%04!K%92%90)I%C8%90%24J%13%82R%88%E0%22%82C%03%89%A4q%0F%3Ap%23%13%1CdT%99%DFo%C9%C4d%E6%0A%ED%C0%26%B5%F8%B4%84%26%D3%066%AA%AA%96%1B%D5%24i%26%FDJ%23%CB%F1%B0A%A2%AA%EA%17D%B4%C5%C0%93G%CC%EC%AE%F4%F9.%B20%DC%8D%06%0D%E5%12%A7%8AI%88%95V%E7%975x%F0%B7%F7%AC%5E%7DG%A2%1BQB%2F%91e9%0E%92%94%14%A4%A5%A5!33%13%B9%B9%B9%C8%CD%CDE%BF%DC%3C%E4%B8%DD%C8%14%84%D8%B6m%C8%8A%84%91I%84%0CY%86%5B%92%90%26IH%15%02)B%C0%25%04%EC%1A%17%91%F6s%12%7D%16%DCNM%C4X%02H%A5%CF7%0B%C0%B7%0DZ%8C%25%80%B7%CCJ%B3B%00%B7%24%CB8%D3%01gAO%F6%BC%C7%20%99%1B%0C%B2%D6n%89%0CB%FE%60%E6%9F%99%8D%A5%5D%D4%F3b2SM%939%04P%C9%C2%F1%13%1F%B1%3A%C7~%13%26%FCj%FB%8A%15%B3%C2%8D%8D%8D%BA%86%B9%90e%19N%A7%B3%13(n%B7%1B%D9Y%D9%C8r%BB%91!I%B075A%D9%B6%0D%19%CCH%17%02i%BA%8FK%0884%80%D8%88%20%C7%17%8Fuz%08%01xA%08%E1%B3%22b4%937%8F%99_2%AA7%D6%F9m%BEoa%BC%93%10oYF%06%3Ac%0B%80%D7%8F(H%B4%89W%24%AE3K%A2%970%80I%15%5E%EF%18%0B%AC%F6%7BH%DA%3E%5B%13%AB))%9C9t%C8u%C1%A5K-7%CF%2F%9E1%E3%D5%957%DEX%5C%FF%C5%17OAQHs%D7%B3%5E%FC8%9DN%A4%A5%A6%20%C5%26%C3%19%8D%A0%E1%F3uH%EF%08%C1%0D%82%5B%96%91.IH%95%2485%80%D84%EEA%BA%86%80%BA%12%D7%0B%CA%03%81o%CF%A9%AE%8E%F6%60%1D%3F%D1%F6%80%8C%BFF%0F%95%F9%FDA%0B%E3%FDF7%A7%EE%94U%02%F0fy%20%D0p%C4AR%E6%F7o%02%F0Q%B2%AC%2F%1D%5B%B3%D2R%B2%91%88~%D1m%C3_%26%C0%E1%84%DC%AF%1F%8D%B8%E8%02N-)yv%F3%E2E%13%AD%CE%F3%8Cg%9Ei%CB9%FE%F8%B2u%8F%3E%3A%A2i%CB%96W8%16%23%9D%18%03T%15J%24%8CHc%03%1A%B7n%C3%DE%AA%B5%A0h%14Fi%1C%5D%DAtn%07p%A3%10%C2g%C5%0F%D2%C5%02yE%3B%F5F%D2%96%99%B9IU%D5%9FY%E0%22%C3%01%CC%D0t%C2d%FA%1D%00%FC%B9%A7%FB%7D%C8)%F9%CC%FCg%233Z%E32%B3%B5%8EDf%A0%FB%03%80%2F%0F%E2%246%3B%D8%ED%C6%A8K%2FA%C6%C0%81%E4%CA%CBe%CF%19g%AD%DC%F0%C4%13%A3z2%D71%3F%FC%E1%86%AC%C1%83g%AF%B9%FB%EE%92%FA%0D%1B%EEm%DF%B5k%2B%B4%8B%13%A3-%AD%DC%BEc'%B6%BE%F3%0E%A4%D6V%40Q%18%07%B5%81e%D6%E9N*%11%BDID%17%08!J%CA%03%81%87%E6TW%2B%3D%04%C83%00f%1A%89%19%DDy%BB%EA%CA%9A%1A%D3%A25!%C4%1F%92%ED%87%AE%A7%EB%96%F2%40%E0%FD%1EK%0E%1C%06Ux%BD%3B%01%F43R%BA%00%BCV%1E%08%98%B6%A8%AC%F4%F9%863%F3%86%CE%85%132)%E9%E9%18%F2%AD%8BPr%FAip%0F%2C%85%23%2B%13B%B6%B1%12%0A%85%B7%BE%F0%C2%94%E3%E6%CE%AD%3A%94y%3F%E5%F5%CAC%E7%CD%F3%15%CD%981K%D8m'%ED%DD%B0a%C8%AA%07%1E%F2%8A%86%067%D4%03%F6%5BE%3C%23o%0B%80u%9A%C7%F9%83%F2%40%A0%E90%D6%EC%19f%BE%5C%08ax%85%AD%26%CE_%2C%F3%FB%BFea%CC1%00%3E3*WQU%15Dtuy%20%F0%F8Q%05%C9B%8F%E7%26%22%BA%DF%88e%AA%AAJB%88%A9e~%FF%87%16%5E%F6%3A%00%8F%90dc%25-%95Jg%CFB%E9%993%E0%1E8%08%8E%EClH%0E%07H%08%A8%AA%CA%1C%8D*%C1e%CB%CE*%BD%F0%C2%E5%E8%05%AA%9C1%D3%8E%EAm%92%1Am%934%A5%5C%25%22E%08%11-%F3%FB%95%DEx%86%26bf%26%A2%CD%26%B7%7C%ECP%14%A5t%5Emm%D8%C2%B8%EF%10%D1%B4%EE%5C%2C%3A%EE%DC%A8%AAj%DE%9555%CAQ%05I%A5%CFg%D3%0A%C5%D3%92%B9%81uln%88%25%E0%0D%1A%F22%BB%9C%E7%0D%9C%3D%0B%03g%9C%0Ewi)%9C%D99%9D%B9%22%FA%16%0E%AC(T%FF%C5%17%B7%E5%8D%1E%7D%17%8EaZ%E8%F1%E4iJ%AA%CF%E4%12l%FD%E5Oc%CA%03%81%B5%16%F6%E0Bf~%11%E67z%FE%AC%3C%10%B8%E7P%E6%7FXe%82Z%DB%AA%3B%60%DE%A0vp%A5%CF%F7c%2Bcnjh%BCh%F0%25%17%7FQ%3Ac%06%DC%03K%E1%CC%C9%E1%04%07%D1%2B%60DD%24I%9C%3Bj%D4%9D-55%AF%FC%1A%B0%1F%8B%00%A9%F4%F9fi-%20%BCf%B7%A4'%1A%F7%01%B8%DC%0A%40%16z%3C6%00O%C2%A0%FDz%C2%EC%15B%DCw%A8%EFp%D8%B5%A4%E5%81%C0%3D%CC%DCh%D0%95'%E1%D8%B9%BB%C2%EB%F5%98%8D%F7%87%7D%7B%94%CC%BC%FC%C9i%1E%CFngN%0E%24%BB%03B%96%3B%9Db%DD%3D%26%B5%A8h%E6%2F%5B%5B%9Bv~%F8%E1%B9%C7%108%5C%15%5E%EF%3F%98y%09%11%09%9D%EF%C2H%C4%10%80%5B%CB%03%01%2B%BD%F9AD%F3%9993%99_%04%FB%EFN%FE%D5%9C%EA%EA%D8%D7%06%12m%B27%1BX9%898%8C%80Y%B6%99F%23%AE%BD%B65%F8%9F%FF%8CP%23%91f!%CB%A4Ou%A4%03%AFG%EDtV%C8))%8E%FE'%9C%F0j%DB%EE%DD%EF%7Dx%EB%AD%DE%AF%13%20%15%5E%EF%CDZ%82qROjw%00a%E6%FB%CA%03%81%3FZ%7C%C6)0%C8%F0%D3%89%9F%DDs%83%C1%BF%1E%D6%FE%F6%E2%C2l%0208%E9%A2t%B6%95%12%7F(%F7W%FF%C2%CA%98%EB%E7%CF%CF%2F%BD%F4%D2M%8E%AC%ACL%AB%13M%B8'%DBv%ECxq%C3c%8F%DD%3A%F9%F7%BF%3F*w%06k%09C%D7h%E27%CB%A8%1BS7z%251%F3%7Ds%83%C1%1F%5B%7C%96%9B%88v%11%91%D3L%7C%018%B7%3C%10XzL%80d%A1%C73%5C%08%B1As(P%E7%F0%D4i%C8%03B%02%0B%09%E1%F4%F4%93%AFY%FD%E9%7BV%C6%FD%F0%B6%DB2G%FD%F0%87U%AE%FC%7C%2F%E9%40%60%01(%00%40%AD%3Bv%7C%B0o%ED%DA%07%AB%1E%7C%E0%D5%0B%96.k%E9mph9%A97h%19e%AE%C4%09%B62O%EC%CF%11%B9%D5*%07%D1%0E%E4%C7D4%D1%CCB%22%A27%CB%FC%FE3%0F%F7%1D%A9WOS%C9%C0%FB%04%F3%CD%90%A4x%D1%14%11%40%02%2C%CB%A0%14%17%1Cyy%9C9%A8%14%03%86%0FW2%8B%8BK%BD%B3f%05%AD%8C%FB%8F%09%13%9Cg%BF%F0%C2%F2t%AFw%8A%AE%A4%C0t%03TU%D5%BA%ED%82%22%8D%0D%E1%C6%CD%9B%97%87%EA%EB%FF%F9%C6%23%7F%5B%EE%EA%88%EC%9A%B3bY%C7!%80%22W%AB%8B%B9%18%F1%AC%F6%E1%06!~S%11%A3)%A9%CF%F5%E00%3EAD%F3%CC%EEO%06%40%B1X%2Cm%5Emm%DB1%05%12%00x%FE%C4%93j%A4%F4%F4B)5%15r%86%9B%DC%F9%F9H%CD%CB%83%BB_%7F%B8%F2r%E1%C8%CAd9%3D%1D%92%DD%B1o%E99%E7%14%7Fg%F3%E6%90%D5%B1%F7VU%DD%9F%3Db%C4M%24%84%E1%86%E8o%B6%D2%EE%A4Ah%DF%3E4m%DE%CC%AB%2B%9F%A6%C6%8F%3E%02B%ED%DB%C1%ECG%BC%81%DD%97Z%8F%B2%3A%C4%FB%BA3%E2%F54%E9%88W%F7%0FB%BC6w%20%E2%E5%ACN%BD%DC%EF%01%40%F4%26%EEv%003%ADX1%3A%80%DE%CC%CC%F7%99%3DJ%7B%FF%2B%CA%03%81g%7BE%E7%ECm%90T%FF%E3%1F%23%D8%E9XgKOg%D9%E9%84p8Hr%3A!9%9D%B09%5D%10%0E%07d%BB%03d%93%11%AA%AB%5B%7BmQ%D1%B8g%CC%DBZt%D2%B6%97_%9E%5Dx%DAiO%DB%D2%D3%DD%E8%86%AB%1C%00%10%00j%2C%86hs3%9A%FD%D5%D8%FA%FA%5B%F8j%F1bPS%23%13%2B%894v%D2%2B%C4%BA%CB%0C%A1%AB%B7%E9%AA%0C%F6%98s%E8%B9%07%11%BD%18%8B%C5.%B7%E2(%D3%89%98%8B%01%2C%B6%E0%88%033%BF67%18%9C%D9%5B%7B%DA%EB%20%01%80%DA%15%2B~%945%7C%F8_H%96%20%249QU%07H%02BHZ%13%5D0%09%89Z%FC%FE%F7G%97%94L%F3%F7%E0%C6%88%97%CE%3A%2B%ED%94%07%1F%7C*c%F0%E0%0B%B0%BF%16%85%F5Mk%98%19%AC(%88%85%3A%D0V%5B%8B%BA%CF%AA%F0%F1c%8F%01%3Bv%01%B1%C8Q%B3tt%D1rb%E6%26%22%BA%AA%CC%EF%7F%A1%87F%C1L%C4%EF%11b%13%2F-%98%B9%D1%E1p%E4%7D%E7%AB%AF%94c%1A%24%00P%BFy%F3k%EE%92%92sHP%E2%82%92%AE%26l'%17h%F6%FB%DF%3B%BB%A4%E4%D4%0F%7B%C0Q%00%60%EBK%2FM%2F%3C%E5%94JGff%E1%01%20%D1%DAy%2B%91%08%3A%F6%ECF%E3%17_%60U%E5Sh%AF%FA%1C%08wX0%3Az%07%1F%1A0%12S%7BHU%D5%9FY%09%D6u%05%083%BF%A2%C5z%C8%82%954in0%F8io%BE%C8%11%5B%A93%01%E9%E5%86%86%80%DD%ED.%E8j%16%EBX%7B'PZjj%3E%F9%B5%C7s%E2_%E2%7D7zDu%EB%D7_%EF%F6z%EF%91%D3%D2RYU%19%AAJJ%2C%86p%7D%3D%9A%B7~%85M%AF%BC%8A%E0%ABK!%DA%DA%E2%7D%CB%88%8E88t%96%CB2%22%FA%BE%95%7C%10%13%11CfI%D2%00%AE*%0F%04%9E%E8%ED%17%12Gj%A5%5E%07%94%2F%9F%7C%F2%14%25%14o%FB%D4%DD%0D%DEz%F9%9E%5E%5C%3C%E9%AE%BD%7B%BF%5C~%E5%95%99%3D%7DV%EE%88%11%8F%D8%D3%D3%D3%9A%B6l%B9!%DC%D0P%CF%AA%82hs3%B7o%AF%C5%F65%9Fq%E0M%ED%02E%AD_k%2F%8B%13%EE%AA%94j%DD%0A%5E%22%A2%D2%F2%40%E0%9CC%01H%A5%CFw3%E2%F7%19%B2%811%A7%CFmYp%24%00%82%A3%C1s%B7%BC%F0%C2)%BE%D9%B3%DF%166%1B%9B%D8%F4%C4%CC%1C%EB%E8%E8%D8%FA%CF%7FN%3E%AE%ACl%FD%A1%3E%D3%FF%FA%EBg%B8%B22%7F%B2%7B%ED%DA3%AB%16%2C%04%EF%DE%03D%23%87%A5t%26%E5%EF%076%EF%DB%07%E0A!%C4%3DfY%ED%16%CD%5CC%11%A3%B3%94%96%97%07%02%A7%1F%A9%3D%3C%E2%20%01%80%C0%B2e%97%14%CD%98%B1%C8%CCtM%2C%BE%1A%89P%5DU%D5%9C%FE'%9C%F0%F4%E1%3C7%07%90%EF%3B~%C4%15hm%BD%1C%E03%BB%11w%3D%BA~%BE%ABr%ACY%3E%B5%00%9E'%A2Ef%95u%16%3D%A9o%00%98d%E2%7B%D1%17%B6W)%8A2a%5Em%AD%F2%8D%06%09%00%D4._~u%C1%C9'%FF%0D%E6%3E%8E%CE%13%DA%B8y%F3%A2%D9C%87%5E%B1%D2%BC%09%9DU%16~%82v%E3%D4%14%22%9A%A4%5D%07%22%C1%F8%A2%A6%C4%A9%8D%01%083%F3z%22%FA%80%88%3Ea%E6%E5f%D5%FD%3D%D0%3FN%01%B0Ts%B5%5Br%E5%03%D8%CC%CC%A3%E6%06%83%E1%23%B9wG%0D%24%00P%B3b%C5u%85%D3%A6%3D%02%0B%1C%A5sgZ%5B%1B%FD%AF%BCr%DE%90%EF%7C%E7%BD%231%A7%0A%AF%B7P%BB%ED!%87%99%DDD%E4PUU%08!%A2%88%F7Im%D4%BA%1Cn7%EBQv%88%DC%C3FD%F3%11%0F%D6%19%FA%40%BA%88%98%CD%CC%3Cvn0%D8~%A4%F7%ED%A8%82%04%00%82o%BCQVx%EA%A9%15%24I%96%DC%EB%09%96%DB%F0%E5%97%CFn%98%3F%FFG%D3%1Ex%A0%0E%FF%25T%E9%F3%5D%08%E0I-%DC%0F%2B%B6%B9%C6E%AA%98%F9%84%23%CDA%BE6%90%00%40%F5%92%25%B3%8A%CE8%E3e%C9n'%2B%20I(%00%B1%B6%F6%D0%BE%F5%EB~%BB%F4%82%0B%EE%9B%B7kW%F4%9B%0A%0E-'%F5%AF%00N6r%90u%E3s%01%80%E5%8A%A2%9Cy%24u%90c%02%24%00%F0%C5%82%05%E3%06_r%C9%7B%92%CB%E52r1%13%91%96%C4%0B%B0%1Ag%2B%1D%3Bw%EEn%AD%09%FEf%FE%94%A9%8F%FF%BE%97%F4%95%A3AZ%A4%FC%0F%CC%7C%9EN%B4%18%EE%83%CE%C4%26%CD%CC%9Dw%B4%E7M_%E7%A2-%BD%F4%D2%CCi%F7%DF%FFV%EA%80%01%E3%F4%8B%D1%25%5E%02VU%B0%CAPc%11VBa%0A74p%C7%EE%DD%D4%B8m%EB%9E5%8B%16%DD%AB%84%23%8F%95%BD%FEz%F31%0C%8E%93%B4%C2%A9%19%DA%0BZ%B6%C2u%D1%E2%AB%8E%94%1F%E4%98%06I%82%EA%3E%FF%FC%B1%9C%91%23%AF%D17%BCK4%CA%05%00VbPBaD%5BZ%D0%BEk'%3Av%ED%E6-%EF%BEK%B5%2B%DFg%AA%DFG%08Gb%60u13%CF%9F%1B%0C%BEw%2C%BC%93V%DD_%0E%E0%16h%97!%9A%F8%3D%BA5%B5%B5f%C4g%F5%B6%AB%FD%1B%07%12%00%F0%2F%5BvN%E1%B4i%2F%0B%A7S%063%B1%AA%B2%1A%8B%91%1A%89%20%DA%DA%8AP%5D%1DB%BBwa%C7%E7%EB%B0%F5%8D7%10%DD%B1%03%D4%D1%C1%AC(%09%B6%93x%97z%00%0B%98y%F1%DC%60%F0%E3%A3%F9%0EZ%87%A1%8B%00%94C%EB%0F%A2%DF%F0%1E%A6%9B%103%BF%E6p8%CE%EB%CD%60%DD7%1A%24%00%F0%8F)S%D2%CE%5E%B4%E8Ugv%F6%C9%D1%8E%0E%8E%B5%B6R%B8%A1%1E%E1%3Du%D8%B7u%2B%B6%BD%F5%16%9A7o%86%08%87%80h%F4%007%BB.%AC%AF%07LDk%09%BA%8C%99%DF6%BB%9A%FD%10%B8%85MU%D5%E9%CC%3C%9D%88%CE%070T%BF%D1%9A%3C%B1%1AM%EC%0C%08j%A0%EA%B5%7C%90%FF*%90t%3A%DE%DE%5Eq%B9%B0%DB%17%84%F7%EC%B1%EF%DC%B0%91w%AEZE%CD%5B%B7%40%0AG%80H%18%067x%EB%BD%94%9C%A4%AD%C5z%22%FALU%D5%0DD%B4UK6%DA%A9%AA%EA%BE%AEw%D6%3D%5EP%40v%BB%3D%0B%40%3E3%17%11%D1%40%C4%5Bq%8FF%BC%91n%A6%26F%3A%FB%B5%1EB%8EI%E7%DFi%40%7F%23%16%8B%5D%D8%1B%19e%FF%D5%20%01%807%2F%BD%5C%DE%DE%DC%F88%FB%FD%E5%A4(%40%24%1C%CF%9D%ED%85%20%5D%17n%93%7Cq%BA(%D0%5D%5C%E5%9D%D1%DECYG%7D%BCJ%FB%FB%DD%00%AE%3C%DC%A4%E5%FF)%90t%FA%14J%07%0DB%2C%FA%18%11M%3F%D4%D3z%2CQ7%E0ha%E6_%1Dn%D9%C3%FF4Ht%0E%A8%09D%F4'f%3EU%2F%C3%ADZ%0C%C7%008%F4%9D%AA%89%E2W%A3%FCQ%08q%DF%E1%14N%F5%81%A4%7B%B0%8C%04%F0%0B%00%17%02ptm%C9y%8Cs%0D%20%DE%A1%E0nUU%17%1CJ%F1v%1FHz%E6%A0%CA%13B%5C%CE%CC%D7%25%AC%0A%1D%60%8E%05%91%A4W%9C%5B%00%BC%09%E0%CF%87%D2%1F%A4%0F%24%BD%03%98%91DT%0E%60%26%80a%09%C0%E8.%0E8%1A%A0%E9%F4%18k%5C%ADMk%8F%BE%00%C0%EB%3DmA%D5%07%92%23DO%95%94%90%A2(%3E%CDgq%96%963%92%DD%D529T%D0t%FD%BBn%AC%A4u%CC%FC%01%11-f%E6U%3Di%83%D9%07%92%AF%89%16%14%17%3B%84%10%05%00N%010%05%F1%5B4%86%01%C8Kb%F2%EAE%84%91B%AC%02%D8%84%F8%7D1%EB%00%BC%CD%CCk%AC%F6j%EF%03%C97%80*%7D%3E%19%401%E21%95Bf%CEG%BC%C8%3BU%7F%DF%0D%11%C5TUm%D6%AEE%DD%A9%5Dj%B8%95%99%9B%AD%DC8%D5G%7D%D4G%7D%D4G%7D%D4G%7D%D4G%7D%D4G%7D%D4G%7D%D4G%7D%D4G%7D%D4G%7D%D4G%7D%D4G%7D%D4C%FA%7F%5E_%A9%BB%EE%093F%00%00%00%00IEND%AEB%60%82\" onclick=\"javascript:sendToFLV();\"/><div style=\"position:relative; top:0;\"><select id=\"methodselector\"><option id=\"embedded\" value=\"embedded\">"+embeddedstring+"</option><option id=\"newtab\" value=\"newtab\">"+newtabstring+"</option><option id=\"newwindow\" value=\"newwindow\">"+newwindowstring+"</option><option id=\"standalone\" value=\"standalone\" selected=\"true\">"+standalonestring+"</option></select></div></td></tr></table>";
			}
			//replace video object
			if(sourceurl.match(/vimeo\.com\/\d{1,8}/)){
				childdivs = videoplayer.getElementsByTagName("div");
				videodiv = childdivs[2];
				videodiv.parentNode.replaceChild(flvideoreplacer, videodiv);

			}else{
				videoplayer.parentNode.replaceChild(flvideoreplacer, videoplayer);
			}

			//**********************check third-party extensions************************************

			//access preferences interface
			this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.");

			var enableditems, whitelist;

			//check enabled extensions
			try{
				enableditems = this.prefs.getCharPref("enabledAddons");
			}catch(e){
				enableditems = this.prefs.getCharPref("enabledItems");
			}finally{

				if(pluginflash === true){

					if (enableditems.match(/\{3d7eb24f-2740-49df-8937-200b1cc08f8a\}/)) {//flashblock


						//access preferences interface
						this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
						.getService(Components.interfaces.nsIPrefService)
						.getBranch("flashblock.");

						try{
							whitelist = this.prefs.getCharPref("whitelist");
						}catch(e){
							whitelist = "";
						}

						if(whitelist.match(sitestring)){

							if(alertsinfo === true){

								//get text from strbundle
								message = strbundle.getString("flashblockbl");
								messagetitle = strbundle.getString("flvideoreplaceralert");

								if(!osString.match(/OSX/) && !osString.match(/Macintosh/) && !osString.match(/OS X/)){
									//alert user
									alertsService = Components.classes["@mozilla.org/alerts-service;1"]
									.getService(Components.interfaces.nsIAlertsService);
									alertsService.showAlertNotification("chrome://flvideoreplacer/skin/icon48.png",
											messagetitle, message,
											false, "", null);
								}
							}
						}
					}else{

						if(alertsinfo === true){

							//get text from strbundle
							message = strbundle.getString("flashblockno");
							messagetitle = strbundle.getString("flvideoreplacermessage");

							if(!osString.match(/OSX/) && !osString.match(/Macintosh/) && !osString.match(/OS X/)){
								//alert user
								alertsService = Components.classes["@mozilla.org/alerts-service;1"]
								.getService(Components.interfaces.nsIAlertsService);
								alertsService.showAlertNotification("chrome://flvideoreplacer/skin/icon48.png",
										messagetitle, message,
										false, "", null);
							}
						}
					}
				}

				if (enableditems.match(/\{84b24861-62f6-364b-eba5-2e5e2061d7e6\}/)) {//mediaplayerconnectivity

					//access preferences interface
					this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
					.getService(Components.interfaces.nsIPrefService)
					.getBranch("extensions.mediaplayerconnectivity.");

					try{
						whitelist = this.prefs.getCharPref("whiteList");
					}catch(e){
						whitelist = "";
					}

					if(!whitelist.match(sitestring)){

						if(alertserror === true){

							//get text from strbundle
							message = strbundle.getFormattedString("mpc", [ sitename ]);
							messagetitle = strbundle.getString("flvideoreplaceralert");

							if(osString.match(/OSX/) || osString.match(/Macintosh/) || osString.match(/OS X/)){
								//alert user
								prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
								.getService(Components.interfaces.nsIPromptService);
								prompts.alert(window, messagetitle, message);
							}else{
								//alert user
								alertsService = Components.classes["@mozilla.org/alerts-service;1"]
								.getService(Components.interfaces.nsIAlertsService);
								alertsService.showAlertNotification("chrome://flvideoreplacer/skin/icon48.png",
										messagetitle, message,
										false, "", null);
							}
						}
					}
				}

				/*
				if (enableditems.match(/\{73a6fe31-595d-460b-a920-fcc0f8843232\}/)) {//NoScript

					//access preferences interface
					this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
					.getService(Components.interfaces.nsIPrefService)
					.getBranch("noscript.");

					var forbidflash = this.prefs.getBoolPref("forbidFlash");
					var forbidplugins = this.prefs.getBoolPref("forbidPlugins");
					var nstemp = this.prefs.getCharPref("temp");
				}
				 */
			}
		},

		placeHolderReplace: function(evt) {

			//declare variables
			var aEvent = content.document;
			var aBranch = evt.target.getAttribute("branch");
			var aMethod = evt.target.getAttribute("method");

			//access preferences interface
			this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.flvideoreplacer.");

			//get prefs
			this.prefs.setCharPref("promptmethod",aMethod);

			//replace placeholder
			flvideoreplacerListener.videoReplace(aEvent,aBranch);
		},

		videoReplace: function(aEvent,aBranch) {

			if(aEvent == content.document){
				//get original target document and url
				var doc = content.document; 
				var sourceurl = content.document.location.href;
			}else{
				//get original target document and url
				var doc = aEvent.originalTarget;
				var sourceurl = doc.location.href;
			}

			//access preferences interface
			this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.flvideoreplacer.video.");

			//get video json from prefs
			var videodata = this.prefs.getCharPref(aBranch);

			//parse json
			jsonObjectLocal = JSON.parse(videodata);
			//declare video variables
			var sitename = flvideoreplacerListener.sanitizeString(jsonObjectLocal.sitename);
			var sitestring = flvideoreplacerListener.sanitizeString(jsonObjectLocal.sitestring);
			var videowidth = flvideoreplacerListener.sanitizeString(jsonObjectLocal.videowidth);
			var videoheight = flvideoreplacerListener.sanitizeString(jsonObjectLocal.videoheight);
			var videoelement = flvideoreplacerListener.sanitizeString(jsonObjectLocal.videoelement);
			var videourl = jsonObjectLocal.videourl;
			var newmimetype = flvideoreplacerListener.sanitizeString(jsonObjectLocal.videomime);
			var fmt = flvideoreplacerListener.sanitizeString(jsonObjectLocal.videofmt);

			//get osString
			var osString = Components.classes["@mozilla.org/network/protocol;1?name=http"]
			.getService(Components.interfaces.nsIHttpProtocolHandler).oscpu; 

			//access preferences interface
			this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.flvideoreplacer.");

			//get prefs
			var replacemethod = this.prefs.getCharPref("promptmethod");
			var alertsinfo = this.prefs.getBoolPref("alertsinfo");
			var alertserror = this.prefs.getBoolPref("alertserror");
			var mimetype = this.prefs.getCharPref("mimetype");
			var autolaunchplayer = this.prefs.getBoolPref("autolaunchplayer");
			var autolaunchtab = this.prefs.getBoolPref("autolaunchtab");
			var autolaunchwindow = this.prefs.getBoolPref("autolaunchwindow");
			var fallback = this.prefs.getCharPref("fallback");

			//get localization
			var strbundle = document.getElementById("flvideoreplacerstrings");
			var original = strbundle.getString("original");
			var standard = strbundle.getString("standard");
			var message, messagetitle, prompts, alertsService;

			//declare variables
			var params, videoplayer, flvideoreplacer, childdivs, videodiv;

			//access preferences interface
			this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.flvideoreplacer.");

			if(replacemethod === "embedded"){

				//get plugin compatibility
				var pluginmp4 = this.prefs.getBoolPref("pluginmp4");
				var pluginflv = this.prefs.getBoolPref("pluginflv");
				var pluginqt = this.prefs.getBoolPref("pluginqt");
				var pluginwmp = this.prefs.getBoolPref("pluginwmp");
				var pluginwmv = this.prefs.getBoolPref("pluginwmv");
				var pluginmov = this.prefs.getBoolPref("pluginmov");
				var pluginm4v = this.prefs.getBoolPref("pluginm4v");

				//declare element to be replaced
				if(sourceurl.match(/youtube.*watch.*v\=/)){
					//declare element to be replaced
					try{
						doc.getElementById("flash-upgrade").hidden = true;
					}catch(e){
						//do nothing
					}
					videoplayer = doc.getElementById('movie_player');
					if(videoplayer == null){
						videoplayer = doc.getElementById('watch-player');
					}					
				}else if(sourceurl.match(/redtube\.com\/\d{1,8}/)){
					videoplayer = doc.getElementById("redtube_flv_player");
					if(videoplayer !== null){
						videoplayer.setAttribute('id',"redtube_flvideoreplacer");
						videoplayer = doc.getElementById(videoelement);
					}else{
						videoplayer = doc.getElementById(videoelement);
					}
				}else{
					videoplayer = doc.getElementById(videoelement);
				}

				if(newmimetype === "video/x-quicktime"){

					if(pluginmov === true){

						//create the object element
						flvideoreplacer = doc.createElement('object');
						flvideoreplacer.setAttribute("width", videowidth);
						flvideoreplacer.setAttribute("height", videoheight);
						flvideoreplacer.setAttribute("classid", "clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B");
						flvideoreplacer.setAttribute("codebase", "http://www.apple.com/qtactivex/qtplugin.cab");  
						flvideoreplacer.setAttribute("type", "video/x-quicktime");
						//append innerHTML code
						flvideoreplacer.innerHTML = "<param name=\"src\" value=\""+videourl+"\"></param><param name=\"autoplay\" value=\"true\"><param name=\"controller\" value=\"true\"><param name=\"loop\" value=\"false\"><param name=\"scale\" value=\"aspect\"><embed src=\""+videourl+"\" width=\""+videowidth+"\" height=\""+videoheight+"\" scale=\"aspect\" type=\"video/x-quicktime\" autoplay=\"true\" controller=\"true\" loop=\"false\" </embed>";
						if(sourceurl.match(/vimeo\.com\/\d{1,8}/)){
							childdivs = videoplayer.getElementsByTagName("div");
							videodiv = childdivs[2];
							//replace video
							videodiv.parentNode.replaceChild(flvideoreplacer, videodiv);

						}else{
							//replace video
							videoplayer.parentNode.replaceChild(flvideoreplacer, videoplayer);
						}
					}else{
						newmimetype = "video/mp4";
					}
				}
				if(newmimetype === "application/x-ms-wmv"){

					if(pluginwmv === true){

						//create the object element
						flvideoreplacer = doc.createElement('object');
						flvideoreplacer.setAttribute("width", videowidth);
						flvideoreplacer.setAttribute("height", videoheight);
						flvideoreplacer.setAttribute("type", "application/x-ms-wmv");
						//append innerHTML code
						flvideoreplacer.innerHTML = "<param name=\"src\" value=\""+videourl+"\"></param><param name=\"autoplay\" value=\"true\"><param name=\"controller\" value=\"true\"><param name=\"loop\" value=\"false\"><param name=\"scale\" value=\"aspect\"><embed src=\""+videourl+"\" width=\""+videowidth+"\" height=\""+videoheight+"\" scale=\"aspect\" type=\"application/x-ms-wmv\" autoplay=\"true\" controller=\"true\" loop=\"false\" </embed>";
						if(sourceurl.match(/vimeo\.com\/\d{1,8}/)){
							childdivs = videoplayer.getElementsByTagName("div");
							videodiv = childdivs[2];
							//replace video
							videodiv.parentNode.replaceChild(flvideoreplacer, videodiv);

						}else{
							//replace video
							videoplayer.parentNode.replaceChild(flvideoreplacer, videoplayer);
						}
					}else{
						newmimetype = "video/mp4";
					}
				}
				if(newmimetype === "video/x-m4v"){

					if(pluginm4v === true){

						//create the object element
						flvideoreplacer = doc.createElement('object');
						flvideoreplacer.setAttribute("width", videowidth);
						flvideoreplacer.setAttribute("height", videoheight);
						flvideoreplacer.setAttribute("type", "video/x-m4v");
						//append innerHTML code
						flvideoreplacer.innerHTML = "<param name=\"src\" value=\""+videourl+"\"></param><param name=\"autoplay\" value=\"true\"><param name=\"controller\" value=\"true\"><param name=\"loop\" value=\"false\"><param name=\"scale\" value=\"aspect\"><embed src=\""+videourl+"\" width=\""+videowidth+"\" height=\""+videoheight+"\" scale=\"aspect\" type=\"video/x-m4v\" autoplay=\"true\" controller=\"true\" loop=\"false\" </embed>";
						if(sourceurl.match(/vimeo\.com\/\d{1,8}/)){
							childdivs = videoplayer.getElementsByTagName("div");
							videodiv = childdivs[2];
							//replace video
							videodiv.parentNode.replaceChild(flvideoreplacer, videodiv);

						}else{
							//replace video
							videoplayer.parentNode.replaceChild(flvideoreplacer, videoplayer);
						}
					}else{
						newmimetype = "video/mp4";
					}
				}
				if(newmimetype === "application/x-flv"){

					if(pluginflv === true){

						//create the object element
						flvideoreplacer = doc.createElement('object');
						flvideoreplacer.setAttribute("width", videowidth);
						flvideoreplacer.setAttribute("height", videoheight);
						flvideoreplacer.setAttribute("type", "application/x-flv");
						//append innerHTML code
						flvideoreplacer.innerHTML = "<param name=\"src\" value=\""+videourl+"\"></param><param name=\"autoplay\" value=\"true\"><param name=\"controller\" value=\"true\"><param name=\"loop\" value=\"false\"><param name=\"scale\" value=\"aspect\"><embed src=\""+videourl+"\" width=\""+videowidth+"\" height=\""+videoheight+"\" scale=\"aspect\" type=\"application/x-flv\" autoplay=\"true\" controller=\"true\" loop=\"false\" </embed>";
						if(sourceurl.match(/vimeo\.com\/\d{1,8}/)){
							childdivs = videoplayer.getElementsByTagName("div");
							videodiv = childdivs[2];
							//replace video
							videodiv.parentNode.replaceChild(flvideoreplacer, videodiv);

						}else{
							//replace video
							videoplayer.parentNode.replaceChild(flvideoreplacer, videoplayer);
						}
					}else{//fallback
						newmimetype = "video/mp4";
					}
				}

				if(newmimetype === "video/mp4"){

					if(pluginmp4 === true){

						//create the object element
						flvideoreplacer = doc.createElement('object');
						flvideoreplacer.setAttribute("width", videowidth);
						flvideoreplacer.setAttribute("height", videoheight);
						flvideoreplacer.setAttribute("classid", "clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B");
						flvideoreplacer.setAttribute("codebase", "http://www.apple.com/qtactivex/qtplugin.cab");
						flvideoreplacer.setAttribute("type", "video/mp4");
						//append innerHTML code
						flvideoreplacer.innerHTML = "<param name=\"src\" value=\""+videourl+"\"></param><param name=\"autoplay\" value=\"true\"><param name=\"controller\" value=\"true\"><param name=\"loop\" value=\"false\"><param name=\"scale\" value=\"aspect\"> <embed src=\""+videourl+"\" width=\""+videowidth+"\" height=\""+videoheight+"\" scale=\"aspect\" type=\"video/mp4\" autoplay=\"true\" controller=\"true\" loop=\"false\" </embed>";
						if(sourceurl.match(/vimeo\.com\/\d{1,8}/)){
							childdivs = videoplayer.getElementsByTagName("div");
							videodiv = childdivs[2];
							//replace video
							videodiv.parentNode.replaceChild(flvideoreplacer, videodiv);
						}else{
							//replace video
							videoplayer.parentNode.replaceChild(flvideoreplacer, videoplayer);
						}

					}else{//fallback
						newmimetype = "video/quicktime";
					}
				}

				if(newmimetype === "video/quicktime"){

					if(pluginqt === true){
						//create the object element
						flvideoreplacer = doc.createElement('object');
						flvideoreplacer.setAttribute("width", videowidth);
						flvideoreplacer.setAttribute("height", videoheight);
						flvideoreplacer.setAttribute("classid", "clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B");
						flvideoreplacer.setAttribute("codebase", "http://www.apple.com/qtactivex/qtplugin.cab");
						flvideoreplacer.setAttribute("type", "video/quicktime");
						//append innerHTML code
						flvideoreplacer.innerHTML = "<param name=\"src\" value=\""+videourl+"\"></param><param name=\"autoplay\" value=\"true\"><param name=\"controller\" value=\"true\"><param name=\"loop\" value=\"false\"><param name=\"scale\" value=\"aspect\"><embed src=\""+videourl+"\" width=\""+videowidth+"\" height=\""+videoheight+"\" scale=\"aspect\" type=\"video/quicktime\" autoplay=\"true\" controller=\"true\" loop=\"false\" </embed>";
						if(sourceurl.match(/vimeo\.com\/\d{1,8}/)){
							childdivs = videoplayer.getElementsByTagName("div");
							videodiv = childdivs[2];
							//replace video
							videodiv.parentNode.replaceChild(flvideoreplacer, videodiv);

						}else{
							//replace video
							videoplayer.parentNode.replaceChild(flvideoreplacer, videoplayer);
						}
					}else{//fallback
						newmimetype = "application/x-mplayer2";
					}
				}
				if(newmimetype === "application/x-mplayer2"){

					if(pluginwmp === true){

						//create the object element
						flvideoreplacer = doc.createElement('object');
						flvideoreplacer.setAttribute("width", videowidth);
						flvideoreplacer.setAttribute("height", videoheight);
						flvideoreplacer.setAttribute("classid", "clsid:6BF52A52-394A-11D3-B153-00C04F79FAA6");
						flvideoreplacer.setAttribute("codebase", "http://activex.microsoft.com/activex/controls/mplayer/en/nsmp2inf.cab#Version=6,4,7,1112");
						flvideoreplacer.setAttribute("standby", "Loading Microsoft Windows Media Player components...");
						flvideoreplacer.setAttribute("type", "application/x-oleobject");
						//append innerHTML code
						flvideoreplacer.innerHTML = "<param name=\"fileName\" value=\""+videourl+"\"></param><param name=\"autoStart\" value=\"true\"><param name=\"showControls\" value=\"true\"><param name=\"loop\" value=\"false\"><embed type=\"application/x-mplayer2\" autostart=\"true\" showcontrols=\"true\" loop=\"false\" src=\""+videourl+"\" width=\""+videowidth+"\" height=\""+videoheight+"\" </embed>";
						if(sourceurl.match(/vimeo\.com\/\d{1,8}/)){
							childdivs = videoplayer.getElementsByTagName("div");
							videodiv = childdivs[2];
							//replace video
							videodiv.parentNode.replaceChild(flvideoreplacer, videodiv);

						}else{
							//replace video
							videoplayer.parentNode.replaceChild(flvideoreplacer, videoplayer);
						}
					}else{//fallback


						if(fallback === "flowplayer"){

							if(!sourceurl.match(/youtube.*watch.*v\=/) && !sourceurl.match(/ustream\.tv\/recorded\/\d{1,8}/) && !sourceurl.match(/redtube\.com\/\d{1,8}/)){
								//create the object element
								flvideoreplacer = doc.createElement('object');
								flvideoreplacer.setAttribute("width", videowidth);
								flvideoreplacer.setAttribute("height", videoheight);
								flvideoreplacer.setAttribute("type", "application/x-shockwave-flash");
								flvideoreplacer.setAttribute("data", "http://releases.flowplayer.org/swf/flowplayer-3.2.7.swf");
								//append innerHTML code
								flvideoreplacer.innerHTML = "<param name=\"movie\" value=\"http://releases.flowplayer.org/swf/flowplayer-3.2.7.swf\"></param><param name=\"allowfullscreen\" value=\"true\"></param><param name=\"flashvars\" value='config={\"playlist\":[\"http://www.webgapps.org/flowplayer/flashvideoreplacer.png\", {\"url\": \""+videourl+"\",\"autoPlay\":true,\"autoBuffering\":true}]}'></param><img src=\"http://www.webgapps.org/flowplayer/flashvideoreplacer.png\" width=\""+videowidth+"\" height=\""+videowidth+"\" alt=\"FlashVideoReplacer\" title=\"No video playback capabilities.\" />";
								if(sourceurl.match(/vimeo\.com\/\d{1,8}/)){
									childdivs = videoplayer.getElementsByTagName("div");
									videodiv = childdivs[2];
									//replace video
									videodiv.parentNode.replaceChild(flvideoreplacer, videodiv);

								}else{
									//replace video
									videoplayer.parentNode.replaceChild(flvideoreplacer, videoplayer);
								}	
							}else{
								var fmt = "99";
							}
						}else if(fallback === "neolao"){
							if(!sourceurl.match(/youtube.*watch.*v\=/) && !sourceurl.match(/ustream\.tv\/recorded\/\d{1,8}/) && !sourceurl.match(/redtube\.com\/\d{1,8}/)){
								//create the object element
								flvideoreplacer = doc.createElement('object');
								flvideoreplacer.setAttribute("width", videowidth);
								flvideoreplacer.setAttribute("height", videoheight);
								flvideoreplacer.setAttribute("type", "application/x-shockwave-flash");
								flvideoreplacer.setAttribute("data", "http://flv-player.net/medias/player_flv_maxi.swf");
								//append innerHTML code
								flvideoreplacer.innerHTML = "<param name=\"movie\" value=\"http://flv-player.net/medias/player_flv_maxi.swf\"></param>" +
								"<param name=\"allowfullscreen\" value=\"true\"></param>" +
								"<param name=\"FlashVars\" value=\"flv="+videourl+"&amp;title=FlashVideoReplacer&amp;startimage=http://www.webgapps.org/flowplayer/flashvideoreplacer.png\"</param>";								
								if(sourceurl.match(/vimeo\.com\/\d{1,8}/)){
									childdivs = videoplayer.getElementsByTagName("div");
									videodiv = childdivs[2];
									//replace video
									videodiv.parentNode.replaceChild(flvideoreplacer, videodiv);

								}else{
									//replace video
									videoplayer.parentNode.replaceChild(flvideoreplacer, videoplayer);
								}	
							}else{
								var fmt = "99";
							}	
						}else{
							var fmt = "99";
						}
					}
				}
			}

			if(replacemethod === "newtab"){

				//autolaunch placeholder
				if(autolaunchtab === true){
					flvideoreplacerListener.placeHolder(aEvent,aBranch);
				}

				//open media in new tab
				var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
				.getInterface(Components.interfaces.nsIWebNavigation)
				.QueryInterface(Components.interfaces.nsIDocShellTreeItem)
				.rootTreeItem
				.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
				.getInterface(Components.interfaces.nsIDOMWindow);

				mainWindow.gBrowser.selectedTab = mainWindow.gBrowser.addTab(videourl);

				//content.window.location.href = videourl;
			}

			if(replacemethod === "newwindow"){

				//set videourl pref
				this.prefs.setCharPref("videourl",videourl);

				//autolaunch placeholder
				if(autolaunchwindow === true){
					flvideoreplacerListener.placeHolder(aEvent,aBranch);
				}

				//launch player
				if(osString.match(/Windows/)){
					window.open(videourl, 'flvideoreplacer-player', 'content,centerscreen,alwaysRaised,resizable=yes,width=600em,height=400em').focus();
				}else{
					window.openDialog('chrome://flvideoreplacer/content/player.xul', 'flvideoreplacer-player', 'chrome,centerscreen,alwaysRaised,resizable=yes,width=600em,height=400em').focus();
				}
			}

			if(replacemethod === "standalone"){

				//set videourl pref
				this.prefs.setCharPref("videourl",videourl);
				//declare variables
				var player, process;

				//autolaunch placeholder
				if(autolaunchplayer === true){
					flvideoreplacerListener.placeHolder(aEvent,aBranch);
				}

				if(sourceurl.match(/vimeo\.com\/\d{1,8}/)){

					//load url bar change listener for getting url redirection 
					flvideoreplacerURLBar.init();

					var newTab = gBrowser.addTab(videourl);
					newTab.label = "FlashVideoReplacer";
					newTab.id = "FlashVideoReplacerVimeo"; 
					gBrowser.selectedTab = newTab;

				}else{

					//access preferences interface
					this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
					.getService(Components.interfaces.nsIPrefService)
					.getBranch("extensions.flvideoreplacer.");

					//get player path
					var playerpath = this.prefs.getCharPref("playerpath");

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
								fmt = "98";
							}
						}catch (e){
							fmt = "98";
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
								fmt = "98";
							}
						}catch (e){
							fmt = "98";
						}
					}
				}
			}
			if(alertsinfo === true){
				//video info alert
				if (fmt === "5") {
					message = strbundle.getFormattedString("videores", [ "240p flv ("+mimetype+")" ]);
				}
				if (fmt === "18") {
					message = strbundle.getFormattedString("videores", [ "360p mp4 ("+mimetype+")" ]);
				}
				if (fmt === "34") {
					message = strbundle.getFormattedString("videores", [ "360p flv ("+mimetype+")" ]);
				}
				if (fmt === "35") {
					message = strbundle.getFormattedString("videores", [ "480p flv ("+mimetype+")" ]);
				}
				if (fmt === "22") {
					message = strbundle.getFormattedString("videores", [ "720p mp4 ("+mimetype+")" ]);
				}
				if (fmt === "37") {
					message = strbundle.getFormattedString("videores", [ "1080p mp4 ("+mimetype+")" ]);
				}
				if (fmt === "38") {
					message = strbundle.getFormattedString("videores", [ original+" ("+mimetype+")" ]);
				}
				if (fmt === "97") {

					if(videourl.match(/\.mp4/)){
						message = strbundle.getFormattedString("videores", [ standard+" mp4 ("+mimetype+")" ]);
					}else if(videourl.match(/\.flv/)){
						message = strbundle.getFormattedString("videores", [ standard+" flv ("+mimetype+")" ]);
					}else if(videourl.match(/\.mov/)){
						message = strbundle.getFormattedString("videores", [ standard+" mov ("+mimetype+")" ]);
					}else if(videourl.match(/\.m4v/)){
						message = strbundle.getFormattedString("videores", [ standard+" m4v ("+mimetype+")" ]);
					}else if(videourl.match(/\.wmv/)){
						message = strbundle.getFormattedString("videores", [ standard+" wmv ("+mimetype+")" ]);
					}else{
						message = strbundle.getFormattedString("videores", [ standard+" ("+mimetype+")" ]);
					}
				}
				//trigger alerts
				if (fmt !== "98" && fmt !== "99") {//standard resolution message

					if(!osString.match(/OSX/) && !osString.match(/Macintosh/) && !osString.match(/OS X/)){
						messagetitle = strbundle.getString("flvideoreplacermessage");
						//alert user
						alertsService = Components.classes["@mozilla.org/alerts-service;1"]
						.getService(Components.interfaces.nsIAlertsService);
						alertsService.showAlertNotification("chrome://flvideoreplacer/skin/icon48.png",
								messagetitle, message,
								false, "", null);
					}
				}
			}
			if(alertserror === true){

				if (fmt === "98"){//no available player message
					message = strbundle.getFormattedString("nostandalone", [ mimetype ]);
					messagetitle = strbundle.getString("flvideoreplacermessage");

					if(osString.match(/OSX/) || osString.match(/Macintosh/) || osString.match(/OS X/)){
						//alert user
						prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
						.getService(Components.interfaces.nsIPromptService);
						prompts.alert(window, messagetitle, message);
					}else{
						//alert user
						alertsService = Components.classes["@mozilla.org/alerts-service;1"]
						.getService(Components.interfaces.nsIAlertsService);
						alertsService.showAlertNotification("chrome://flvideoreplacer/skin/icon48.png",
								messagetitle, message,
								false, "", null);
					}
				}
				if (fmt === "99"){//no available plugin message

					message = strbundle.getFormattedString("noreplace", [ mimetype ]);
					messagetitle = strbundle.getString("flvideoreplacermessage");

					if(osString.match(/OSX/) || osString.match(/Macintosh/) || osString.match(/OS X/)){
						//alert user
						prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
						.getService(Components.interfaces.nsIPromptService);
						prompts.alert(window, messagetitle, message);
					}else{
						//alert user
						alertsService = Components.classes["@mozilla.org/alerts-service;1"]
						.getService(Components.interfaces.nsIAlertsService);
						alertsService.showAlertNotification("chrome://flvideoreplacer/skin/icon48.png",
								messagetitle, message,
								false, "", null);
					}
				}
			}
		},

		webmReplace: function(aEvent) {

			//get original target document and url
			var doc = aEvent.originalTarget;
			var sourceurl = doc.location.href;

			//get osString
			var osString = Components.classes["@mozilla.org/network/protocol;1?name=http"]
			.getService(Components.interfaces.nsIHttpProtocolHandler).oscpu; 

			//access preferences interface
			this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.flvideoreplacer.");

			//get alerts prefs
			var alertsinfo = this.prefs.getBoolPref("alertsinfo");

			if(sourceurl.match(/youtube.*watch.*v\=/)){

				//fetch video ID from url
				var videoid = sourceurl.replace(/.*v\=/, "").replace(/\&.*/,"");
				//declare webm url
				var webmurl = "http://www.youtube.com/watch?v="+videoid+"&html5=True";
				//load webm page
				doc.location.href = webmurl;

				if(alertsinfo === true){

					//get localization
					var strbundle = document.getElementById("flvideoreplacerstrings");
					var message = strbundle.getFormattedString("videores", [ "HTML5 WebM" ]);
					var messagetitle = strbundle.getString("flvideoreplacermessage");

					if(!osString.match(/OSX/) && !osString.match(/Macintosh/) && !osString.match(/OS X/)){
						//alert user
						var alertsService = Components.classes["@mozilla.org/alerts-service;1"]
						.getService(Components.interfaces.nsIAlertsService);
						alertsService.showAlertNotification("chrome://flvideoreplacer/skin/icon48.png",
								messagetitle, message,
								false, "", null);
					}
				}
			}
		},

		menuClickDetect: function (event) {

			switch(event.button) {
			case 0:
				//Left click
				break;
			case 1:
				//Middle click

				//access preferences interface
				this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
				.getService(Components.interfaces.nsIPrefService)
				.getBranch("extensions.flvideoreplacer.");

				//get prefs
				var enabled = this.prefs.getBoolPref("enabled");

				if(enabled === true){
					this.prefs.setBoolPref("enabled", false);
					document.getElementById("flvideoreplacer-toolbar-button").setAttribute('class',"toolbarbutton-1 chromeclass-toolbar-additional toolbarinactive");
				}else{
					this.prefs.setBoolPref("enabled", true);
					document.getElementById("flvideoreplacer-toolbar-button").setAttribute('class',"toolbarbutton-1 chromeclass-toolbar-additional toolbaractive");
				}
				break;
			case 2:
				//Right click
				break;
			}
		},

		showHideMenus: function () {//show and hide context menus

			//get source url and domain
			var sourceurl = content.window.location.href;
			var hostdomain = content.window.location.host;

			//check private mode
			var pbs = Components.classes["@mozilla.org/privatebrowsing;1"]  
			.getService(Components.interfaces.nsIPrivateBrowsingService);
			var inPrivateBrowsingMode = pbs.privateBrowsingEnabled;  

			//access preferences interface
			this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.flvideoreplacer.");

			//get embedded option
			var replaceembedded;
			var replaceyt = this.prefs.getBoolPref("youtube");
			var replacevimeo = this.prefs.getBoolPref("vimeo");
			var enabled = this.prefs.getBoolPref("enabled");

			//get localization
			var strbundle = document.getElementById("flvideoreplacerstrings");
			var original = strbundle.getString("original");
			var standard = strbundle.getString("standard");
			var detectionadd = strbundle.getFormattedString("detectionadd", [ hostdomain ]);
			var detectionremove = strbundle.getFormattedString("detectionremove", [ hostdomain ]);

			//hide menus
			document.getElementById("flvideoreplacer-embedded").hidden = true;
			document.getElementById("flvideoreplacer-embedded-detection").hidden = true;
			document.getElementById("flvideoreplacer-embedded-separator").hidden = true;
			document.getElementById("flvideoreplacer-copy").hidden = true;
			document.getElementById("flvideoreplacer-download").hidden = true;


			if(enabled === true){
				//declare variables
				var detection = false, pagecontent,videoid, aSite, vidfilename, downloadurl=null, downloadurl5=null, downloadurl18=null, downloadurl34=null, downloadurl35=null, downloadurl22=null, downloadurl37=null, downloadurl38=null;

				if((replaceyt === true || replacevimeo === true) 
						&& sourceurl.match(/http/) 
						&& (!sourceurl.match(/youtube/)
								&& !sourceurl.match(/vimeo/)
								&& !sourceurl.match(/metacafe/)
								&& !sourceurl.match(/blip/)
								&& !sourceurl.match(/ustream/)
								&& !sourceurl.match(/youporn/)
								&& !sourceurl.match(/pornhub/)
								&& !sourceurl.match(/redtube/)
						))
				{

					//unhide menus
					document.getElementById("flvideoreplacer-embedded-detection").hidden = false;
					document.getElementById("flvideoreplacer-embedded-separator").hidden = false;

					//remove old menupopup elements
					var detectionmenupopup = document.getElementById("flvideoreplacer-embedded-detection-select");
					var detectionmenupopupvbox = document.getElementById("flvideoreplacer-embedded-detection-select-vbox");
					try{
						detectionmenupopup.removeChild(detectionmenupopup.firstChild);
					}catch(e){
						//do nothing
					}
					//append new vbox
					var detectionnewvbox = document.createElement("vbox");
					detectionnewvbox.setAttribute("id","flvideoreplacer-embedded-detection-select-vbox");
					detectionmenupopup.appendChild(detectionnewvbox);
					var detectionmenuitem;

					try{

						if (!inPrivateBrowsingMode){
							//access preferences interface
							this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
							.getService(Components.interfaces.nsIPrefService)
							.getBranch("extensions.flvideoreplacer.detect.");
						}else{
							//access preferences interface
							this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
							.getService(Components.interfaces.nsIPrefService)
							.getBranch("extensions.flvideoreplacer.detectprivate.");
						}

						var detection = this.prefs.getBoolPref(hostdomain);

					}catch(e){
						detection = false;
						replaceembedded = false;
					}finally{
						if(detection === true){
							replaceembedded = true;
						}else{
							replaceembedded = false;
						}
					}

					if(detection === true){
						//append new menuitem
						detectionmenuitem = document.createElement("menuitem");
						detectionmenuitem.setAttribute("label",detectionremove);
						detectionmenuitem.setAttribute('action','remove');
						detectionmenuitem.setAttribute('host',hostdomain);
						detectionmenuitem.setAttribute('oncommand',"flvideoreplacerListener.detectionManager(this.getAttribute('action'),this.getAttribute('host'));");
						detectionnewvbox.appendChild(detectionmenuitem);
					}else{
						//append new menuitem
						detectionmenuitem = document.createElement("menuitem");
						detectionmenuitem.setAttribute("label",detectionadd);
						detectionmenuitem.setAttribute('action','add');
						detectionmenuitem.setAttribute('host',hostdomain);
						detectionmenuitem.setAttribute('oncommand',"flvideoreplacerListener.detectionManager(this.getAttribute('action'),this.getAttribute('host'));");
						detectionnewvbox.appendChild(detectionmenuitem);
					}

					if(replaceembedded === true){

						//remove old menupopup elements
						var embeddedmenupopup = document.getElementById("flvideoreplacer-embedded-select");
						var embeddedmenupopupvbox = document.getElementById("flvideoreplacer-embedded-select-vbox");
						try{
							embeddedmenupopup.removeChild(embeddedmenupopup.firstChild);
						}catch(e){
							//do nothing
						}
						//append new vbox
						var embeddednewvbox = document.createElement("vbox");
						embeddednewvbox.setAttribute("id","flvideoreplacer-embedded-select-vbox");
						embeddedmenupopup.appendChild(embeddednewvbox);
						var embeddedmenuitem;

						try{
							var pagecontent = content.window.document.getElementsByTagName("body").item(0).innerHTML;
							var newline = pagecontent.split("\n");
							var newembedid;

							for(var i=0; i< newline.length; i++){

								//match patterns
								var matchyoutoubeembed = /.*iframe.*class="youtube-player".*src="http:\/\/www.youtube.com\/embed\//.test(newline[i]);
								var matchyoutoubeembedold = /object.*param.*name="movie".*value="http:\/\/www.youtube.com\/v\//.test(newline[i]);
								var matchvimeoembed = /iframe src="http:\/\/player.vimeo.com\/video\//.test(newline[i]);
								var matchvimeoembedold = /object.*param.*name="movie".*value="http:\/\/vimeo.com\/moogaloop.swf\?clip_id=/.test(newline[i]);

								if (matchyoutoubeembedold === true) {

									newembedid = newline[i].replace(/.*http:\/\/www.youtube.com\/v\//,"").replace(/\?.*/,"").replace(/\&.*/,"");
									newlink = "http://www.youtube.com/watch?v="+newembedid;

									//append new menuitem
									embeddedmenuitem = document.createElement("menuitem");
									embeddedmenuitem.setAttribute("label",newlink);
									embeddedmenuitem.setAttribute('oncommand',"flvideoreplacerListener.openLink(this.getAttribute('label'));");
									embeddednewvbox.appendChild(embeddedmenuitem);
									document.getElementById("flvideoreplacer-embedded").hidden = false;

								}

								if (matchyoutoubeembed === true) {

									newembedid = newline[i].replace(/.*http:\/\/www.youtube.com\/embed\//,"").replace(/".*/,"");
									newlink = "http://www.youtube.com/watch?v="+newembedid;

									//append new menuitem
									embeddedmenuitem = document.createElement("menuitem");
									embeddedmenuitem.setAttribute("label",newlink);
									embeddedmenuitem.setAttribute('oncommand',"flvideoreplacerListener.openLink(this.getAttribute('label'));");
									embeddednewvbox.appendChild(embeddedmenuitem);
									document.getElementById("flvideoreplacer-embedded").hidden = false;

								}

								if (matchvimeoembed === true) {

									newembedid = newline[i].replace(/.*http:\/\/player.vimeo.com\/video\//,"").replace(/\?.*/,"").replace(/\&.*/,"");
									newlink = "http://vimeo.com/"+newembedid;

									//append new menuitem
									embeddedmenuitem = document.createElement("menuitem");
									embeddedmenuitem.setAttribute("label",newlink);
									embeddedmenuitem.setAttribute('oncommand',"flvideoreplacerListener.openLink(this.getAttribute('label'));");
									embeddednewvbox.appendChild(embeddedmenuitem);
									document.getElementById("flvideoreplacer-embedded").hidden = false;
								}

								if (matchvimeoembedold === true) {

									newembedid = newline[i].replace(/.*http:\/\/vimeo.com\/moogaloop.swf\?clip_id=/,"").replace(/\?.*/,"").replace(/\&.*/,"");
									newlink = "http://vimeo.com/"+newembedid;

									//append new menuitem
									embeddedmenuitem = document.createElement("menuitem");
									embeddedmenuitem.setAttribute("label",newlink);
									embeddedmenuitem.setAttribute('oncommand',"flvideoreplacerListener.openLink(this.getAttribute('label'));");
									embeddednewvbox.appendChild(embeddedmenuitem);
									document.getElementById("flvideoreplacer-embedded").hidden = false;
								}
							}
						}catch(e){
							//do nothing
						}

					}else{
						//do nothing
					}

				}else{
					//do nothing
				}

				if((sourceurl.match(/youtube.*watch.*v\=/) && !sourceurl.match("html5=True")) 
						|| sourceurl.match(/vimeo\.com\/\d{1,8}/)
						|| sourceurl.match(/metacafe\.com\/watch\//)
						|| sourceurl.match(/blip\.tv\/file\/.*/)
						|| sourceurl.match(/ustream\.tv\/recorded\/\d{1,8}/)
						|| sourceurl.match(/youporn\.com\/watch\//)
						|| sourceurl.match(/pornhub\.com\/view_video.php\?viewkey=/)
						|| sourceurl.match(/redtube\.com\/\d{1,8}/)
				){//match supported sites

					try{
						//access preferences interface
						this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
						.getService(Components.interfaces.nsIPrefService)
						.getBranch("extensions.flvideoreplacer.downloadersource.");

						if(sourceurl.match(/youtube.*watch.*v\=/)){
							//fetch video ID from url
							aSite = "youtube";
							videoid = sourceurl.replace(/.*v\=/, "").replace(/\&.*/,"");
							try{
								downloadurl5 = this.prefs.getCharPref(aSite+"."+videoid+".5");
							}catch(e){
								//do nothing
							}
							try{
								downloadurl18 = this.prefs.getCharPref(aSite+"."+videoid+".18");
							}catch(e){
								//do nothing
							}
							try{
								downloadurl34 = this.prefs.getCharPref(aSite+"."+videoid+".34");
							}catch(e){
								//do nothing
							}
							try{
								downloadurl35 = this.prefs.getCharPref(aSite+"."+videoid+".35");
							}catch(e){
								//do nothing
							}
							try{
								downloadurl22 = this.prefs.getCharPref(aSite+"."+videoid+".22");
							}catch(e){
								//do nothing
							}
							try{
								downloadurl37 = this.prefs.getCharPref(aSite+"."+videoid+".37");
							}catch(e){
								//do nothing
							}
							try{
								downloadurl38 = this.prefs.getCharPref(aSite+"."+videoid+".38");
							}catch(e){
								//do nothing
							}
						}
						if(sourceurl.match(/vimeo\.com\/\d{1,8}/)){
							aSite = "vimeo";
							//fetch video ID from url
							videoid = sourceurl.replace(/.*\//g, "");
							downloadurl = this.prefs.getCharPref(aSite+"."+videoid);
						}
						if(sourceurl.match(/metacafe\.com\/watch\//)){
							aSite = "metacafe";
							//fetch video ID from url
							videoid = sourceurl.replace(/.*watch\//, "").replace(/\/.*/,"");
							downloadurl = this.prefs.getCharPref(aSite+"."+videoid);
						}
						if(sourceurl.match(/blip\.tv\/file\/.*/)){
							aSite = "bliptv";
							//fetch video ID from url
							videoid = sourceurl.replace(/.*file\//, "").replace(/\//, "").replace(/\?.*/, "");
							downloadurl = this.prefs.getCharPref(aSite+"."+videoid);
						}
						if(sourceurl.match(/ustream\.tv\/recorded\/\d{1,8}/)){
							aSite = "ustream";
							//fetch video ID from url
							videoid = sourceurl.replace(/.*recorded\//, "").replace(/\/.*/g, "");
							downloadurl = this.prefs.getCharPref(aSite+"."+videoid);
						}
						if(sourceurl.match(/youporn\.com\/watch\//)){
							aSite = "youporn";
							//fetch video ID from url
							videoid = sourceurl.replace(/.*watch\//g, "").replace(/\/.*/,"");
							downloadurl = this.prefs.getCharPref(aSite+"."+videoid);
						}
						if(sourceurl.match(/pornhub\.com\/view_video.php\?viewkey=/)){
							aSite = "pornhub";
							//fetch video ID from url
							videoid = sourceurl.replace(/.*viewkey=/g, "");
							downloadurl = this.prefs.getCharPref(aSite+"."+videoid);
						}
						if(sourceurl.match(/redtube\.com\/\d{1,8}/)){
							aSite = "redtube";
							//fetch video ID from url
							videoid = sourceurl.replace(/.*redtube\.com\//g, "");
							downloadurl = this.prefs.getCharPref(aSite+"."+videoid);
						}

						vidfilename = aSite+"-"+videoid;

					}catch(e){
						document.getElementById("flvideoreplacer-copy").hidden = true;
						document.getElementById("flvideoreplacer-download").hidden = true;
						document.getElementById("flvideoreplacer-prefs-separator").hidden = true;
					}finally{

						//remove old menupopup elements
						var copymenupopup = document.getElementById("flvideoreplacer-copy-select");
						var copymenupopupvbox = document.getElementById("flvideoreplacer-copy-select-vbox");
						try{
							copymenupopup.removeChild(copymenupopup.firstChild);
						}catch(e){
							//do nothing
						}
						var dlmenupopup = document.getElementById("flvideoreplacer-download-select");
						var dlmenupopupvbox = document.getElementById("flvideoreplacer-download-select-vbox");
						try{
							dlmenupopup.removeChild(dlmenupopup.firstChild);
						}catch(e){
							//do nothing
						}
						//append new vbox
						var copynewvbox = document.createElement("vbox");
						copynewvbox.setAttribute("id","flvideoreplacer-copy-select-vbox");
						copymenupopup.appendChild(copynewvbox);
						var dlnewvbox = document.createElement("vbox");
						dlnewvbox.setAttribute("id","flvideoreplacer-download-select-vbox");
						dlmenupopup.appendChild(dlnewvbox);

						var copymenuitem, dlmenuitem;

						if(downloadurl !== null){

							if(downloadurl.match(/\.mp4/)){
								newvidfilename = vidfilename+".mp4";
							}else if(downloadurl.match(/\.flv/)){
								newvidfilename = vidfilename+".flv";
							}else if(downloadurl.match(/\.mov/)){
								newvidfilename = vidfilename+".mov";
							}else if(downloadurl.match(/\.m4v/)){
								newvidfilename = vidfilename+".m4v";
							}else if(downloadurl.match(/\.wmv/)){
								newvidfilename = vidfilename+".wmv";
							}else{
								if(aSite === "youporn" || aSite === "pornhub" || aSite === "redtube"){
									newvidfilename = vidfilename+".flv";
								}else{			    
									newvidfilename = vidfilename+".mp4";
								}
							}

							//append new copy menuitem
							copymenuitem = document.createElement("menuitem");
							copymenuitem.setAttribute("label",newvidfilename);
							copymenuitem.setAttribute('site',aSite);
							copymenuitem.setAttribute('videoid',videoid);
							copymenuitem.setAttribute('oncommand',"flvideoreplacerListener.flvrcopyToClipboard(this.getAttribute('site'),this.getAttribute('videoid'),'0');");
							copynewvbox.appendChild(copymenuitem);
							//append new download menuitem
							dlmenuitem = document.createElement("menuitem");
							dlmenuitem.setAttribute("label",newvidfilename);	
							dlmenuitem.setAttribute('site',aSite);
							dlmenuitem.setAttribute('videoid',videoid);
							dlmenuitem.setAttribute('oncommand',"flvideoreplacerListener.vidDownloader(this.getAttribute('site'),this.getAttribute('label'),this.getAttribute('videoid'),'0');");
							dlnewvbox.appendChild(dlmenuitem);
						}
						if(downloadurl5 !== null){
							newvidfilename = vidfilename+"-240p.flv";
							//append new copy menuitem
							copymenuitem = document.createElement("menuitem");
							copymenuitem.setAttribute("label","240p [flv]");
							copymenuitem.setAttribute('site',aSite);
							copymenuitem.setAttribute('videoid',videoid);
							copymenuitem.setAttribute('oncommand',"flvideoreplacerListener.flvrcopyToClipboard(this.getAttribute('site'),this.getAttribute('videoid'),'5');");
							copynewvbox.appendChild(copymenuitem);
							//append new download menuitem
							dlmenuitem = document.createElement("menuitem");
							dlmenuitem.setAttribute("label","240p [flv]");
							dlmenuitem.setAttribute('site',aSite);
							dlmenuitem.setAttribute('filename',newvidfilename);
							dlmenuitem.setAttribute('videoid',videoid);
							dlmenuitem.setAttribute('oncommand',"flvideoreplacerListener.vidDownloader(this.getAttribute('site'),this.getAttribute('filename'),this.getAttribute('videoid'),'5');");
							dlnewvbox.appendChild(dlmenuitem);
						}
						if(downloadurl18 !== null){
							newvidfilename = vidfilename+"-360p.mp4";
							//append new copy menuitem
							copymenuitem = document.createElement("menuitem");
							copymenuitem.setAttribute("label","360p [mp4]");
							copymenuitem.setAttribute('site',aSite);
							copymenuitem.setAttribute('videoid',videoid);
							copymenuitem.setAttribute('oncommand',"flvideoreplacerListener.flvrcopyToClipboard(this.getAttribute('site'),this.getAttribute('videoid'),'18');");
							copynewvbox.appendChild(copymenuitem);
							//append new download menuitem
							dlmenuitem = document.createElement("menuitem");
							dlmenuitem.setAttribute("label","360p [mp4]");
							dlmenuitem.setAttribute('site',aSite);
							dlmenuitem.setAttribute('filename',newvidfilename);
							dlmenuitem.setAttribute('videoid',videoid);
							dlmenuitem.setAttribute('oncommand',"flvideoreplacerListener.vidDownloader(this.getAttribute('site'),this.getAttribute('filename'),this.getAttribute('videoid'),'18');");
							dlnewvbox.appendChild(dlmenuitem);
						}
						if(downloadurl34 !== null){
							newvidfilename = vidfilename+"-360p.flv";
							//append new copy menuitem
							copymenuitem = document.createElement("menuitem");
							copymenuitem.setAttribute("label","360p [flv]");
							copymenuitem.setAttribute('site',aSite);
							copymenuitem.setAttribute('videoid',videoid);
							copymenuitem.setAttribute('oncommand',"flvideoreplacerListener.flvrcopyToClipboard(this.getAttribute('site'),this.getAttribute('videoid'),'34');");
							copynewvbox.appendChild(copymenuitem);
							//append new download menuitem
							dlmenuitem = document.createElement("menuitem");
							dlmenuitem.setAttribute("label","360p [flv]");
							dlmenuitem.setAttribute('site',aSite);
							dlmenuitem.setAttribute('filename',newvidfilename);
							dlmenuitem.setAttribute('videoid',videoid);
							dlmenuitem.setAttribute('oncommand',"flvideoreplacerListener.vidDownloader(this.getAttribute('site'),this.getAttribute('filename'),this.getAttribute('videoid'),'34');");
							dlnewvbox.appendChild(dlmenuitem);
						}
						if(downloadurl35 !== null){
							newvidfilename = vidfilename+"-480p.flv";
							//append new copy menuitem
							copymenuitem = document.createElement("menuitem");
							copymenuitem.setAttribute("label","480p [flv]");
							copymenuitem.setAttribute('site',aSite);
							copymenuitem.setAttribute('videoid',videoid);
							copymenuitem.setAttribute('oncommand',"flvideoreplacerListener.flvrcopyToClipboard(this.getAttribute('site'),this.getAttribute('videoid'),'35');");
							copynewvbox.appendChild(copymenuitem);
							//append new download menuitem
							dlmenuitem = document.createElement("menuitem");
							dlmenuitem.setAttribute("label","480p [flv]");
							dlmenuitem.setAttribute('site',aSite);
							dlmenuitem.setAttribute('filename',newvidfilename);
							dlmenuitem.setAttribute('videoid',videoid);
							dlmenuitem.setAttribute('oncommand',"flvideoreplacerListener.vidDownloader(this.getAttribute('site'),this.getAttribute('filename'),this.getAttribute('videoid'),'35');");
							dlnewvbox.appendChild(dlmenuitem);
						}
						if(downloadurl22 !== null){
							newvidfilename = vidfilename+"-720p.mp4";
							//append new copy menuitem
							copymenuitem = document.createElement("menuitem");
							copymenuitem.setAttribute("label","720p [mp4]");
							copymenuitem.setAttribute('site',aSite);
							copymenuitem.setAttribute('videoid',videoid);
							copymenuitem.setAttribute('oncommand',"flvideoreplacerListener.flvrcopyToClipboard(this.getAttribute('site'),this.getAttribute('videoid'),'22');");
							copynewvbox.appendChild(copymenuitem);
							//append new download menuitem
							dlmenuitem = document.createElement("menuitem");
							dlmenuitem.setAttribute("label","720p [mp4]");
							dlmenuitem.setAttribute('site',aSite);
							dlmenuitem.setAttribute('filename',newvidfilename);
							dlmenuitem.setAttribute('videoid',videoid);
							dlmenuitem.setAttribute('oncommand',"flvideoreplacerListener.vidDownloader(this.getAttribute('site'),this.getAttribute('filename'),this.getAttribute('videoid'),'22');");
							dlnewvbox.appendChild(dlmenuitem);
						}
						if(downloadurl37 !== null){
							newvidfilename = vidfilename+"-1080p.mp4";
							//append new copy menuitem
							copymenuitem = document.createElement("menuitem");
							copymenuitem.setAttribute("label","1080p [mp4]");
							copymenuitem.setAttribute('site',aSite);
							copymenuitem.setAttribute('videoid',videoid);
							copymenuitem.setAttribute('oncommand',"flvideoreplacerListener.flvrcopyToClipboard(this.getAttribute('site'),this.getAttribute('videoid'),'37');");
							copynewvbox.appendChild(copymenuitem);
							//append new download menuitem
							dlmenuitem = document.createElement("menuitem");
							dlmenuitem.setAttribute("label","1080p [mp4]");
							dlmenuitem.setAttribute('site',aSite);
							dlmenuitem.setAttribute('filename',newvidfilename);
							dlmenuitem.setAttribute('videoid',videoid);
							dlmenuitem.setAttribute('oncommand',"flvideoreplacerListener.vidDownloader(this.getAttribute('site'),this.getAttribute('filename'),this.getAttribute('videoid'),'37');");
							dlnewvbox.appendChild(dlmenuitem);
						}
						if(downloadurl38 !== null){
							newvidfilename = vidfilename+"-"+original+".mp4";
							//append new copy menuitem
							copymenuitem = document.createElement("menuitem");
							copymenuitem.setAttribute("label",original);
							copymenuitem.setAttribute('site',aSite);
							copymenuitem.setAttribute('videoid',videoid);
							copymenuitem.setAttribute('oncommand',"flvideoreplacerListener.flvrcopyToClipboard(this.getAttribute('site'),this.getAttribute('videoid'),'38');");
							copynewvbox.appendChild(copymenuitem);
							//append new download menuitem
							dlmenuitem = document.createElement("menuitem");
							dlmenuitem.setAttribute("label",original);
							dlmenuitem.setAttribute('site',aSite);
							dlmenuitem.setAttribute('filename',newvidfilename);
							dlmenuitem.setAttribute('videoid',videoid);
							dlmenuitem.setAttribute('oncommand',"flvideoreplacerListener.vidDownloader(this.getAttribute('site'),this.getAttribute('filename'),this.getAttribute('videoid'),'38');");
							dlnewvbox.appendChild(dlmenuitem);
						}
						document.getElementById("flvideoreplacer-copy").hidden = false;
						document.getElementById("flvideoreplacer-download").hidden = false;
						document.getElementById("flvideoreplacer-prefs-separator").hidden = false;
					}
				}else{
					document.getElementById("flvideoreplacer-copy").hidden = true;
					document.getElementById("flvideoreplacer-download").hidden = true;
					document.getElementById("flvideoreplacer-prefs-separator").hidden = true;
				}
			}else{
				//hide menus
				document.getElementById("flvideoreplacer-embedded").hidden = true;
				document.getElementById("flvideoreplacer-embedded-detection").hidden = true;
				document.getElementById("flvideoreplacer-embedded-separator").hidden = true;
				document.getElementById("flvideoreplacer-copy").hidden = true;
				document.getElementById("flvideoreplacer-download").hidden = true;
				document.getElementById("flvideoreplacer-prefs-separator").hidden = true;
			}
		},

		vidDownloader: function (aSite,aFile,aID,aFMT) {

			var filepath,file,sourceurl;

			//access preferences interface
			this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.flvideoreplacer.downloadersource.");

			//get video path from prefs
			if(aFMT === "0"){
				sourceurl = this.prefs.getCharPref(aSite+"."+aID);
			}else{
				sourceurl = this.prefs.getCharPref(aSite+"."+aID+"."+aFMT);
			}

			//access preferences interface
			this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.flvideoreplacer.");

			//get prefs
			var dir = this.prefs.getCharPref("downdir");
			var silentdownload = this.prefs.getBoolPref("silentdownload");

			//get localization
			var strbundle = document.getElementById("flvideoreplacerstrings");

			if(dir !== null){

				file = Components.classes["@mozilla.org/file/local;1"]
				.createInstance(Components.interfaces.nsILocalFile);
				file.initWithPath(dir);
				file.append(aFile);

				//download manager
				var dm = Components.classes["@mozilla.org/download-manager;1"].createInstance(Components.interfaces.nsIDownloadManager);

				//Create URI from which we want to download file
				var ios = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
				var uri1 = ios.newURI(sourceurl, null, null);
				var uri2 = ios.newFileURI(file);

				//Download observer
				var nsIWBP = Components.interfaces.nsIWebBrowserPersist;
				var pers = Components.classes["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"].createInstance(nsIWBP);
				pers.persistFlags = nsIWBP.PERSIST_FLAGS_REPLACE_EXISTING_FILES |
				nsIWBP.PERSIST_FLAGS_BYPASS_CACHE |
				nsIWBP.PERSIST_FLAGS_AUTODETECT_APPLY_CONVERSION;

				//Start download
				var dl = dm.addDownload(dm.DOWNLOAD_TYPE_DOWNLOAD, uri1, uri2,
						"", null, Math.round(Date.now() * 1000),
						null, pers);
				pers.progressListener = dl.QueryInterface(Components.interfaces.nsIWebProgressListener);
				pers.saveURI(dl.source, null, null, null, null, dl.targetFile);

				if(silentdownload === false){
					//Show download manager
					var dm_ui = Components.classes["@mozilla.org/download-manager-ui;1"].createInstance(Components.interfaces.nsIDownloadManagerUI);
					dm_ui.show(window, dl.id, Components.interfaces.nsIDownloadManagerUI.REASON_NEW_DOWNLOAD);
				}else{
					//get osString
					var osString = Components.classes["@mozilla.org/network/protocol;1?name=http"]
					.getService(Components.interfaces.nsIHttpProtocolHandler).oscpu;

					if(!osString.match(/OSX/) && !osString.match(/Macintosh/) && !osString.match(/OS X/)){

						//get localization strings
						var message = strbundle.getFormattedString("videodownload", [ aFile ]);
						var messagetitle = strbundle.getString("flvideoreplacermessage");

						//alert user
						var alertsService = Components.classes["@mozilla.org/alerts-service;1"]
						.getService(Components.interfaces.nsIAlertsService);
						alertsService.showAlertNotification("chrome://flvideoreplacer/skin/icon48.png",
								messagetitle, message,
								false, "", null);
					}					
				}
			}
		},

		flvrcopyToClipboard: function (aSite,aID,aFMT) {

			var sourceurl;

			//access preferences interface
			this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.flvideoreplacer.downloadersource.");

			//get video path from prefs

			try{
				sourceurl = this.prefs.getCharPref(aSite+"."+aID+"."+aFMT);
			}catch(e){
				//do nothing
			}finally{
				flvideoreplacerListener.docopyToClipboard(sourceurl);
			}

			try{
				sourceurl = this.prefs.getCharPref(aSite+"."+aID);
			}catch(e){
				//do nothing
			}finally{
				flvideoreplacerListener.docopyToClipboard(sourceurl);
			}
		},

		docopyToClipboard: function (aText) {

			const gClipboardHelper = Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService(Components.interfaces.nsIClipboardHelper);
			gClipboardHelper.copyString(aText);
		},

		detectionManager: function (aAction,aDomain) {

			//check private mode
			var pbs = Components.classes["@mozilla.org/privatebrowsing;1"]  
			.getService(Components.interfaces.nsIPrivateBrowsingService);
			var inPrivateBrowsingMode = pbs.privateBrowsingEnabled;  

			if (!inPrivateBrowsingMode){
				//access preferences interface
				this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
				.getService(Components.interfaces.nsIPrefService)
				.getBranch("extensions.flvideoreplacer.detect.");
			}else{
				//access preferences interface
				this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
				.getService(Components.interfaces.nsIPrefService)
				.getBranch("extensions.flvideoreplacer.detectprivate.");
			}

			if(aAction === "add"){
				this.prefs.setBoolPref(aDomain,true);
				//content.window.location.reload();
			}
			if(aAction === "remove"){
				this.prefs.setBoolPref(aDomain,false);
				this.prefs.deleteBranch(aDomain);
			}
		},

		openLink: function (aLink) {//show and hide context menus
			gBrowser.addTab(aLink);
		},

		sanitizeString: function (aString) {
			return aString.replace(/[&"<>]/g, function (m) {
				return "&" + ({ "&": "amp", '"':  "quot", "<": "lt", ">": "gt" })[m] + ";";
			});
		},

		cleanupPrefs: function () {

			this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.flvideoreplacer.");

			this.prefs.deleteBranch("video");
			this.prefs.deleteBranch("downloadersource");
			this.prefs.deleteBranch("detectprivate");
			this.prefs.setCharlPref("videourl","");
		}
};
window.addEventListener("load", function() { flvideoreplacerListener.init(); }, false);
window.addEventListener("unload", function() { flvideoreplacerListener.cleanupPrefs(); }, false);
document.addEventListener("FLVReplaceEvent", function(e) { flvideoreplacerListener.placeHolderReplace(e); }, false, true);