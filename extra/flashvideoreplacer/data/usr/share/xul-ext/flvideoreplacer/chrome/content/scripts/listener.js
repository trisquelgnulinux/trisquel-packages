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
			var videowidth, videoheight, fmt, videourl, downloader, background, thumbnail;

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

					pagecontent = doc.getElementById("postpage").innerHTML;
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
								videojson.background = "http://img.youtube.com/vi/"+videoid+"/hqdefault.jpg";
								videojson.thumbnail = "http://img.youtube.com/vi/"+videoid+"/default.jpg";
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
					/*
					xmlsource = "http://www.youtube-nocookie.com/watch?v="+videoid;

					//get xml document content
					req = new XMLHttpRequest();   
					req.open('GET', xmlsource, true);
					req.onreadystatechange = function () {
						if (this.readyState == 4) {
							if(this.status == 404){
								pagecontent = doc.getElementById("postpage").innerHTML;
							}
							if(this.status == 200){
								pagecontent = req.responseText;
							}
							newline = pagecontent.split("\n");
							for(var i=0; i< newline.length; i++){
								//detection rules here
							}
						}
					};
					req.send(null);
					 */
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
							pagecontent = this.responseXML;

							var request_signature, request_signature_expires;

							try{
								request_signature = pagecontent.getElementsByTagName('request_signature');
								request_signature = request_signature[0].firstChild.nodeValue;
								signature = true;
							}catch(e){
								signature = false;
							}
							try{
								request_signature_expires = pagecontent.getElementsByTagName('request_signature_expires');
								request_signature_expires = request_signature_expires[0].firstChild.nodeValue;
								signature_expires = true;
							}catch(e){
								signature_expires = false;
							}
							try{
								background = pagecontent.getElementsByTagName('thumbnail');
								background = background[0].firstChild.nodeValue;
							}catch(e){
								background = null;
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
								videojson.background = background;
								videojson.thumbnail = background.replace(/_640.jpg/,"_100.jpg");
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
							background = newline[i].replace(/.*ustream\.vars\.videoPictureUrl=\"/, "").replace(/".*/g, "").replace(/\\/g, "");
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
							videojson.background = background;
							videojson.thumbnail = background.replace(/_320x240_/,"_90x68_");
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
								for (pd=1; pd<=15; pd++){
									var testurl = newline[i].replace(/.*videopic/,"http://ustream.vo.llnwd.net/pd"+pd).replace(/_\d{1,3}x.*/,".flv").replace(/\\/g, "");
									//get xml document content
									req = new XMLHttpRequest();   
									req.open('GET', testurl, true);
									req.onreadystatechange = function () {
										if (this.readyState == 4 && this.status == 200) {

											//declare video url
											videourl = newline[i].replace(/.*videopic/,"http://ustream.vo.llnwd.net/pd"+pd).replace(/_\d{1,3}x.*/,".flv").replace(/\\/g, "");
											background = newline[i].replace(/.*ustream\.vars\.videoPictureUrl=\"/, "").replace(/".*/g, "").replace(/\\/g, "");

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
											videojson.background = background;
											videojson.thumbnail = background.replace(/_320x240_/,"_90x68_");
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
			if(sourceurl.match(/youtube.*watch.*v\=/) || sourceurl.match(/vimeo\.com\/\d{1,8}/) || sourceurl.match(/ustream\.tv\/recorded\/\d{1,8}/)){
				var background = flvideoreplacerListener.sanitizeString(jsonObjectLocal.background);
				var thumbnail =  flvideoreplacerListener.sanitizeString(jsonObjectLocal.thumbnail);
			}
			var placeholderimg = "data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%89%00%00%00%89%08%06%00%00%00%18%24%1B%C9%00%00%00%01sRGB%00%AE%CE%1C%E9%00%00%00%06bKGD%00%FF%00%FF%00%FF%A0%BD%A7%93%00%00%00%09pHYs%00%00%0B%13%00%00%0B%13%01%00%9A%9C%18%00%00%00%07tIME%07%DB%03%1E%10%22%09%81%03A%C4%00%00%20%00IDATx%DA%ED%5Dw%7CTU%F6%FF%9E%FB%DE%9B%9AL%26%BD%91%10z%13BG%14E%85Ed%C5%02*%16%04l%E8%AA%AB%FE%D6%B5%EB%DA%5DuE%C5%8E%ABbcW%B1%AE%A2%88%8A(%82%A0%22%22%BDCzHO%26S%DE%BCr%7F%7F%CCL%1CB%E6%BD%09%04%C4%DD%1C%3F%F3%11B%E6%BE%FB%EE%FB%BEs%CF%F9%9Er%81N%E9%94N%E9%94N%E9%94N%E9%94N%E9%94N%E9%94N%E9%94N%E9%94N%E9%94N%89K%E8%BF%FD%06%17%F4%E8%C1V64%B8%93D%F1%D8%04%C6FX%19%EB%2B%02%B9%12Q%A6D%94%22%11%252%22k%5B%DF%E5%9Cs%8D%A8Y%D5%F5%06%85%F3j%85%F3R%8D%F3%22%05%F8Y%00%96%E7%D8l%C5%D3w%EFV%3AA%F2%3B%93%D7%BAv%B5%AD%F7%FB%07%A7%08%C2%D4%04A%18m%03%FA%D8%04!%0D%00%88%08%9Cs%00%E0DDm%80%02%AD%7F%1C%FD3%1E%FAr%CB%2F%E8%9Ck~%5D%DF!s%FE%8B%AC%EB%1FeI%D2g%B3%8A%8B%EB%3AAr%14%CA%83%D9%D9%992%E7%E7%A4%08%C24%07c%83%AC%8C%25E%9E1%11%11%E7%BCMP%1C%ACD%8F%D7%1A8~%5D%DF%EE%D7%F5%2Fm%8C%CD%B3%13m%98U%5C%CC%3BA%F2%1B%C9%EB%05%05%D6%ED%81%C0%CC%0CQ%BC%3C%91%B1BFd%89h%8B%C8%B3%FC%0D%EE%8F%87%81C%00%10%E4%BC%ACY%D3%3EJ%95%A4%B93%F6%EE%DD%D6%09%92%23%24%B7df%16%A6%0A%C2%AD)%A28I%22rE%BD%D0DD%FC(%BB'%0E%808%E7%F0%E9%FAFY%D7%1F%BD%A1%AC%EC%8DN%90%1C%26%B99%23%E3%0F%B9%92t%7F%92%20%8Cd%8C%B5l!%1D%BD%95t8JB6%0D%8Fh%17%85%F3%3A%8F%AA%3E%99j%B1%3C%3Cc%EF%5E%A5%13%24%1D%20%7F%C9%C88%A5%9B%C5%F2%A4K%10%06F%BF%9DG1.b%C2%05%20%0A%FD%81%88%13%7C%CD%A28%E7%DA%1D%3B%FE%D6%09%92%83%94%99%C9%C9%05C%1D%8E7%DD%A2x%7C%D8%D6%E8%D0%AD%A4%B5'%D3%CA%8Bi%EB%CF%91%AD%A3%FD%9A%8B%87mW%22p%26p0%81%20%08%5C%B7XHs%3A%9B%5DC%07%DF%7C%DEs%CF%3D%DF%09%92v%C8C%D9%D9%CF%E7Z%2CW%B52D%0FF%C5%87%87%F8U%DDGD%D6%F5z%9F%AE%D7%FA9o%F0k%9AW%25%0A(%BA%AEp%CE%B9%C0%98%20%11Y%ACD%0E%1B%91%CB%CEX%B2%93%B1%F4%88ql%00%DA%A8%9Fq%80S%E8oL%00%24%09%BA%20%82%92%5CH%CC%ED%82%E4%9E%DDyJ%D7%AE%E4%CA%C9%E1%A2%D3I%8A%20%14%F1%DA%DAI%3D%CE9gs'H%0C%E4%CF%E9%E9%13%07%DAl%0B%AC%8C%A5%1C%84%FB%DA%F2%A6G%8CE%C6%184%5DWjTuK%B9%A2%EC%DC)%CB%BB%D7%FA%FD%25e%8A%D2%7C%B0s%1C%E9p%E4%1Cc%B3%15%E4Y%2C%DD3D%B1o%82%20d%1F0%0F%22%22%10%20J%E0%A2%04%24%3A%91%DA%A7%0F2%8E9%06)%3D%0A%60KK%87%C5%95%04%D1%E9%84%E0p%40%B4ZA%A2%C8%99(R%F1%86%0D%FF%EC%3Df%CC%ECN%90%B4!%0F%E7%E4%BC%9E-I%17%B7w%5Bim%18%02%40%BD%AA%EE%D8.%CBkV47%FF%B2%3E%10%A8%3E%DCs%9F%E2v%0F%1Ch%B3%15%E6Y%AD%A3%24%268%60%B1%82%DB%AC%DC%96%D3%85rF%0C%E3%B9%03%07%92-%3D%0D%16%B7%1BRR%12D%BB%1D%A2%D5%0A%26I%20%C6%00A%08i%26%22%10c%E4%D9%B7%AF%AA%EC%B3%CF%C6%0D%B8%F4%D2%8D%9D%20%01pij%EA1%23%1C%8EE%0E%C6%BAFx%063%CD%11%ED%D9D%EE%A1A%D3%F6%AC%F3%F9%96-lh%F8%DE%AB%EB%EAou%3F'ed%16%8C%EB%DD%7B%F4%C4%F3%CE%3B%3E%B3o%1F%BB59%05%B6%D4%14.8%1C%24%DA%ED%60%A2%08%12%C5%108%88%C0%22%B7%BA%FF-s%5DQh%CB%B2ew%0C%9C8%F1%A1%FFi%90%DC%94%91qy%7F%9B%ED%05F%C4%DA%B3%A5Dp%A2r%EE%DF)%CB%CB%3FijZ%B6%DE%EF%AF%C6Q%26%F7%FE%DF%FF%0D%3Do%CA%94I%3D%86%0C%E9%C6%2C%16%80%88%13%3B%F0V%5B%1B%C9%11c%0ADT%B2v%ED%F2k%87%0D%3B%E5c%40%FB%9F%03%C9%C399%AFdK%D2%25%88%11G1%B27%82%9C7%FE%E4%F5~%3C%BF%AEn%B9%CC%B9%86%A3%5C%CE%3C%EE%B8%FC%BB%EE%B9%E7%AC%C1'%9DT%C8D%11%D1%F7%DCV%BC%A8E%9BpN%D0u4%94%95UW%2CY2%FA%98%D9%B3w%FDO%80%E4%A5%9C%1Cj%26Z%9E%2C%8Ac%C2%8B%15%CF%3C8%E7%9C%14%CE%7D%3F%F9%7C%1F%FC%B3%A6%E6k%15%D0%7FgD%09%26%0E%1D%9A%F3%F7%7F%FC%E3%DC%C2%93O%1E%14%8Fa%AEs%0Eh%1A%14%AF%977%EC%DA%A5U%7C%FF%C3%F8!W%FF%E9%9B%23%3Dov%24%2Fv%B6%DB%9D%203%B69Y%14%C7%10Q%C4%F60%B5%3F8%E7%D8%1E%08%7C%F1%97%D2%D2%1B%9F%AF%A9%F9%EA%F7%08%10%00%F8l%ED%DA%F2!%E3%C6%CD%BDx%FC%F8%87*w%EE%AC%8A%BEG%D3%B7%99s%A1n%CF%9E%AF_%18Px%E1%91%9E%B7p%A4.45))%F5%0F.%D7%06%A7%20%F4%88%C3%83i%09%945h%DA%9E%17jj%1E%5B%D8%D0%F0%FD%EFak%89G6%EC%D9S%3F%E7%E9%A7%97%16%24%24%C8%C7%0C%19%D2%9FI%12%B5%99%BA%10%26%E2tE!%B9%BE%9E%AA6l%E4%FE%AD%9B%A7%9E%E6tT%2Fjl%FC%F1%BFj%BB%99%9A%94%94%3A%C1%E5Zo%17%84%9C%B0z5%BB6%E7%9C%D3%0F%5E%EF%5B%CF%D6%D4%7C%D1%91s%19j%B7g%F6%B5%D9%BA%A4%0ABZ%9A(f'%08B%AA%8D%C8-%11%D9%19%91%04%80t%CE5%1D%90e%CE%9B%7D%BA%5E%D7%A4%EBU%D5%C4%AAJ%24%A9%F2%E7%FA%BA%A2*%8FG%EE%A8%F9%0C%EB%DA5%E5%FD%C5%8B%AF%CD%EF%D7%AFk%B4%E7%D6j%BBA%E3%AE%5D%D8%F8%EF%7F%A3%F4%E3%8F9%022%05t%ED%FA%2BKJ%9E%FA%AF%00%C9%D9nw%C2%84%C4%C4%CDNA%C8%8B%07%20%9Cs%C8%BA%DE%F0%7CM%CD%A3%3F%FB%FD%FB%0E%F5%FA%A3%9D%CE.%23%ED%F6A%05V%EB%C0dA%E8ID%2C%DA%AB%88%F2(%A2%BD%8D%16%DE%85%88%00%AB%1D%3C5%19%83%CE%BF%00Y%C3%86Bw%B9%1Aw%16%15%AD%FF%FA%F3%CF7%DE%F3%D4Sky%07l%7F%EF%CD%9B7%F5%EC%2B%AE%98%14M%03%B4%0D%92E%40%C0%CF%01P%40%D3.%BB%B2%B4%F4%95%DF5H%5E%CA%C9!%99%B1%CD%09%82%D0%D7%C8H%8D%80%87sN%95%8A%F2%CB-%E5%E5%87%F4%86%0C%B3%DB%B3Nu%B9%C6%F6%B0Z%C7%08%80%23%A2%C9%DBE%D4E%E2q%16%1B(%3D%1D%83%2F%99%89%8CA%83%E0%CC%CB%E3%16%97%8B%98%C5%02%26%08%D0%82A%ECZ%BF~%C7G%1F~%F8%F5%CD%0F%3D%B4%FAP%E6%7D%F9Yg%F5~%F6%CD7o%92%1C%0Ej%1B%24o%A1%F4%E3%8FA%81%00x(%20DD4y%C6%DE%BD%8B~%B7%20y27%F7%DB%B0%91%CA%8D%AE%17qm%B7%04%02%8B%1F%DE%B7%EF%DD%83%BD%DE%C5%C9%C9%23G%3B%9Dg%24%88bv%94f%88%A8%EFv0%B9%E1_%B5X!dfa%F0%8C%19H%1DZ%88%C4.y%B0%24%26%82I%12%C0X%0B%F0%22%DB%83%EA%F7c%D5%F2%E5_%FFi%D6%AC%8F7UV6%1C%CC%3D%8C%E8%D93%E5%8B%95%2B%EFN%CA%C8H%D0u%9DC%D7%A1x%BD%14%ADI(%10%88%DC%09%D7u%1D%00%86%CF*.%5E%FB%BB%03I%84%071%A3%40%22%00%F9%C6%E3y%F9%95%BA%BA%EF%0E%E6Z%D7%A6%A7%8F%1Fj%B7O%11B%09%CD%87%9E_%C2%01X%AD%40Z%1A%86%CC%9A%85%F4!%83%91%98%9F%0F%8B%CB%15%02H%C83kM%84E%B2%9E8%01%B4%E9%87%1F6%5E5c%C6%82%15%DB%B6U%B5%F7%F2%09%8CI%1B%D7%AD%BB%23%7F%E0%C0%3C%AE%AA%3C%ACI%A85H%22%1AX%D3u%99%80%ECY%C5%C5%0D%87%E3Y%1E%16%17%F8%A6%8C%8C%CB%23DY%1C%EE-%7D%D2%D4%F4%F4%C1%00dfJ%CA%B1%2F%E7%E7%3F%3D%C2%E1%B8%40%F85%7D%F1%10%81%CFC%81%B9D%17%8E9%FF%7C%A4%0F.DB~%3E%A4%C4%C4%16%3A%3D%EC%BE%EFG%82%D1%AFh%01%00%F4%1F1b%C0%B7%5B%B7%FE%7D%CD%D2%A5%D7%E48%1C%8E%F6%CC%A0Y%D7%95n%83%06%DD%BBm%F5%EA%9DQ%179%60-%23%14%02%23%B2*%9C%AF%F8%DD%F0%24%97%A6%A6%1E%D3%DFf%7B!%CA%061%04%C8G%8D%8Ds%17%D6%D7%AFk%CF5%86%DB%ED%D9%CFt%E9r%F7%C9%09%09WH%8C%D9%23%0Bv%E8%F8%E0%00%13%A19%1D%E8s%E6%99%C8%1A6%0C%09yy%B0%26%26B%08%07%E3%0C%18R%B4%06)%E7%9C%0F%3D%F9%E4!%C5%B5%B5O%BF%F1%C4%13%93%DA%09U%DEo%F4%E8%87%B7%7D%FF%FDv%0Ae%E2%81G%80B%07%5E%D3%C2%D8%80%17%BAty%EDw%01%92%11%0E%C7%A2%A8X%0C%C5%00%07%07%40%9Fz%3CO%BF%DF%D8%B8%BE%3D%E3%DF%98%91q%C6%9F32%1EH%14%84%3C%16%C7C3%D8%E2Z%BC%A9_%01%C2%C0m6d%9Fp%02%BA%8C9%0E%09%F9y%B0%26%25%81%24%89S(R%0B%C6%E2%5B2%8A%12f%B5%F2%E97%DC0%B5l%DB%B6%07%26%0C%19%92%D3%9E%A9%F6%3F%FE%F8G%F7n%D9%B2%07%BAF!%8F%2B%A6r%E6vA%98%F1Z%D7%AE%A7%1D%D5%20y8'%E7u%07c%5D%8D%5E%E9%88%87%F3%8D%C7%F3r%7B4H%8E%249%9F%C9%CB%BB%7B%90%DD~f%B4%B1%D8%8E%C0%20~%C5g(%DFD%D3u%5D%D6%F5%26%AF%A6%ED%F3%E8zI%3D%13%F6%C8%DD%BB%EDN%1E6%B4%A8%19T%DE%D4%D8X%E7kl%F4G%B4%D4~%C1%B7%83%90%EC%5E%BD%B2%3E%5D%B5%EA%FE%A7%EE%BC%F3%E4%F6%00%E5%98Q%A3%1E%AA%DBWU%C5%83%0A7%DE%C0%C19%E7%1F%BD%D6%B5k%C2Qi%B8%FE9%3D%7D%E2p%87c%B1%99%E1%C89G%7B%BD%983%5D%AE%01g%B9%DD%D71%22%A1%1D%9EJ%84%EBh%F9%5D%BF%AE%D7%D6kZQI0%B8es%20%B0%BBRQ%9A%AAT%D5%5B%A7im%92c%16%22%96%97%96%E6%C8%CF%C8H%18ZX%98y%D2%F8%F1%7D%FB%0E%1E%DC3%BFW%AF%AE%96%84%04%E1%60R%19%23%DFY%B3d%C9%BAc'N%7CV%8B%93c%E9%9E%97%EF%98%7B%CA)s%EAV%AC%90%A0%AA%08e5%B5%3D~P%D7%7F%B8%A2%A4%E4%D8%A3%0E%24%2F%E6%E5%D5%DA%04!9%AC%FEc%DD%00%DA%CB%83%5C%95%96v%F2h%A7sz%BC%5EK%ABp%3B%F94%AD%AAHQ%D6%7C%E9%F1%7C%B7%D1%EF%AF%0At%00%B5%DF%D5%EDv%5Ep%C6%19%7D.%98%3D%FB%84%01%C3%87%0F%12%ACV%18e%EF%EF%A7%7C8%E7%3A%E7%20%80%CA%B6n-%1F6j%D4%03%D5%5Eo%5C%0C%EE%B1ii%B9W%25%24%DE%C7%C0%B9%19!ID%17%CD%D8%BB%F7_G%0DH%229%A9F%0A%04%00%02%9A%D68%BB%A4%E4%C6x%C7%BD9%23%E3%EC%01v%FB%E9f%3CKk%5B%83sN%D5%AA%BAq%89%C7%F3%9F%2F%3D%9E%DD%87%93%0B%CAv8%ECO%CC%993%EE%B4)SNued8%8C%40%C29%07%D7upM%83%26%CBP%BC%5E%D4%15%177M%9A9%F3%AEM%DB%B6%C5%95R93%25e%F4)%89%89%97%1B%2Bk%0E%CE%B9%AA%EB%BA%E3%D2%D2%D2CN%C0%3A%E4%00%DF%CC%E4%E4%82B%87%E3%CD8%B6%19z%A6%BA%FA%BEJU%F5%C63%EE%9DYY%E7%F7%B5%D9NC%1C%E9%04%91%14F%00T%A9(%EB%9F%A9%A9%99%F3%EF%FA%FAe%BB%83%C1%FA%C3MY7%2B%8A%FA%EE'%9Fl%7F%F8%B1%C7%16g%D9%ED%8D%FD%07%0C%E8g%B1%DB%C5%C8%D4t%5D'%22%0A%81C%D7%A1%07%83%0866%C2WY%89%E6%DD%7BP%BFy%93u%88%CEOZ%B5c%FB%8AFU5%D5(%BF%F8%FD%A5%23%1D%8E%ECDA%C8%8D%B1%DC%146%D5%04%8D%A8%E7G%8D%8D%EF%FF%E6%9Adnn%EE%0A%B7(%1Eo%E2%EE%A2%3D%C1%BA%88%06%89%03x%11%15%0F%9F%A6%D5%BCY_%FF%F4J%AF%B7%14%BF%B1%7C8%7F%FE%D4%C9%D3%A7O%22A%E0%00H%D74pM%83%EA%F3A%AE%AB%83%B7%BC%1C%B5%1B7b%E7%B2%AFy%E3%B6%AD%60A%85TY%F6%DDQR%7CK%A5%AA%FA%CC%C6%97%88%D8%0ByysE%22%7B%2C%E3%3D*%B5%B3%D7%CC%A2%A2%9D%BF%19H%FE%92%91qJ%A1%DD%BE4b%03%C4%9Al%83%A6%ED%B9%BE%B4%F4%C1%0E%B4A%F6%CBT%5B%EF%F7%FFgNU%D5G8%8AdP%D7%AE%EE%2F%BE%FE%FA%B6%B4%FC%FC4%3D(%F3%60%93%87%7C%95%95%F0%EC%D9%83-%8B%17%A3j%CD%1A%08%5E%2F%10%90%C3%B7%C1%C9%AF%EB%B5%7F-%2B%BB%A3Y%D7M%2B%FB%26%26%26%F6%BE%20%25%E5%16%A3u%E2%9CC%E1%7C%C5%E5%C5%C5'%FCf.p7%8B%E5%C9%B6H%A4%A8%07%C9%01%E0%D5%DA%DA%97%E2%F5bF%3B%9D%D3%C3.%AE%11%09%07%CE9T%CE%83s%AB%AAn%3F%DA%00%02%00%EB%8B%8A%1A2%BBu%BB%E5%CB%B7%DEZ%26%D77%90g%CF%5E%BE%EF%C7%1F%F1%DD%B3%CF%A2f%C5J%08%F5%0D%80%3F%00p%BD%25%FF%CA%CEX%EA%03%D9%D97%C53%FEg%1E%CF%F6%92%60%F0%FB%88%3B%1F%EBe%B206%E6%B5%AE%5D%87%FF%266%C9%CD%19%19%7F%C8%B3X%FEj%10Y%25%CE9m%0F%04%BE%5C%D8%D0%F0%7D%3C%3C%C85%E9%E9%7F%8BbN%DB%1A%B3%C5%3E%A9W%D5%5D7%97%97%DFU%A4(M8%8A%E5%CD%F7%DF_o%F3%FB%F7%A544%0C_%FF%C6%9B%9C%AAk%88%FC%3E%40%E7%11%EBa%3F%0E%C9%C6X%CA%00%9B%CD%F1%AD%D7kZN%B1C%96%B7%9D%94%900%9EB%E4%E5%01k%16%D9%8AU%E0%98%8F%1A%1B%0F%3A%A5%E0%A0%B7%9B%B9%B9%B9%AB%DD%A28*%B6%A6%E3P8%F7%FF%A5%B4%F4%C6%26%5D%0F%9A%8D%F7L%5E%DE%DD%89%8C%E5%19m1%11%22%AC%2C%18%5Cs%7BE%C5!%95E%DA%19%13%FB%16%14%24%8E%3F%FE%B8%AE%03%07%0F%C9%CE%ED%D5%2B%C5%E6tJ%04%10%07%F4%EA%92%92%E6%5D%9B6U%AF%FA%EE%BB%E2o%D6%AC%A9%AC%96%E5%C0%A1%5C%EF%C4%94%D4n%97%A4%A4%DC%CA%14E%88%C5qD%91~%B4%A8%B1%F1%A9w%1A%1A~1%1B%F7%FA%B4%B4%D3%86%3A%9D%E7%18i%DE%F0s%1E4%B3%A8h%C3%C1%CC%5D%3C%98%2F%DD%92%99Y%98%24%08%23%0DH-%02%80%9F%7C%BE%0F%E2%01%C8%8D%19%19g%242%96ot%A3%917%A5%24%18%5CugE%C5K%073%EF%2CQt%9C%EAr%17%F6OM%1DQx%C6%E9%DD%07%9D%7DVbR%EF%3E!%EA%5D%14%5Bj~%5B%03U%0B%06Q%BAm%5B%F1%E6%0D%1B%B6%3E%F5%D8c%2B%3E%FB%F9%E7%B2%F6%5E%7By%5D%ED%1EU%96%EF%BF%225%E5N%06%12c%BC%0C%14%BE%3E%9F%E8r%5D%B1%D4%E3%B91%16%D1%17%91%17jk%3F%7F%DAn%9F%60e%2C%B1%ADm%3F%A2M%14%CE%EF%06p%CE%11%DBn%CELJz2Q%14%07%B6e%8AD%1Eh%90%F3%A6%FB**%5E%D4M%22%C1%C3%ED%F6%EC3%DC%EE%AB%0D%B8%90%96%9F%97%05%83k%EE%A8%A8x%B1%BD%F3%1D%E5p%E4%5C%9D%96v%E1%D9n%F7%25%DD%13%12%86'u%C9%C9%2C%3C%EF%1CKR%CF%5EdMN%E6L%92%88%FD%9A%1Fr%C0%C3c%82%80%A4%8C%0CW%AFA%83zN%BF%F2%CA%93%2F%3B%EF%BC%11%5D%9CN%ED%DB%D5%AB%CBT%CE%E3%CEJ%2BQ%82M%B5%AA%BA~%88%DD~%22!fH!%14%D9%05%A4B%BB%3D%E7K%8F%E7%07%A315%80%E7HR%20%CFb%19l%A4%85%19%D0%F3%AC%A4%A4y%1F66%FA%0E%3BH%5E%2F(%B0Z%88%5Ed%80%A5%ADI%85%91K%3Fx%BD%EF%FE%E0%F7%EF1%1B%EF%F6%AC%AC%1B%AD%8C%B9%0C2%E7)b%83%DCT%5E%FED%7B%E6%DA%D7jM%B9)3%F3%8A%93%13%13%2Fp%09B.c%02q%BB%93%BA%9F6%11%99%23G%903%2B%0B%92%DDN%14%06%88Q%F0.%FA%5E%5Dii%09%C7M%980%F8O%97%5D66K%92%FCKV%AE%2C%8AwN%C5%8A%D2%A8r%BEs%80%DD~%7C%A4%081%C6%C3%E5%89%82%90%ADp%BEc%87%2C%D7%98p'%25%A7%B9%5C'%89%8CYb%BChDD%02c%AC%EC%838%EC%C3C%F6n%B6%07%023%C3%1D%86b%1A%23*%E7%FE%F9uu%CB%E3%60%0F%8FM%08m3d%E0%C9p%95s%F9%CE%8A%8A%7F%B4g%9E%FF%97%9E~%FAmYY%8FfIR!B%89%40%80(%915%3B%1B%B9%C3%87%93%23-%1D%A2%C3%11%CA0%FB5x%D7%AE%B5H%CE%CDM%BC%E1%91Gf%16m%D8p%FF%B1%BD%7B%A7%C5%FB%BDO%9A%9A%B6%FC%E2%F7%BF%1Ff%0D(%06(%01%80%9F%E5v_f6%9E%0A%E8%1B%02%81%25%9Csj%DD%3D!%3C%16'%22%AE%E8%FAuG%C4%05%CE%10%C5%CBcEC%23%86%E5NY%8E%AB%B2%EE%C4%84%84%8B%18c%3CVd5%A2%5D%9E%AD%AE%BE7%1E%EE%00%00R%05%C1%F6L%97.%F7%0Dv8%CE%8E%2C6%85b%FC%D0-%12%F2%C7%1C%0FgN6%24%97%0B%24%081%93%88%0C%AD%FD%FD%1B%9B%A0K%BF~%D9%DF%FC%F4%D3%23%CF%DEsO%DC%D1%DD%C7%AB%AA%3E%D9%A7(%EB%5Bm%A9%AD%2FC%16%A2%E4%AB%D2%D2L%C7%FDw%7D%FD7zh%EB%E3%B1%B4%B1H%D4%FD%D5%FC%FC%81%87%15%24%0Ffgg%262V%18%8B%C0%89%D8%15%9F45-3%1B%EB%DA%F4%F4%F1%22%91%23%D6%DB%14%E1B%D6%FB%FD%FFY%1Bg%D6%FC%40%9B-%ED%D1%DC%DC9%89%82%90%13e%E3%84rED%0B%EC%D99%C8%196%04%B6%B4%B4P%BB%07A%88~k%0F%CA%3B%E4%9CCWU%D2%02%01%3Eu%D2%A4%E9%2F_%7D%F5%C5%F1~%F9%EE%8A%8Ag5c%F0s%22%E2%23%1D%8Es%CD%C6%AAVU%7F%B9%A2%FC%18%8B7%89%FCL%07.9%AC%20%919%3F%87%11Y%DARi%11%9B%B5A%D3%F6%C4S%BC%3D%D4n%9F%02%83%EC5%22%E2%3EM%AB%89%97(%3B%C1%E9%CC%FFkf%E6%23%22%915%A2%81%E8%D7DT%E8%A2%88%DC%E3%8E%83%23'%07%92%CB%05%26%8A%60a-%D2%DEm%26%02%E0%D0%AA%EB%D0%E5%20%7C5%D5%A8%DB%B6%95%D3OkO%FAG%D7%82%EB%E3%19%C7%CF%B9%BA%A8%A9%E9%B9%18%EB%D9%A2%01%04%22%EBU%A9%A9%A6%DAdys%F3%D7%B1%40%1F%D6%94%9C%03g%BC%D1%AD%1B%1D6%90%A4%08%C2%B4h%8D%D1%96%DB%BB%CE%E73%D5%22%17''%8F%0C'-%1B%D9%22%F4f%7D%FD%D3%F1j%90%CB%D3%D2%EE%8ENF%DA_%8BH%B0dd%20%7BH!l))%5C%08i%91%88%D1%D8%02%14%5D%D7%A1%87%03q%B1H%9A%D6%11%5DMQ%10ln%82%BF%AC%8C%B6%2C%FA%04bS%13%CF%20%0C%FA%7BN%CE%9F%E2%99%FB%7B%0D%0D%EB%EBUu%87Q2%13%11%F1%E1N%E7Yfc-%F1x%B6%2B%9C%7B%A3%B2%FF%0E%18J%24%EA%A1iZ%C1a%01%C9k%5D%BB%DA%1C%8C%0D2%AA%9D%01%80x%D8%D5%D1N%E7%19%B1%B4H%E4%DE*%15%E5%97x%82u%A9%82%60%BB!%23%E3%DE%D8%9C%0D%81%0B%02%B2%86%0E%E1%8E%9C%1CH%89%89%60%16%0BtE%A1M%2BWnz%E5%E9%A7%17%9C%7D%DCq%F7%260v%95%20%08%97%09%82p%19%13%84%CB%06fg%DFx%EBe%97%3D%B5t%D1%A2%2F%EAJK%9B%C1y%E4%CD%F85%F5Q%D7%A1%F9%FD%F0%ED%ABF%D9%CF%EB%E0%D9%B2%95%20%CB%00%E7%3CG%92%86%DF%94%91qv%3Ck%FBbM%CD%3F%23%1CI%8C%97%86%24%A2%843%93%92%FA%9B%8D%B5%5B%96W%EC%A7E%DBb%23%89%CE%3C%2C%20Y%EF%F7%0F%8E%EA%B4%DC%A6%C1Z%AF%AA%3B%CC%1A%C8%0C%B3%DB%B3%12D1%DB%C8%AA%E7%9C%D3%FC%BA%BA7%E3%99%D7%BD%D9%D9%B7Gm18%40%8B%08%02%E0v%23kH!%EC%A9%A9P%82r%60%C1%B3%CF.t%D8%ED%B3%07%9Dx%E2%E3%97%5Dw%DDW%1F%AEZU%EC%03%F6%B3%0D6VV6%3C%F2%CA%2B%BF%8C%9F%3C%F9%AD%D4%BC%BC%EBgL%9A%F4%E0%C6o%BF%DD%8C%90%07%C1%C35%BA%5Cnj%82%BF%AC%0C%BB%BFX%0A%E6%0F%00%BA%1AIu%E4%C7%D8%ED%A7%9F%E3v%0F2%BB%87%CD%B2%5C%5B%A1%AAk%C3%DB%18%8F%E5%E9%9C%90%900%D1l%AC%D5%5E%EF%9AX%C6p8%E4%C1%15%CEO%3F%2C%20I%11%84%A9%06%17%0FU%FE%CB%F2%1A%B3qNu%B9%C6%1A%05%A48%E7%BCZU7n%0D%04L%7B%B4%FF_z%FA%E9%06y%15%A1n%87%A2%04w%EF%5E%DC%DD%BD%3B-%5B%B6%EC3wN%EEu3o%B8a%89%D2%CE%A60o.Y%B2%7B%D0%89'%CE%B9%60%C2%84%FBk%8A%8A%EA%C19T%BF%1F%81%AA*%BE%7B%C5%B7P%CA%CA%00%25%B8%9F-%01%80%9F%9A%98x%85%5B%10%ACf%E3%2F%AC%AB%7B7%96%06%88%3C%E0tQ%1C%60%89*SmK%BEjn%DE%ADs%AE%C6%B2s8%E7%24%10%0D%9F%9F%97g%EDp%90%24%08%C2%E8X*%3D%D2%C4nEs%B3i%AC%A1%87%D5%3A%C6%00!%04%80%96x%3C%FF%89%87(%1B%ECp%9C%85X%9D%1B8%07'%06%DDf%E3%99C%86%04nz%F8%91%07%CE%9E%3D%FB%9D%E8%BA%DD'%9F%7Cr%F8%AE%5D%BBn%F0%F9%7CO%06%02%81%A75M%7BIU%D5%7F%FA%FD%FE%A7%3C%1E%CFc%1B6l%B8%F2%CA%2B%AF%EC%16%3D%EC%DBK%97%EE%CD%EC%DE%FD%A6e%EF%BD%F7%AD%E2%F1PsI%09JV%AF%E6%24%FB%D1FV!Y%18s%DC%98%91a%EA%F1%AC%F5%FB%F7%D5%AB%EAN%03%DB%84%03%C0E%C9%C9%A6%B9%ABU%9A%B6%C1%C0%BE%01%03%92%18c9%1D%0A%92%05%3Dz0%1B%D0%C7%80%F6%25M%D7%15%B3%26v%A3%9D%CE.%02%E0%40l%AA%9E%FB4%AD*%9E%94%C3KRS%A7%23%AAr%A1M%3BZ%10%B8%94%9F%E7%B9%FA%E5%97%EFX%B0hQ%0B%FB%BBb%C5%8A%F3eY~%EE%CF%7F%FE%F3U%05%05%05%C7X%AD%D6%04I%92Z%12x%2C%16%8B%C3%E1p%B8%FB%F7%EF%3F%E2%B9%E7%9E%BB%C3%E3%F1%FC%E3%81%07%1E%D8o%DB%18%7F%FE%F9%AF~%F2%CE%BB%1F%17%AD%5DK%A8%AB%07%D74%DE%B2%C5%85%3F%91%5E%9D%F9%16%CB%E8Q%0E%87%E9C%F9%C9%E7%5B%8A%D8AW%02%80%01v%BB)Hv%CB%F2%06%23U%1D%FE%E3%D8%0E%05%C9%CA%86%06%B7M%10%D2%0CH%2F%5E%A3%AA%5B%CC%C6%19i%B7%0F%8Aj%5E%D3%D6%9BBE%8Ab%BAe%8Dr8r%22Ljl%82%01%5C%B5X%03%F7%AC%5Ds%CF%DAM%9B%1A%01%60%CA%94)9%1E%8Fg%CE%E8%D1%A3%C7%8B%A2h%89w%91%1C%0EG%F2m%B7%DDv%5Dqq%F1-%0E%87%A3%25(z%E1%CD7%7D%F8%CD%8F%3F-%01%04%82%10%AE%0F%16%84%D0%87%85%3E%C4%04%02%1305%25%CD4%B8%F6iS%D3z%9Ds%23%9B%8E%A7%8B%E2%00%B3q%D6x%BD%DB%8C%88%40%22%82%C6%F9%F1%1D%0A%92%24Q%3C%F6%00%A6%B1%D56Q%AE(%A6)r%05V%EB%40%23%86%11%00%BE%F4xL%CB%3D%CFHJ%9A%1Ck%3E-%19IL%A07kk%E6%EC%2C%AFh%04%80%7B%EF%BDw%D0%5Bo%BDu%97%C3%E1H%3AX%E6%2C77%B7WUU%D5%A3%E3%C6%8Dk%A1%E0%EF%FBb%C9B%7F%D7%FCm%F6%DE%BD%C9%DE%B7%0Fl%7DB%1F%7B%EF%BE%B0%F5%0E%FF%B9Oo%5E0p%40%E1%E0%FC%7CC%EA%BEV%D3%025%AA%BA%C5%84%81%C6%F8%C4%C4%EE%86%1A%C9%EF%AF4%E1y%B8%0E%C4%CD%BC%C6%95*%90%C0%D8%083Vr%A7%2C%9Bn%11%E1%FE%20%B1%EC%1A%EE%D7%F5%BA%8D~%BFa%81u%96(%3Ar%24ih%ACq%22%A1%F1%AD%8A%F2%D9%B2%7D%95%7B%00%E0%AA%AB%AE%EA~%DBm%B7%5D%C3%18%13%0E%A1%B6%0A%00%60%B3%D9%5C%1F~%F8%E1%9D%BDz%F5%BA%A5%B2%B2R%06%80%87%7F%5E%F3%F4W%2F%BE%F8%04A%17y(Y%84(%5C%F2%13n%0AM%9C%03%B7n%D8p%CA%F9%B7%DE%B6%D0h%FCm%B2%FCS%86%24%19%3E%C0~6%5BO%B3-%D9%A3ie.Q%CC%8D%056%C6y%AF%0E%05%89%95%B1%BEf%E5%94k%FD%FE%12%13%865%93%8C-s%AA%D7%B4%22%B3%BA%98S%5D%AEBF%24%1A%ED%B7*%B1%C0%3F*J%DE%03%80Q%A3F%25%3F%F6%D8c%7F!%A2C%06H%14P%12%D6%AD%5Bw%7BVV%D6%DD%00%B0%B7%AC%CC%FF%CD%A6M%1F%9C%7B%F1%F4%F3%60%E0%B9%8D%CA%C8%18b!z7h%90%5E%F0%BD%D7%BB%E5%84%84%04%C4(%CD%E0DD9%92%D4%C3l%8E%0D%BA%5E%9C%C8yN%2Cm%2B%10%A5%BC%5EP%20%CE%D8%BB%D7%B4%E4%82%C5%89%A4%5C%98%E4%85%98%B5%E2%EEk%B3u13%A6J%82AS%BBf%80%CD6%22%E2*%B7%AD%8E9%FD%12%08%7C%AC%AA%AA%0E%00%0B%16%2C%B8%CCj%B5%DALxv%3A%40~uc%DB%26%F1RSs%DF%7F%FF%FD%96%BA%DBKn%BEy%09%041hKM%E7%E1%0FZ%7D(%7F%C8%D0%8C%91%BDz%19n9E%C1%60%93%AC%EB%F5%B1%D20%00%20E%14%BB%9B%C6r%82%C1%B2X%F3%8F%1A%3B%AF%C3l%12%89(%D3(%23%5B%D6u%D3%FA%96%D4%F09xF%93%DE%1C%08%18%AAP'cb%B2%20t%8Fe%FC%86%80Cx%B1%BA%FAK%00%B8%E8%A2%8B%F2%F3%F3%F3%FBD%CC%946%3E%04%80%9A%9B%9B%A1%ABj%A86%26%F2oQ%00%8A%F5%FD%09%13%26L%8A6dW%2C_%BE%8CY%24b%92HL%12q%C0G%100%7D%FA%F4B%A3%7Bl%D2%F5%A0O%D7kc%D9%25%9CsX%00%97)H4-%9E%E6%C7%05%1D%09%92%14%23%BF%DB%A7%EB%B5fc%A4%85X%D6%98%FF%AEs%AEW%9A%245%E7HR%A2%25%94%A6%17%F3%0D%A9%D6%F5M%01M%D5%00%E0%81%07%1E%B8%88%C7~%C8-%CDvA%84%B3%A6L%C1%96-%5B%10%08%F8%F7%FF%BD%F0%D0m%8D!I%92%FD%ED%B7%DF%FEc%E4%FAs%1Fzh%25%A2%E2A%AD%3F%9Cs%3E%E2%A4%93Lm%81FM%AB0%B8G%10%C0zY%AD%C9Fc%94%2BJm%1C%8F6%B7%23A%92h%F4%EF~%CEM%3B%EC%24%08Bj%2C%9B%20%9C%83%D9%5CeR%DD7%D8n%EFj%E0%1D%81s%8E%5D%01%B9%A5SAfffA%24h%D7%FA%13%1D%D0%23%00v%AB%15%17%5Ex!%96%7D%B5%0C%3E%9Fw%BF%7F%0F%07%FD%A8%ADq%86%0D%1B%D6R%AE%B0x%ED%DA2%B9%A9I7%0A%5D%A4%BA%DD%99fkU%1B%02%09%0C%5EL%96%2BI%86%5EZ%85%A2%98%3E%13%CEyF%87%81%24%D6%B9%B9-%20%D14%D3%D2M%1B%91%DB%20-%00%1A%E07K%FA%CD%95%A4%EChw%B9-%D9%A4%A9%3B%01%E0%AE%BB%EE%3A%86%88%04%23bj%BF%F9%D9%EDp%B9%5Cx%F2%89'p%F7%DD%F7%40%12%04%08%D1%E9%8C1%E6%EEn%F5%D0wo%D9%B2%23%06%40B%1E%5EzZ%AA%CD%C4a%A8Q%D5Z3o2Y%14%13L4I%3C%E5%B4%C9%1DJ%CB%1B%A0%11*Q%20%0Emd7%F2.t%C04%AB%3EQ%10R%0Cf%02%08%22%D6z%7D%15%000z%F4%E8%98%B6Hd%DE-%7F'%C0j%B5%2211%11n%B7%1Be%25%25%98u%C9%25())%81%AA%04%F7%DB%A2%DA%18%8B%5Dt%D1E%F9-Z%C0%E3)%8F%85H%AEk%B0%25%B9%EC%92%C9%BA7j%9Ai%F1%B8%83%C8%D0%18%F7%98T)%84%D3*%9CG%04%24D%04%25%8E%D4%C2p%23%DD%98%A2%1A3%8D%11%2FK%8A%EDe%11H%94%D0%2C%07%14%00%C8%CA%CA%CA00X%0F%00%8D%24Ip%3A%1Cp%26%24%20))%09D%84%5Bo%B9%05%2B%BF%FB%0E%B2%1C%08%FD%5E%8C%EF%17%16%16%B6%A8m%8F%2C7%B5%A6%91%5B%3A%3B%EB%1AH%10%20%89%A2%A1%9APB%01%3A%E3%B50Y%CFx%1E%9D%AE%C7%97%E8%2F%A2c%84%C7%87'%3A%E41%DA%DEj88X%A8cb%04%94%A1%E4%D9%B8o%40%14%04X%AC%16%D8m6X%2C%96%90%ADB%84%E7%9F%7B%1E%9A%AA%E1%C4%13O%00%11ks%92.%97%CB%16u%13%BC%95%AA%05%00hQ%19%14%CC%7C!%8C%C2%E4%91%B7%FB%90%8B%FD%19ctD%40%C29%07%8B%BD%F7G%7B%2F%1A%0C%3A%14Q%1C%E5%1Dz%2C%12%8A%13H%12!%A6%FF%EAe%CB%B2%2C%B7%07%24%A1%5Ci%01%8C10%81%81%18!)%C9%85%3B%EF%B8%03%99Y%99%00%B1P%1B%EF%B6l%88%9A%9A%96%FD%DF%C2%D8%01%F6%1B%D75%80%EB%A1%BB%24%82%AA%AA%DCD%BD3%23%FB%8Ds%0E%ED%10%CF%BF%89T%A9%1F%B1%EDF%8A%3A%C0%D0%C0%E6%90%0Dr9!%84%B6%12C%09%00%CD%B1%14%10%17%25d%0D%1E%8C!%BD%7B%BB%01%A0%B8%A4%B82%EE%ED%86%87%FA%B8%AB%AA%0AUU%A1)*rsr%F1%D8cs%D0%25%2F%0F%20%16%D9nx%5B%DF_%B6lY%0B%DB%9C%ECp%A4%B6~%EB9%D7A%14%CA%A7U%7D%3E%AE%98%14t9%19%B3%99%01%5C%E6%3Ch%A2r%CD47%11%91%DAa%201k%26g%252%EDS*snh%8C%09D6%B3%84%9AZU%ADn%13%23%82%00%9E%90%80%9C%A1Cp%DA%B8q%5D%01%60%D1%A2O6%C5%04F4i%16%D9%0ET%15AY%86%3F%10%C0%B4%0B%CE%C75%D7%5E%83%80%2C%23%A8(-%BF%A7%B71%96%AE%EB%CA%D2%A5K%5B%8A%A7r%B2%B3%0B%F6_%3B%1D%D1%2Fm%FD%BE%7D%0D%B2%89%16H%11E%B7%D9zz4%CD%B0%12%2F%5B%92%1Cf%40%D3u%BD%A9%C3%40%A2%115%1Bq%1C6%22S%06%D0%A7%EBuF%C8%96%88%EC%99%A2h%08%B6%9D%B2%5C%DC%C6%FB%00.JH%E9%DD%0B%CE%DC%1C%9C0%F6%C4~%00%F0%DA%AB%AF%EEQ%14%25%10%CF%9E%CF%01%C8%C1%20%04Q%C4%3Dw%DF%8D!C%86%80c%FF%2C%FAX%2FJuuuY%F46%91%D5%A3GFt%1E%B2%AE%A9!M%A5%03%BA%AE%F3%BA%9A%EA*%B3%F3z%D2D%D1%8C%BF%E0U%AAjF%3C%9A%3E%13%C6XM%87%81D%D5%F5%06%A3%3D%D2%CE%98%A9%BF%DD%A4iU%AD9%83%E8%9B%16%89%EC%19%26%BE%FF%86%03B%E0!%13G%B7%D9%90%3Br8%EC%E9%E9%186%7C%C4%E8%C8%BF%EE-%DA%BB%25.%ED%C89%02r%00o%FD%FB%DF%E8%92%97%07%DE%DAl2x%23%DF%7D%EF%DD%CF%22%7F~%E4%CE%3BG%84%8FO%0B%DB%0E%3At%AEA%87%0E%0E%9Ds%E2TZZj%9A%DC%9D%2C%08%B9f%B6%D9%1EY%AE7%01I%3C%1CHE%87%81D%E1%DC(%0E%C0%9D%8C%A5%9B%C6%12%14%A5%CA%20%92L%00P%60%B1d%9A0%91%01%8F%A6%15%FFj%88%10%60%B1%C0%91%93%83%F4~%FD%60Mr%F3%94.y%09%D3O%3D%B5%3B%00%5C2%EB%927TMU9%DA%FEO%E7%3A%0F%FD%9F%E3%F9%E7%9E%87O%0E%20%A8*%07%FCNxs%3A%E0%BF%26OS%DDm%B7%DE%D6%92%245y%F2%E4qa%CB%9C%22%DB%1Aq%06%E2%04%E2D%0C%02%16%2F%7C%D7%B4%FDCBh%3Dc%B1%CA%5C%07%D4ZM3%E4%A6%B2%24)%DD%A4%1D%058%E7%25%1D%09%92R%03%BB%84X%1C%86k%A9%AAV%1Ah%12%00%40%3F%BB%BD%AF)%F4%15ek%8B%01L%04.I%C8%1E5%0A%C62%0A%00%00%19%13IDAT%22T%95%97%90%40%10%18n%BE%E3%8E%B3%01%60%C3%86%0DM%1B6l%F8%DE%C8h%D5u%9D3%81qb%F4%AB%AD%12%A2%E1%B9%AE%EB%DC%E8%BB%2F%3C%FFBKF%FF%A4%91%23s%7B%0D%1B%D6%03%3Cl%95r%0E%A8%80%A0%0B%10%B8%08%A6%0B%5Co%0E%E8%EF%2C%FE%CC09%2BO%92%12%1C%8C%A5%1B%25D%7B4%CD%B4%F5E%9A(f%9A%25%2F%01%D8%D5a%20%D18%2F%82%F11%24%18i%92%C3%F9%83%D7%5B%14a%FAbi%A44A%E8i6%97%A5%1E%CF%8A%96%9DF%94%C0R%D3%D0e%F0%60XSS!X%2C%A1R%86%E3%8F%EF%3Fm%DC%B8%02%008i%ECI%F3%9B%9A%9AL%23%A2-%99%A9%3CB%9B%19%CB%E6%CD%9BW%3F%F8%E0%83--%CF%E7%3C%F5%D4%0C%CE9tM%23h%1A%D4%A0%0A%95s(%5CGP%D7%B8%CAul%D9%B8ak%85%CF%E77%1A%B7%BF%CD%96mD%3Cr%CEQ%A5%AA%A6Y%80)%82%90g%E2%DE%E8%9C%F3%8E3%5C%15%E0%E7X%C6%5Bd%22%C7%D8l%05Fc%D4i%9A%1C%D0%B4%C6Xn0%11%91%5B%14%BB%E6%88%A2!U%BC%DA%E7%2Bk%D6%B4rN%E0%5C%92x%EE%B1%A3%E0%C8%C9%81%251T%BAI%8C%11'%E2O%FD%F3%9F%D7D%86%1E%7B%E2%D8%BF%FB%FD%01%FF%AF%DA%E3%D7O%3C.r%EB%DF%AD(%AF(%3A%FE%B8%E3_%8E%CC%E9%F1%DBo%1F%D3%AD%7F%FF%9EJs3W%9A%9B!%7B%3C%0847%22%E0m%84%ECmB%D0%DBHA%7F3-xq%DEWfk%3D%DC%E1%18%1Ek%AD%23%3F%2BV%14%D3%96%1E%C9%82P%60%C4%83h%9C%EF%9AU%5C%DCq%3C%89%00%2C7%A2L%89%88%E7Y%2C%A6%890%95%AA%BA%DEh%CB!%40811%B1%8F%D98%EB%FC%FE%2F%20J%24%A4%A7S%D7%91%23a%CF%C8%80%60%B3%A1%A5%CF%08%11et%EB%96%F2%F9%BF%FE5%0B%80%B0w%EF%5E%F5%0F%E3%C7%3FRS%5D%D3%A4k%3AtM%83%A6%AAP%82A%04%FC%01%F2y%7D%14%F0%07Z%3Er%40%269%20SP%0E%22(%07%A1%A9*tM%83%AE%E9%D8%B6u%DB%9E%FE%FD%FB%3F%11%26%22%D9%09C%87%A6M%3B%FD%F4%8B%1B%B7m%E5%8D%3Bv%C0%B3k'%3C%DB%B6%C2%BFs'%02%3Bv%C0%BFs%07%F7%ED%DC%C1%AB%D6%FD%5C%3F%F7%CD7LKNr%24%A9%3F%0C%3A*%12%11%96%7B%3C%86%C9Y6%22A%0C%D1%121%B5%3F%01%9B%E2f%A3%E3%F9%A5%1C%9B%ADXQUM0%88%AAf%88%A2%A9%3D%B1M%967%16X%AD'%18%15%89%0F%B5%DBOx%AB%BE%DE%F0%14%A87%EB%EA%BF%1B%91%9Eqv%F7cG%25%26%E4%E7AJL%A4%E8%C3%8A%22o%DCI%E7%9E%7B%C2KEE%CD%97%DFv%DB%E7%9B7o%D6%0B%0B%0B_~%FB%ED%B7%A7%0D%1B6%2C%871F%8A%A2%40U%D56A%CB%18%811%81%04A%80%24I%DC%E7%F3%F1%8F%3E%FE%E8%A7%EB%FE%7C%DDb%00V%00z~FF%C2%8D%C7%1F%7F%D7%86%B7%DF%16%C0A%60%04%B5%A1%01%3C%18%0C3%AD%3A%00%10%D7u%AC%AA%AD%FD4h%E2%FA%0Es8%B2%12B%1D%11%DA~%B0D%E4%D7%B4%FAbE%F1%18%8D3%D1%E5%EA%B7%9F%FB%D7%B6%1D%F9K%87%82d%FA%EE%DD%CAs%5D%BA%ECp%12%C5%AC%BDI%10%84l%B3q%1664%AC%3D%D5%E5%82A%E3~%CA%94%A4A%19%A2h%AFR%D5%98%7B%B7%9F%EB%EA%8F%CE%84%0F%C6%0E%1B%3A%D3%9A%96%06%C9%E1%08%01%E4%D7%A3M%22%A5%98%FC%BCk%AE9M%E5%DC%F6%A7%3B%EEX%26%CB2%9Dq%C6%19_%0D%180%A0%E7%7D%F7%DF7x%40%FF%016%8B%C5B%8C%A8%0D%BD%1C%9A%5Ecc%23%FFn%D5wu%B7%DC%FC%D7%E5uu%8D%E5a%EDK%BD%EC%8E%B4%1B%12%5D76~%F6%99%B31*%8F%80%F6%EB%BFG%9C%83%23%A0%EB%0D%8F%95%96~m%B6%3E%93%5C%AESb%F5%C4%8D%24x%EF%0D%06%7F0%1B%A7%AF%D5%DA7%8E%13S%BF%EEP%90%84%19%D3_%9C%80%A1%B6%98%E2v%0F%7C%BF%A1!%A6%8B%A7r%AE%D7)%CA%8E%14I2%CC%CE%BA(9y%DC%13%D5%D5%86%87%0F%FE%F3%A7%1F%97%DF%98%9A%F2%07%8B%CB%95%0DA%A0%D6%C7%9DEN%B3%10E%91O%BD%E2%8A%933%BAt)%B8d%F6%EC%8F%9AdY%DE%B4iS%D59S%CFYGD%A9%E7%9Dw%5E%D6%88%11%23l.%97%8Be%E7d3%9F%CF%07%AF%D7%ABUWU%ABK%97.%AD_%B2dI)%80%1A%00%1E%00*%00%ED%EC%A4%A4%E1%E3%13%5Dg%DB%82%B2%40L%A0%FD%CC_%D6%12%83%8C4%3E%A4%A5%CD%CD%0B%CC%084%0B%11%EBa%B5%9E%60%F0%02q%00%B4%CA%EB5%05I%BE%C52%C4%E8x%FB%10z%F9%DA%8E%07%89%AE%7F%04%60%9A%D1%EF%0C%B4%D9%0A%DF%07%0Cy%80u%81%C0%D7%A7HR%2F%A3%C5%E8o%B3%9D%0A%C0%F4%84%CAY%D7%FEy%EE7%3F%FC%F0%08%13%04%8E6%DE%1CA%10H%D7u.%08%02%1Fz%E2%89%DD%16%2F%5E%7C%CD%2B%CF%CF%5B%F5%F2%3Bo%EF%0E%1D%16%C1%03o%BD%F5V%E3%5Bo%BDe%89%B2%CFx(%D4%84%20%00%1F%80%26%80%9A%00%EE%E9i%B18%A6%24%25%9D%95k%B1t%15)l7%D0%81%DA'%FA%2F%E5%8A%B2faC%C3%CFf%F7rij%EAX%0A%F5%A1%8B%19kQ8o%FE%BA%B9y%AF%D18%E9%A2hw%0AB%96%C1V%03%8D%F3%CD%97%16%17%C7%DD%FF6%EE%C6z%D3SR%CA%88%E8%96%18%F5.%1C%00%25%08B%E6G%8D%8D%8B%8D%C6%F9%C5%EF%2F%3D%DB%ED%3E%D3%88%07%10%88%A4LQl%FC%C9%EF7lXWZS%E3%CB%92%2C%9E%11'%9F%5C%18%A6%99%F7%7BRQ%E7%26%11%11A%B2%D9h%C0%B0%A1%5DO%1B7n%40JR%92VY%5C%5C%DB%E4%F7%D7%01%F0%86%3F%CDa%8D%D1%10%F9%10%D08%CAn%CF%9A%E2v%9FxRB%C2%C9%C9%A2%E8%B6%09%02%97B%F1%262%22%ACd%5Do%BC%B5%BC%FCa5%8Eh%EBUii7%0A%14%B3u'%E7%9C%D3%E6%40%60%F1w%06%D5y%00p%BE%DB%3D%AA%C0j%1DbT%92%0B%CE%DF%FF%B0%B1qQ%87k%92Y%C5%C5u%2F%E4%E5mw%08B%AF%18%8C)%97%88%1C'%25%24%14%98%A1%7D%B7%2C%7F%DD%C3f%1B%DB%D6%EB%17q%DBF%3A%9D%D3%E6%D5%D6~c6%AFk%EF%BBwY%9F%FE%FD%BA%8C%9B6%ED%A4%96%26%EDQ%0B%C4%18%83(%8Ap8%1C%10%04%01V%AB%15%09N%A7%D8%A5%7B%F7AgO%9B6%A8%A1%BA%9A%EF%D8%B2%A5%A2%B2%AA%AA%A1%B6%BA%3A%E0-%2B%E7%DE%DD%BB%98%5B%D3%12%D2%19KO%13E%B7%9D1X%18%83%15%E0VA%20%16%EA%3E%14%B3%5B%23%0F%A9)%FD%81%7D%FB%EE%89%E7%7C%9Dk%D3%D2%26HD%0E%23-%02%00%2F%D6%D4%7Cf6%D61v%BBa%F9fx%1Bz%07%ED%90v%E5%93%F8u%FDK%3Bc%BD%8D%A8%F51%09%09%A3%CD%40%B2%A0%BE%FE%E3%BB%B2%B2N2P%26%10%01%EB-%19%19S%1F%A9%AAz%CFl%5E%7F8%FF%FC7%D6eg%A7%14%9Ex%E2%A0H%97%9F%08P%22%20a%8C%C1b%B1%90%D3%E9%84%DB%ED%86%CF%E7CFF%06%FCy%F9%D4%A7%7F%FF%1CommN%C3%EE%DD%D8%F6%C9'h%AE%A8%84EU%60%11%18%84%10%F8!%85*%CBBM%1C%0DZyF%0C%91%17kk%EF%2B%0E%06%3Dfsw1f%19%E6p%9Ckp%88%03%07%80%F2%60%F0g%B3%C6%C9%E9%A2hO%15%C5%3E%06%5B%0D%07%E0%E7%9C%AFi%CFsoW%3E%89%8D%B1y1%A1%1En%DC%D2%DDj5-D%DE)%CB%0DU%8A%B2%11Q%D9%7Dm%8D%D7%DFn%9F%D4%D3bq%C73%B7%C1c%C7%CE%FDa%C9%925m6%EB%0D%03E%14EX%2C%168%9DNJKKC%97%DC%5C%F4%EC%D9%03%7D%7B%F4%40%DF.%5D%D0%D5bAry%05%BAZDd%5B%24%A4%8A%22%DC%A2HNA%20%0Bc%10%C3%9F%18%8B%DF%A2A%5E%A8%A9%B9%7BU%9CG%AA%DC%9A%99y%19%0B%A5H%C4%F4%F88%E7%F4%EF%86%86%85fc%9D%EBv%1FgT%93%14%CE%D1%5D1%AB%B8%B8%F1%B0%81%C4N%B4!%C8y%99%01%93G%02%60%BF%209y%A8%D9X%0B%EA%EB%17%18%25!%85%DF*%FE%D7%AC%AC%DB%E2%9D%DF%A8%89%13%9F%7F%E7%B9%E7%16%B5t%232V%B9arZ%87%E2%F3%C1%BF%AF%12%C5%2BV%80%9A%1A%01M%8B%99%1D%1FKy%84%8B%D4%1A%EF%AE%AC%BC1%5E%80%9C%E3v%17%E6Z%2C%C3%0DZ%8C%81s%CE%AB%14ec%3C%CD%0A%07%D9%ED%13be%9CE%1Dl%D9%EE%83%08%DA%05%92Y%C5%C5%BCY%D3%3EB%EC%E338%00%1C%EBt%9A%9E%81%BB%CE%EF%AF*W%94%B51%D9%D7%90%FE%25%3B%13%D2%FE%D6%B7%DF%F4x%E7x%DE5%D7%7Cp%EB%E5%97%CFm%DC%B7%CF%1F%8B%DE%8Ez%00%D0%82A%04%EB%EB%D1%B4g%0F%AA%7F%F9%05%A4%AAqDn%F6%D3%1E%00%40%E5%8A%B2%E6%BA%D2%D2%9B%E3%D9b%00%20_%92%12Ow%B9%AE5%88eE%3AH%D1%2Buu%A6%E7%FD%9E%9A%98%D8%CB%CEX%9A%D1Q%BB%3A%E7%5E%00%9F%1FV%90%00%40%AA%24%CD%8D%3A%CE%ACM%03%D6-%08%DD%C68%9D%F9fc%3DYU5%3F%F2%9D%03%1Ffx%5Bu8%F8%D0%A1CO%BE%FF%EA%ABG%C5%3B%C7G%E7%CF_%DF%B3%7B%F7%BF.%FF%E0%83U%5CU%89%E3%C0%B3%809%0Fe%02)%5E%2F%FC%D5U%D8%B5b%25x%93%07P%8D%B5Ht%17F%CECD%D9'%8D%8D%CF%DCV%5E%FE%7C%7B%0E%81%BC%3D%2B%EBN%83V%E9-%EB%B9%2B%18%FCjK%1C%AD%C1%26%B8%5Cg%C4%0AyD%80%CC%88%3E%9FYTT%7F%D8A2c%EF%DEm%3E%5D%DF%18u%9Cj%9BjmrR%92iK%C9%7D%AA%EA%5B%E7%F7%BF%D7f%C3_N%80%D5%0613%93%8E%99r%16%BF%FA%BA%EBf%9F%FF%87%F1%DD%E2%9Dg%AD%DF%2F%8F%9D2%E5%A5%3F%1E%7B%EC%5D%3F%2F%5D%FA%0BWU%8A%DA%C6%00%5D%87%16%94%11l%A8G%C3%AE%DD%A8%5E%F7%0BHQ%60%90%C6%B1%1F%40%02%BA%DE%F0%BD%D7%BB%E0%9A%92%92%9B%E3%E1A%F6%03qN%CE%F5%E1%B7%DE%08%8B%5C%D1u%FFSUU%A6%9E%C8H%87%23'M%14%FB%C7%3AL*%EAgsp%10rP%89%D0%B2%AE%3F%1A%C3%7DmQ%93Y%92T%18O%0B%A8'%AA%AA%3E%F5jZ%C5%01%9AD%B2%80%BB%5C%184%ED%3C%24u%EFN%F6%F44%FE%CA%DB%0Bo%9D%3Czt%97%F6%CC%F5%B3%B5k%CB%87%8D%1F%FF%D4q%FD%FA%DD%B2%E8%B5%D7%96Tl%DF%5E%8D%F0%C1%89%8A%A7%99%FB%CA%2B%B0%EB%9Bo%2047%03%9A%C6%D1%C6%A9%1BQu%C3%BCFU%B7%7C%DA%D4%F4%CC%9FKKo~%AE%A6%E6%2B5%CEs%7D%23%F2%40v%F6%ECLI%1Ad%B4%CDD%96q%A9%C7%F3jc%1CG%C1%9C%93%9C%3C5%D6%F3%88x%7B%3A%E7%BBg%16%15%AD%3C%98%E7%7D%D0%B5%1B%2F%E5%E7%D7JD%C9FFW%95%A2%AC%BF%A9%BC%7Cn%3Co%C25%E9%E9%F7%B7%2C%1C%13IKLD%EF%A9S%D0m%DC%C9pu%EF%01k%B2%1BL%94x%D0%EBU%2F%F8%E3%1F%1F%FAp%C5%8A%E2%83%99%B7%85%88%8D%EC%D5%2Bm%C6%8C%19%85%FD%FA%F4%EE%85%7D%FB2%B7%BE%F4J%AA%A5%B1%D1%0E%5D%DB%9F%0C%E3%BC%C1%AB%EBU%F5%9AV%BA%D1%EF%DF%B0%D2%EB%DDi%14S%8A%07%20%5D%24i%14c%CC%F0%08%5B%CE9*Tu%ED%ADee%CF%9A%8D9%C6%E9%CC%BF%22%DC%E88%D6x%E1%1A%A2%2Bf%16%15%BDtDA%F2DN%CE%5D)%92t%9F%91%CA%D4u%9D%16%D4%D7%3F%F4%85%C7c%9A%01uej%EA%C9%C7%25%24L'A%E2Z%82%93zL%3E%1D%3D%26%8C%87%AB%7BOXSR%20X%AD%20%C6%A0%EB%3A%D7d%99_%3Fc%C6%E3%2F%BC%F7%DE%16t%80%D8EQ%948gb%C8%1A!%0D%E0*%E7z%40%D7%B5%F6j%0A%A3-%26%A2AL%0E%D8%E6%B2%AE7%DCPZz%AB%2F%8E%AA%C6'rsoI%0D%859%DA%3C%7B%08%00t%CE%9B%C0y%EA%25%25%25%DA%11%DBn%00%20%D5byX%E7%DCg%D4%A2%9A%88%F8%948%8E%E2%00%80y%B5%B5%CB*8%AD%D3%9C%0E%EA~%FA%1F%D1m%DC)H(%E8%06%8B%DB%0Df%B1%B4%18%93%82%20%90d%B7%D3%B3o%BD%F5%D7%05O%3F%FD%C7%8Ex%80~UU%9B4-X%A7ir%AD%A6%05%1A4Mn%D6u%A5%23%00%92%2FI%89%2F%E4%E5%3D%12%BD%C5%18%04%F08%00z%AD%AEnn%3C%009%3F9yh%8A(%F6%8E%15%CC%8B%18%C6%8C%E8%A1%83%05%C8!%81d%C6%DE%BD%8AG%D7%E7%C0%A4A%AD%83%B1%CC%EB%D2%D3O%8Dg%CC%3B%8A%F7%3E%9By%FA%A4%F2%1E%E3%C7%C3%D5%BD%07l%A9%A9%3C%A2A%A2%0D0%22%22%12%04~%E1%B5%D7N%F9%E5%DBo%AF%B7v%5C%B9j%87%CA9nw%E1%7D%D9%D9%8F%DB%19K5%3B%25%3DR%90%FE%A5%C7%F3%E2J%AF%D74A%D9J%24Lp%B9.%81A%FB%F5%F0%FB%DB%CC%18%7B%FCP%EE%E3%90*%F8%AE%2B-%FD%9B%AA%EB%CD%06%5C%04%07%C0%879%1C%E7%F4%B3%D9R%CC%C6%D3%00%FD%D2%17%E6%3D%20%A4%A77%D9RS!X%AC%60%A2%C8)%1C'i%EB2%03%C7%8C%19%D4%D0%D8%F8%CC%CD%B3g%0F%3AZ%C0%E1b%CC%F2Pv%F6%9F%26'%25%5D%C7%18%A3(W%D7(O%98~%F6%F9%DE%7B%A3%AE.%AE%93%ADn%CF%CC%BCX%00%1C%06nt%C4F%B9%F3%E2%3D%7B%D4%DF%0C%24%00%E0%E3%FCf%03%2F%A7%85%E8%BB%3A-%ED%DAx%C6%AB%AC%AF%97%C7N%9CxW%C0%EB%F53Q%A4hUJ%FB%1F%8FJ%91%15%B6%26%26%8A%8F%CC%9Bw%FD%8Eu%EBn%1D%5EP%90%FA%5B%02%E4%DA%B4%B4%09s%BBty%D6%88Im%0B%20%5B%FD%FE%CF%9F%AC%AE%FE4%9EkLr%B9%FA%18e%F8E(~%CEy%D5%AC%E2%E2%B9%87zO%D4%11%0B%F3%CF%FC%FC%BD%16%A2%FC%98%8B%12n%2B%B59%20%7F%FA%C8%BE%CA%F7%E2%19%B3_%5E%9Ek%D5%8F%3F%3E%E8%CA%CCt%C4%3B%C9H%80l%ED%F2%E5k%FF2%7B%F6%BB%DFl%DB%B6%EFH%00%C3B%C4.MM%1D%3B%DC%E1%98%12%15%CD%E5%26%EB%DBrh%C4V%BF%FF%F3%BFWU%BD%1D%CF%B5%D2%04%C1%FE%8F%DC%DC%C7%05%C6%24%B3%ED%0B%C0%A4%99EE%8B%8F%0A%90%BC%9A%9F%DF%9F1%B6)L(P%CB%D0%91%D1%19%03%98%00%CE%04%BC%D9P%FF%C8%17U%FB%B6%C73n%5EJ%8A%E3%C7%1F%7F%BC'%A3%7B%F7T%8A%02A%1C%40%01%00%DA%B1v%ED%CE%7F%BF%F4%D2%D2g%E6%CF__%1D%08%04%3A%1A%1C%C3%1C%8E%ACI.%D7)%3D%AC%D6%13%08%B0D%BD%C1%A6%F3%8CL%F5g%9F%EF%BDx5%08%00%CC%ED%D2%E5%CEdQ%2C0%F3%90%88%E8%CB%19%7B%F7N%E8%88%FB%A4%8EZ%B0%A7%F3%BB%BE%98%C4%D8%15%10%84P%D1%14Q%A8%1A_%14A%0E%3B%AC%E9%E9%DC%DD%B3%072%FB%F6%E5%D7%CC%9Bw%CBw%EB%D7%D7%C53n%A2(JkV%AE%BC%A9%F7%C8%91%3D%A2%CEk1%7D%00%BA%AE%87%BB%ED%82%FC%B55%EA%C6%E5%CB%B7%2C_%B9%F2%A7%D7%DE%5C%B0%A5%A4%B1%B1%A9I%09%06%DB%7B%8Fy%92%94%D0%DFf%CB%1E%EEp%0C%CF%91%A4%FE%91%A4%E58Aq%C0%16%F3%A5%C7%F3b%BC6%08%00%DC%93%95uI7%ABuL%3C%E7'%AB%AA%9Apii%A9%F7%A8%02%09%00%BC1%FA%B8%7D%B6%A4%A4t%C1%E9%84%98%E4%22WF%06%9C%E9%E9pef%C1%9E%9E%06k%B2%9B%8B%89%89Pt%EE%ED9p%E0_%E3%3D%7C%11%00%16%CD%9F%7F%FEi%17_%FC%07b%CC%F0%81D%B7%BB%0A%9FI%83%40m-%1A%B7o%E7%3F%BD%FE%265%AC%5E%0D%D9%D7%5C%EF%D3%B4%DAFM%AB%A8%D5%B4%8A%1AU%ADm%D4%B4%E6%60%C8%ED%E4%0C%60N%C6l)%A2%E8N%13%C5%8CdA%C8M%60%2C%DD%C1XzT%E1T%7B%B4Fd%FB%01%E7%9Cd%5D%AF%7F%AD%AEnn%3C%5EL%8B%AD%93%9E%3Ea%84%C31%CD%ECR%E1%FB%BFhfQ%D1%BF%3A%EA%B9v(H%F6%2C%5Cx%0C%B7Y7H%89%89%5C%B4%D9%C0%ACV%12l6%086%1B%24%9B%1D%CCj%85h%B1%82%24%11%A5%DB%B6%95t%2F%2C%BC%97%C7%D9H%05%00n%BA%F8%E2%C2%BF%3D%F9%E4%15%CE%94%14%3B%DA%D0*%FB%01%04%80%AE%AAP%9A%9A%D0%B4w%0Fv%7D%BE%14%3B%DEy%07%D4%D8%C0%89k%146%93(%DA%20%8E%7C%2F%D2(%A6%D5%F9%7C-%60h%AF%E6%88%D6%1E%15%AA%BA%F6%BE%F2%F2y%F1%F0%20%11%B909y%F8%A9.%D7%9F%E2%20%E2%C09%FFtVq%F1%1F%3B%F2%B9v(H%00%E0%E7%F7%DE%BB%BD%F7%981%0F%92(%80%09b%A4%AA%0E%10%18%18%13%C2%9C%2681%81%B6%AD%5E%BD%B3%DF%E8%D1%0F%A3%1D%40I%B3%D9%AC%8B%FF%F3%9F%2B%86M%980%04%E1%87%C5%7F%FD%FF%AF%8B%A5iP%03~xKKQ%F3%F3%3A%7C%3Fo%1EP%5E%09%A8A%1C)%89%8A%96%93%A2%EB%FE%A5%1E%CF%AB%FF%AA%AFoWV%D8T%B7%7B%D0%19II%D7%C3%A0%60%AB%85Y%D5%F5F%9B%CD%96v%C1%8E%1D%DAQ%0D%12%00%D8%FB%D3O%DFt%194%E8Db%14%B6%F1%0Fpa%5B%B4%C0%D6%D5%AB%B7%F7%1F%3D%FA%D1%F6h%14%00%B8j%EA%D4~%0F%CE%9D%7BYJnn%F2~%20%09%F7_%D5%82A%F8%AB%F6%A1a%F3f%ACy%FD%0D%F8%D6%AD%07d%7F%1CNG%C7%E0%03%A1%9C%1B%CE9%A7%5D%C1%E0WOUU%BD%13O%B0%AE5%40%26%BB%5C%D7%87c%3Dd%E6%25q%CEG%CE*.%FE%B1%A3o%E6%B0%AC%D6%04%40XXYY%91%98%9E%9E%D6%DA-%8ER%ED-%40%D9%F9%D3O%7B%FA%0D%1F%FE%D0%C1%D0%E0%F3%1Ey%E4%E4%E9%B3g%9Fkw%BB%AD%3CT%B4K%9A%AAB%AE%ABC%D3%AE%1D%D8%B6%E8%13%14%7F%B2%18%CC%EB%0D%F5-%23%3A%EC%E0%88%ECHU%8A%B2%F1%95%BA%BA%D7%E2%C9%071%D9b%0Cw%B7%F0R%5E%3E%B3%A8%E8%E5%C3qS%87m%C5~%9E3%A7G%BF%D9%B3%B7Z%9CN%C1LM%12%11%ED%DB%BD%BBj%F8%90!%F7%9765%F9%0E%8A%ABy%FC%F1%93%A7N%9Bv%96%2B-5Anh%E4%CDE%7B%A9%E8%BB%EF%F8%A6%D7%DF%20%A1%A1%09%D0%D4%0E%BF%DB%A8%A7%17%D1%1C%00%80%F2%60p%ED%BF%1B%1A%16%C6%93rhd%A4%1Am1%AD%AE9%7FfQ%D1%A5%87%EBY%1E%D6%D7j%E7%BB%EF%8E-%98%3C%F9k%26I%DC%C4%A7'%CE9%F7%7B%3C%CAy%13'%3E%F0%C9%AAUe%07%7B%CD%EB.%BA%A8%FF%C5%E7%9D%3B%D1Z%5D%3D%60%DD%FCW%C1%F7U%01J%F0%90%8CN%23pG%80%A1p%DE%BC5%10X%FAbM%CDgM%ED%DCVb%B8%B9%86%5BL%C4S%02%F0%D5%CC%A2%A2q%87%F39%1E%F6%CDy%CB%07%1F%5C%D8%7B%F2%E4%05f%AEkd%F1%F5%60%90%E6%FC%EDo%2F%DD%F2%E8%A3%AB%0E%F1%D2%EC%D2%9C%9Cc%FB%13%1D%1B%7D%24Y%B4'%D3%1E%AC%B46%8E%89%08~M%AB%DF%1B%0C%FE%B0%CA%EB%FD%C1%AC%8C%24%1E%26%F5%AE%EC%EC%1B%DD%82%D0%CD%84%7B%89%B6A~%D1u%7D%D8%A5%A5%A5%DA%EF%1A%24%00%B0%ED%93O%AE%EEu%EA%A9%CF%C2%9C%E3hyCW%7F%FA%E9%0F%C7%FD%F1%8F%FF%E4%1D%94%CF1%3E1%B1%7B%3F%9B%ADg%8E%24%F5H%11%C5%EE%16%C0E%A1.%15f%F1%2B%AEs%AE%EB%80%EA%D1%B4%B2*U%DDY%AC(%7B%96%7B%3C%5B%CC%AA%FB%E3%95I.W%9Fs%DD%EE%1B%C2T%7B%5CT%3E%E7%7C%07%80%81%B3%8A%8B%E5%C3%FD%FC%8E%08H%00%60%EB%A7%9F%5E%D7%7B%C2%84%B9%88C%A3D%F4%A9%B7%AE%CEw%DD%C5%17%3F%3D%FF%D3O%B7%1F%8E9%F5%B2Z%93s%25))Y%14%13%1CD6)D%94%91%0Eh2%E7A%8F%A6%F9%AAT%B5i%8F%2C%D7%9B%F5(%3B%18%B1%12%09%B7gf%5E%1C%0E%D6%19r%20%D1%5BL%18%20%83g%15%17%FB%8E%C4%B3%3Bb%20%01%80%AD%1F%7F%7Ci%AF%89%13_%26A%88%8B%5E%8F%A8%DC%95%1F%7D%F4%FD%CC%CB.%FB%D7%AE%9A%9Af%FC%97%C8%F9%C9%C9C'%B8%5C%97%84%C3%FD%88%C77%0F%93e%BF%00%18u%244%C8o%02%12%00%D8%F3%F1%C7%A7%E7%8E%1F%FF%91h%B5%C6%05%92%88%01%207y%94%B7_%9C%F7%9F%2Bo%BE%F9s%B9%1D%A5%0BG%9B%8Cq%3A%F3%A7%BA%DD%17%A4%88bo%13%EF%A5-%2F%E6%2BM%D3%26%1Cn%1B%E47%07%09%00l%9E%3F%7Fh%F7s%CEYiq%3A%ADF%143%11%85%93xC%86%01'%A2%DA%DD%BB%9B%16%BE%F9%C6%877%DC%7B%DF%B7Z%07%D9%2BGBF%3A%1C9%E7%24'O%CD%14%C5%C1Q%5B%8B%E13%88J%E6%A2%C3%ED%E6%1Eu%20%01%80%C5%D3%A6%B9%87%FF%FD%EF%2B%D2%BAu%1B%10%BD%18%AD%E2%25%E1v%99%1C%BA%1A%E4Z%40%26%B9%BE%9E%FB%F7%ED%A3%CA%AD%5B%9A%5E%7F%EE%F9%25on%DA%F4M%B5%DF%EF%3FZ%C1qjbb%AF%09.%D7%19i%A2%D8%3F%7C%83q%7B%E1%91x%CF%E1%24%CA%8Ej%90Dd%EF%AAU%AFu%3D%F6%D8%19Q%0B%D2%D2K%15%00%B8%A6B%0B%C8P%3C%1E%F8*%2B%E0%AF%DC%C7w._N%A5%2BVr%AA%AB%25%3D%20%EB%E5A%F9%C7%E5%CD%CD_%2F%F1x%B6%1F%0D%C0H%17E%FB%B9n%F7q%83%EC%F6%09v%C6%D2%22%E0%88g%BD%A3%5Dm%3D%D4%89%7B%C2%E1%A0%DA%7FW%20%01%80%BD%9F%7DvZ%CE%981%1F%09v%BB%00%CE%89%EB%3A%D7U%95%F4%60%10Js3%0255%08%EC%ABD%F9%FA%0D%D8%F5%C5%17P%CA%CBA~%3F%E7%9A%16Q%3B%14%26%B4%BC%BBey%C5j%AFw%CDW%CD%CD%BB%8F40%26%BB%5CC%8F%B1%DB%8FO%15%C5%3E%D1%5CG%3B9%99H%F5%FF%A7V%AB%F5%8C%8E%0E%D6%FDnA%02%00%0BG%8FN%18%FB%DAk_%26%E7%E4%8CR%FC~%AE67%93%5C_%07%B9%AA%06%B5%BBva%F7%D2%A5h%DA%BE%1DL%0E%00%8A%12*%EAnE%8CEk%23%9Ds%B5J%D36%EC%96%E5%0Dk%BC%DEmfG%B3%B7WlD%C2D%97%AB__%AB%B5o%BE%C52%24%DC%82%AA%E5AG%D3%F5%F1%00%23l%9CF%40%D5%A1%F9%20%FF5%20%89H%E9%D7%CB.%24Iz5X%5D-Ul%DA%C2%2B%D6%AC%A1%A6%5D%3B!%C8A%20(%1BV%FCG%C7R%DAjk%E1%D1%B4%B2%06%5D%2F%AE%0E%06%CB%AA5%AD%BA%5CQj%2B%14%A5%A1%5CQ%BC%AD%CF%AC%23%80%B2%25%C9%91%23I%AE%1CIJ%CE%92%A4%F44Q%CCL%11%84%BCdA(%08%F7I%8D%CE99%98%1C%93%96%EF%85%81%FE%85%AA%AAgwTF%D9%7F-H%00%E0%CBi%17%8A%7B%EBk_%13KJ.%24M%03%82r(w6J%7B%1C%ACDk%1B%C3%85ie%40%B7%A2%CA%5B%A2%BD%07%B3%86%D1%F1%AA%B0%06%A9%22%A2Y%1D%91%B4%FC%3F%03%92%88%BC%D6%A3gOE%09%CE%B706%E6%60%DF%D6%A3I%DA%00G3%80%3B%3B%A2%EC%E1%7F%16%24-%60%E9%DAu%B8%0A%CC%15%81%E3%A2%F7%F0x%3D%86%A3%00%1C-%9A%88sN%1ChdD%0F1%C6%1E%3F%D4%C2%A9N%90%1C%08%96%81%0A%E7w%8B%C0d%22%B2D%40%D2%DE%88%EEo%A15%C2%C6%F4nF%F4w%5D%D7%E7%1FJmn'H%E2%90W%F3%F3%D3%19c%17*%BA~%9DH%D4%3D%9A%87%E8%88%7C%91%8E%C2H%18%18%5EF%F49%809%07%DB%1F%A4%13%24%87%0E%98%81%3Ap%09%07%CE%10%89zD%00%13%C1%CA%11%02M%0Bc%1C%B6%9D%7C%9C%F3%15%E1%26v%07%D5%82%AA%13%24%87A%DE%E8%D6%8D4M%2B%20%A23%15%CEO%17%88%863%20%A9%B5gr%B0%A0i%FD%BD%D6%5E%92%C6%F9f%06%7CKD%EFp%CE%D7%B4%B7%0Df'H~%03%99%9F%97ge%8C%E5%00%18%ABq~%BC%0E%0Cd%40%2F%81(%25%86%CB%1B%CD%AD%18%19%C4%BA%C6%F9.%026%85%8F%03%F9%9As%BEvV%3Bz%B5w%82%E4(%97%D7%0B%0AD%00y%00%0A%00%E4r%CE3%00%24%13%913%92%F5%15v%B5U%5D%D7%9B%C2%C7%A2V%84%0F5%DC%C59o%8A%F7%C4%A9N%E9%94N%E9%94N%E9%94N%E9%94N%E9%94N%E9%94N%E9%94N%E9%94N%E9%94N%F9%1F%93%FF%07%0Dt%BEM%F98%60%FB%00%00%00%00IEND%AEB%60%82";

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
			if(sourceurl.match(/vimeo\.com\/\d{1,8}/) || sourceurl.match(/youtube.*watch.*v\=/) || sourceurl.match(/ustream\.tv\/recorded\/\d{1,8}/)){
				flvideoreplacer.setAttribute("style","background-image: url("+background+"); background-repeat:no-repeat; background-position: center; background-size: 100%; width:"+videowidth+"; height:"+videoheight+"; text-align:center; vertical-align:middle;");
			}else{
				flvideoreplacer.setAttribute("style"," width:"+videowidth+"; height:"+videoheight+"; text-align:center; vertical-align:middle;");
			}
			//append innerHTML code
			if(replacemethod === "embedded"){
				flvideoreplacer.innerHTML = "<table><tr><td width=\""+videowidth+"\" height=\""+videoheight+"\" align=\"center\" valign=\"middle\">" +
				"<br><img id=\"flvplaceholder\" style=\"opacity:0.5;\" src=\""+placeholderimg+"\" onmouseover=\"javascript:this.style.opacity='1';this.style.cursor='pointer'\" onmouseout=\"javascript:this.style.opacity='0.5';\" onclick=\"javascript:sendToFLV();\"/><div style=\"position:relative; top:0;\"><select id=\"methodselector\" style=\"opacity:0.5;\" onmouseover=\"javascript:this.style.opacity='1';\" onmouseout=\"javascript:this.style.opacity='0.5';\"><option id=\"embedded\" value=\"embedded\" selected=\"true\">"+embeddedstring+"</option><option id=\"newtab\" value=\"newtab\">"+newtabstring+"</option><option id=\"newwindow\" value=\"newwindow\">"+newwindowstring+"</option><option id=\"standalone\" value=\"standalone\">"+standalonestring+"</option></select></div></td></tr></table>";
			}
			if(replacemethod === "newtab"){
				flvideoreplacer.innerHTML = "<table><tr><td width=\""+videowidth+"\" height=\""+videoheight+"\" align=\"center\" valign=\"middle\">" +
				"<br><img id=\"flvplaceholder\" style=\"opacity:0.5;\" src=\""+placeholderimg+"\" onmouseover=\"javascript:this.style.opacity='1';this.style.cursor='pointer'\" onmouseout=\"javascript:this.style.opacity='0.5';\" onclick=\"javascript:sendToFLV();\"/><div style=\"position:relative; top:0;\"><select id=\"methodselector\" style=\"opacity:0.5;\" onmouseover=\"javascript:this.style.opacity='1';\" onmouseout=\"javascript:this.style.opacity='0.5';\"><option id=\"embedded\" value=\"embedded\">"+embeddedstring+"</option><option id=\"newtab\" value=\"newtab\" selected=\"true\">"+newtabstring+"</option><option id=\"newwindow\" value=\"newwindow\">"+newwindowstring+"</option><option id=\"standalone\" value=\"standalone\">"+standalonestring+"</option></select></div></td></tr></table>";
			}
			if(replacemethod === "newwindow"){
				flvideoreplacer.innerHTML = "<table><tr><td width=\""+videowidth+"\" height=\""+videoheight+"\" align=\"center\" valign=\"middle\">" +
				"<br><img id=\"flvplaceholder\" style=\"opacity:0.5;\" src=\""+placeholderimg+"\" onmouseover=\"javascript:this.style.opacity='1';this.style.cursor='pointer'\" onmouseout=\"javascript:this.style.opacity='0.5';\" onclick=\"javascript:sendToFLV();\"/><div style=\"position:relative; top:0;\"><select id=\"methodselector\" style=\"opacity:0.5;\" onmouseover=\"javascript:this.style.opacity='1';\" onmouseout=\"javascript:this.style.opacity='0.5';\"><option id=\"embedded\" value=\"embedded\">"+embeddedstring+"</option><option id=\"newtab\" value=\"newtab\">"+newtabstring+"</option><option id=\"newwindow\" value=\"newwindow\" selected=\"true\">"+newwindowstring+"</option><option id=\"standalone\" value=\"standalone\">"+standalonestring+"</option></select></div></td></tr></table>";
			}
			if(replacemethod === "standalone"){
				flvideoreplacer.innerHTML = "<table><tr><td width=\""+videowidth+"\" height=\""+videoheight+"\" align=\"center\" valign=\"middle\">" +
				"<br><img id=\"flvplaceholder\" style=\"opacity:0.5;\" src=\""+placeholderimg+"\" onmouseover=\"javascript:this.style.opacity='1';this.style.cursor='pointer'\" onmouseout=\"javascript:this.style.opacity='0.5';\" onclick=\"javascript:sendToFLV();\"/><div style=\"position:relative; top:0;\"><select id=\"methodselector\" style=\"opacity:0.5;\" onmouseover=\"javascript:this.style.opacity='1';\" onmouseout=\"javascript:this.style.opacity='0.5';\"><option id=\"embedded\" value=\"embedded\">"+embeddedstring+"</option><option id=\"newtab\" value=\"newtab\">"+newtabstring+"</option><option id=\"newwindow\" value=\"newwindow\">"+newwindowstring+"</option><option id=\"standalone\" value=\"standalone\" selected=\"true\">"+standalonestring+"</option></select></div></td></tr></table>";
			}
			//replace video object
			if(sourceurl.match(/vimeo\.com\/\d{1,8}/)){
				childdivs = videoplayer.getElementsByTagName("div");
				videodiv = childdivs[2];
				videodiv.parentNode.replaceChild(flvideoreplacer, videodiv);

			}else{
				videoplayer.parentNode.replaceChild(flvideoreplacer, videoplayer);
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
			var alertstips = this.prefs.getBoolPref("alertstips");
			var mimetype = this.prefs.getCharPref("mimetype");
			var autolaunchplayer = this.prefs.getBoolPref("autolaunchplayer");
			var autolaunchtab = this.prefs.getBoolPref("autolaunchtab");
			var autolaunchwindow = this.prefs.getBoolPref("autolaunchwindow");
			var fallback = this.prefs.getCharPref("fallback");
			var pluginflash = this.prefs.getBoolPref("pluginflash");
			var dta = this.prefs.getBoolPref("dta");
			var mpc = this.prefs.getBoolPref("mpc");
			var flashblock = this.prefs.getBoolPref("flashblock");

			//get localization
			var strbundle = document.getElementById("flvideoreplacerstrings");
			var original = strbundle.getString("original");
			var standard = strbundle.getString("standard");
			var message, messagetitle, prompts, alertsService;

			//declare variables
			var params, videoplayer, flvideoreplacer, childdivs, videodiv, whitelist;

			//**********************check third-party extensions************************************

			if(pluginflash === true){

				if (flashblock === true) {//flashblock

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

						if(alertstips === true){

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

					if(alertstips === true){

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

			if (mpc === true) {//mediaplayerconnectivity

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
					//flvideoreplacerURLBar.init();

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

				//get localization
				var strbundle = document.getElementById("flvideoreplacerstrings");
				var enabledstring = strbundle.getString("enabled");
				var notsupportedstring = strbundle.getString("notsupported");
				var disabledstring = strbundle.getString("disabled");

				if(enabled === true){
					this.prefs.setBoolPref("enabled", false);
					document.getElementById("flvideoreplacer-toolbar-button").setAttribute('class',"toolbarbutton-1 chromeclass-toolbar-additional toolbarinactive");
					document.getElementById("flvideoreplacer-toolbar-button").setAttribute('tooltiptext',disabledstring);
				}else{
					this.prefs.setBoolPref("enabled", true);
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

			//get localization
			var strbundle = document.getElementById("flvideoreplacerstrings");

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
			var downdta = this.prefs.getBoolPref("downdta");

			if(downdta === true){

				link = {
						"url" : sourceurl,
						"postData" : null,
						"referrer" : window.content.location.href,
						"dirSave" : dir,
						"mask" : aFile,
						"fileName" : aFile,
						"description" : aFile };

				if (window.DTA) {
					DTA.sendLinksToManager(window, true, [link]);
				} else {
					window.opener.DTA_AddingFunctions.sendToDown(true, [link]);
				}
			}else{

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