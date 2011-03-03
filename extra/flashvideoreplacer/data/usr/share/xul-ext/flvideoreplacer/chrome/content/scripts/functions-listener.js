var flvideoreplacerListener = {

    init: function() {
	var appcontent = document.getElementById("appcontent"); // browser
	if(appcontent) {
	    appcontent.addEventListener("DOMContentLoaded", flvideoreplacerListener.onPageLoad, true);
	}
    },

    onPageLoad: function(aEvent) {

	//declare document and element
	var doc = aEvent.originalTarget; // doc is document that triggered "onload" event

	//declare page url
	var sourceurl = doc.location.href;
	var replacevideo = false, videoelement, alertsinfo;

	if(sourceurl.match(/youtube.*watch.*v\=.*html5=True/)){

	    //access preferences interface
	    this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
		    .getService(Components.interfaces.nsIPrefService)
		    .getBranch("extensions.flvideoreplacer.");

	    //fetch prefs
	    var preferwebm = this.prefs.getBoolPref("preferwebm");
	    replacevideo = this.prefs.getBoolPref("youtube");
	    
	    if(preferwebm === false && replacevideo == true){
		var newlocation = sourceurl.replace(/\&html5=True/,"");
		doc.location.href = newlocation;
	    }
	}

	if((sourceurl.match(/youtube.*watch.*v\=/)  && !sourceurl.match("html5=True")) 
	      || sourceurl.match(/vimeo\.com\/\d{1,8}/)
	      || (sourceurl.match(/metacafe\.com\/watch\//) && !sourceurl.match(/http.*http:\/\/www.metacafe\.com/))
	      || sourceurl.match(/youporn\.com\/watch\//)
	      || sourceurl.match(/pornhub\.com\/view_video.php\?viewkey=/)
	      || sourceurl.match(/redtube\.com\/\d{1,8}/)
	      ){

	    //access preferences interface
	    this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
		    .getService(Components.interfaces.nsIPrefService)
		    .getBranch("extensions.flvideoreplacer.");

	    //fetch prefs
	    var replacemethod = this.prefs.getCharPref("method");
	    var preferwebm = this.prefs.getBoolPref("preferwebm");

	    //declare if video should be replaced
	    if(sourceurl.match(/youtube.*watch.*v\=/)){
		replacevideo = this.prefs.getBoolPref("youtube");
		videoelement = "movie_player";
	    }
	    if(sourceurl.match(/vimeo\.com\/\d{1,8}/)){
		replacevideo = this.prefs.getBoolPref("vimeo");
		videoelement = "meat";
	    }
	    if(sourceurl.match(/metacafe\.com\/watch\//)){
		replacevideo = this.prefs.getBoolPref("metacafe");
		videoelement = "FlashWrap";
	    }
	    if(sourceurl.match(/youporn\.com\/watch\//)){
		replacevideo = this.prefs.getBoolPref("other");
		videoelement = "player";
	    }
	    if(sourceurl.match(/pornhub\.com\/view_video.php\?viewkey=/)){
		replacevideo = this.prefs.getBoolPref("other");
		videoelement = "VideoPlayer";
	    }
	    if(sourceurl.match(/redtube\.com\/\d{1,8}/)){
		replacevideo = this.prefs.getBoolPref("other");
		videoelement = "redtube_flv_player";
	    }

	    //declare element to be replaced
	    testelement = doc.getElementById(videoelement);

	    if (testelement !== null) {

		if(replacevideo === true){

		    if(replacemethod === "prompt"){

			if(sourceurl.match(/youtube.*watch.*v\=/)){
			    params = {inn:{pmethod:"embedded"}, out:null};
			    window.openDialog("chrome://flvideoreplacer/content/prompt.xul", "",
			    "chrome, dialog, modal, resizable=yes", params).focus();
			    if (params.out) {
				this.prefs.setCharPref("promptmethod",params.out.pmethod);
			    }else{
				replacevideo = false;
			    }
			}else{
			    params = {inn:{pmethod:"embedded"}, out:null};
			    window.openDialog("chrome://flvideoreplacer/content/prompt.xul", "",
			    "chrome, dialog, modal, resizable=yes", params).focus();
			    if (params.out) {
				this.prefs.setCharPref("promptmethod",params.out.pmethod);
			    }else{
				replacevideo = false;
			    }
			}
		    }else{
			this.prefs.setCharPref("promptmethod",replacemethod);
		    }

		    //update replace method
		    replacemethod = this.prefs.getCharPref("promptmethod");
		}

		if(replacevideo === true){

		    if(sourceurl.match(/youtube.*watch.*v\=/)){

			//fetch video ID from url
			var videoid = sourceurl.replace(/.*v\=/, "").replace(/\&.*/,"");

			if(preferwebm === true && replacemethod === "embedded"){

			    //redirect to webm page
			    var webmurl = "http://www.youtube.com/watch?v="+videoid+"&html5=True";
			    try{
				var webmRequest = new XMLHttpRequest();
				webmRequest.open('GET', webmurl, false);
				webmRequest.onreadystatechange=function(){
				    if (webmRequest.readyState === 4 && webmRequest.status === 200) {
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
					    flvideoreplacerListener.webmReplacer(aEvent);
					}else{
					    flvideoreplacerListener.pluginReplacer(aEvent);
					}
				    }
				};
				webmRequest.send(null);
			    }catch(e){
				flvideoreplacerListener.pluginReplacer(aEvent);
			    }
			}else{
			    flvideoreplacerListener.pluginReplacer(aEvent);
			}
		    }
		    if(sourceurl.match(/vimeo\.com\/\d{1,8}/) 
			|| sourceurl.match(/metacafe\.com\/watch\//) 
			|| sourceurl.match(/youporn\.com\/watch\//)
			|| sourceurl.match(/pornhub\.com\/view_video.php\?viewkey=/)
			|| sourceurl.match(/redtube\.com\/\d{1,8}/)
		    ){
			flvideoreplacerListener.pluginReplacer(aEvent);
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
			alertsinfo = this.prefs.getBoolPref("alertsinfo");

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
    },

    pluginReplacer: function(aEvent) {

	//get osString
	var osString = Components.classes["@mozilla.org/network/protocol;1?name=http"]
		.getService(Components.interfaces.nsIHttpProtocolHandler).oscpu; 

	//access preferences interface
	this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefService)
		.getBranch("extensions.flvideoreplacer.");

	//fetch common preferences
	var replacemethod = this.prefs.getCharPref("promptmethod");
	var mimetype = this.prefs.getCharPref("mimetype");
	var autoplay = this.prefs.getBoolPref("autoplay");
	var prefermp4 = this.prefs.getBoolPref("prefermp4");
	var videoquality = this.prefs.getCharPref("videoquality");
	var alertsinfo = this.prefs.getBoolPref("alertsinfo");
	var alertserror = this.prefs.getBoolPref("alertserror");
	var newmimetype = mimetype;
	//get localization
	var strbundle = document.getElementById("flvideoreplacerstrings");
	var original = strbundle.getString("original");
	var standard = strbundle.getString("standard");
	var message, messagetitle, alertsService;

	//declare document and element
	var doc = aEvent.originalTarget; // doc is document that triggered "onload" event
	//declare page url
	var sourceurl = doc.location.href;
	//declare the video should not be replaced
	var replacevideo = false;
	var fmt, req, xmlsource, videourl, videoid, key, videoelement, videowidth, videoheight, testelement, matchpattern, pagecontent, newline, aSite, aString, downloader,filemime;

	if(sourceurl.match(/youtube.*watch.*v\=/)){

	    //declare element to be replaced
	    testelement = doc.getElementById('movie_player');
	    videoid = sourceurl.replace(/.*v\=/, "").replace(/\&.*/,"");

	    if (testelement !== null) {

		if(replacemethod === "standalone"){

		    //get xml document content
		    req = new XMLHttpRequest();  
		    req.open('GET', "http://www.youtube-nocookie.com/watch?v="+videoid, false);   
		    req.send(null);  
		    if(req.status === 200) {//match if data has been downloaded

			//fetch page html content
			pagecontent = req.responseText;
		    }

		}else{
		    //fetch page html content
		    pagecontent = doc.getElementsByTagName("body").item(0).innerHTML;
		}
		newline = pagecontent.split("\n");

		for(var i=0; i< newline.length; i++){

		    //match patterns
		    matchpattern = /var swfConfig/.test(newline[i]);

		    if (matchpattern === true) {

			//declare video uality based on user settings and video availability
			fmt = "18";

			if (videoquality === "LOW"){

			    if (newline[i].match(/\,5\|http\:/) || newline[i].match(/\"5\|http\:/)) {
				fmt = "5";
				videourl = newline[i].replace(/.*"fmt_url_map":/,"").replace(/.*5\|/g,"").replace(/\|.*/g,"").replace(/",.*/g,"").replace(/,.*/g,"").replace(/\\/g,"");
				replacevideo = true;
				if(mimetype === "autodetect"){
				    newmimetype = "application/x-flv";
				}
				//access preferences interface
				this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
					.getService(Components.interfaces.nsIPrefService)
					.getBranch("extensions.flvideoreplacer.downloadersource.");
				//store download path
				this.prefs.setCharPref(videoid+"."+fmt,videourl);
			    }
			    if (newline[i].match(/\,18\|http\:/) || newline[i].match(/\"18\|http\:/)) {
				fmt = "18";
				videourl = newline[i].replace(/.*"fmt_url_map":/,"").replace(/.*18\|/g,"").replace(/\|.*/g,"").replace(/",.*/g,"").replace(/,.*/g,"").replace(/\\/g,"");
				replacevideo = true;
				if(mimetype === "autodetect"){
				    newmimetype = "video/mp4";
				}
				//access preferences interface
				this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
					.getService(Components.interfaces.nsIPrefService)
					.getBranch("extensions.flvideoreplacer.downloadersource.");
				//store download path
				this.prefs.setCharPref(videoid+"."+fmt,videourl);
			    }
			    if (newline[i].match(/\,34\|http\:/) || newline[i].match(/\"34\|http\:/)) {
				fmt = "34";
				videourl = newline[i].replace(/.*"fmt_url_map":/,"").replace(/.*34\|/g,"").replace(/\|.*/g,"").replace(/",.*/g,"").replace(/,.*/g,"").replace(/\\/g,"");
				replacevideo = true;
				if(mimetype === "autodetect"){
				    newmimetype = "application/x-flv";
				}
				//access preferences interface
				this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
					.getService(Components.interfaces.nsIPrefService)
					.getBranch("extensions.flvideoreplacer.downloadersource.");
				//store download path
				this.prefs.setCharPref(videoid+"."+fmt,videourl);
			    }
			    if (newline[i].match(/\,35\|http\:/) || newline[i].match(/\"35\|http\:/)) {
				fmt = "35";
				videourl = newline[i].replace(/.*"fmt_url_map":/,"").replace(/.*35\|/g,"").replace(/\|.*/g,"").replace(/",.*/g,"").replace(/,.*/g,"").replace(/\\/g,"");
				replacevideo = true;
				if(mimetype === "autodetect"){
				    newmimetype = "application/x-flv";
				}
				//access preferences interface
				this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
					.getService(Components.interfaces.nsIPrefService)
					.getBranch("extensions.flvideoreplacer.downloadersource.");
				//store download path
				this.prefs.setCharPref(videoid+"."+fmt,videourl);
			    }
			    if(prefermp4 === true){
				if (newline[i].match(/\,18\|http\:/) || newline[i].match(/\"18\|http\:/)) {
				    fmt = "18";
				    videourl = newline[i].replace(/.*"fmt_url_map":/,"").replace(/.*18\|/g,"").replace(/\|.*/g,"").replace(/",.*/g,"").replace(/,.*/g,"").replace(/\\/g,"");
				    replacevideo = true;
				    if(mimetype === "autodetect"){
					newmimetype = "video/mp4";
				    }
				    //access preferences interface
				    this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
					    .getService(Components.interfaces.nsIPrefService)
					    .getBranch("extensions.flvideoreplacer.downloadersource.");
				    //store download path
				    this.prefs.setCharPref(videoid+"."+fmt,videourl);
				}
			    }
			}

			if (videoquality === "MEDIUM"){

			    if (newline[i].match(/\,5\|http\:/) || newline[i].match(/\"5\|http\:/)) {
				fmt = "5";
				videourl = newline[i].replace(/.*"fmt_url_map":/,"").replace(/.*5\|/g,"").replace(/\|.*/g,"").replace(/",.*/g,"").replace(/,.*/g,"").replace(/\\/g,"");
				replacevideo = true;
				if(mimetype === "autodetect"){
				    newmimetype = "application/x-flv";
				}
				//access preferences interface
				this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
					.getService(Components.interfaces.nsIPrefService)
					.getBranch("extensions.flvideoreplacer.downloadersource.");
				//store download path
				this.prefs.setCharPref(videoid+"."+fmt,videourl);
			    }
			    if (newline[i].match(/\,18\|http\:/) || newline[i].match(/\"18\|http\:/)) {
				fmt = "18";
				videourl = newline[i].replace(/.*"fmt_url_map":/,"").replace(/.*18\|/g,"").replace(/\|.*/g,"").replace(/",.*/g,"").replace(/,.*/g,"").replace(/\\/g,"");
				replacevideo = true;
				if(mimetype === "autodetect"){
				    newmimetype = "video/mp4";
				}
				//access preferences interface
				this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
					.getService(Components.interfaces.nsIPrefService)
					.getBranch("extensions.flvideoreplacer.downloadersource.");
				//store download path
				this.prefs.setCharPref(videoid+"."+fmt,videourl);
			    }
			    if (newline[i].match(/\,34\|http\:/) || newline[i].match(/\"34\|http\:/)) {
				fmt = "34";
				videourl = newline[i].replace(/.*"fmt_url_map":/,"").replace(/.*34\|/g,"").replace(/\|.*/g,"").replace(/",.*/g,"").replace(/,.*/g,"").replace(/\\/g,"");
				replacevideo = true;
				if(mimetype === "autodetect"){
				    newmimetype = "application/x-flv";
				}
				//access preferences interface
				this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
					.getService(Components.interfaces.nsIPrefService)
					.getBranch("extensions.flvideoreplacer.downloadersource.");
				//store download path
				this.prefs.setCharPref(videoid+"."+fmt,videourl);
			    }
			    if (newline[i].match(/\,35\|http\:/) || newline[i].match(/\"35\|http\:/)) {
				fmt = "35";
				videourl = newline[i].replace(/.*"fmt_url_map":/,"").replace(/.*35\|/g,"").replace(/\|.*/g,"").replace(/",.*/g,"").replace(/,.*/g,"").replace(/\\/g,"");
				replacevideo = true;
				if(mimetype === "autodetect"){
				    newmimetype = "application/x-flv";
				}
				//access preferences interface
				this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
					.getService(Components.interfaces.nsIPrefService)
					.getBranch("extensions.flvideoreplacer.downloadersource.");
				//store download path
				this.prefs.setCharPref(videoid+"."+fmt,videourl);
			    }
			    if(prefermp4 === true){
				if (newline[i].match(/\,18\|http\:/) || newline[i].match(/\"18\|http\:/)) {
				    fmt = "18";
				    videourl = newline[i].replace(/.*"fmt_url_map":/,"").replace(/.*18\|/g,"").replace(/\|.*/g,"").replace(/",.*/g,"").replace(/,.*/g,"").replace(/\\/g,"");
				    replacevideo = true;
				    if(mimetype === "autodetect"){
					newmimetype = "video/mp4";
				    }
				}
				//access preferences interface
				this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
					.getService(Components.interfaces.nsIPrefService)
					.getBranch("extensions.flvideoreplacer.downloadersource.");
				//store download path
				this.prefs.setCharPref(videoid+"."+fmt,videourl);
			    }
			    if (newline[i].match(/\,22\|http\:/) || newline[i].match(/\"22\|http\:/)) {
				fmt = "22";
				videourl = newline[i].replace(/.*"fmt_url_map":/,"").replace(/.*22\|/g,"").replace(/\|.*/g,"").replace(/",.*/g,"").replace(/,.*/g,"").replace(/\\/g,"");
				replacevideo = true;
				if(mimetype === "autodetect"){
				    newmimetype = "video/mp4";
				}
				//access preferences interface
				this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
					.getService(Components.interfaces.nsIPrefService)
					.getBranch("extensions.flvideoreplacer.downloadersource.");
				//store download path
				this.prefs.setCharPref(videoid+"."+fmt,videourl);
			    }
			}

			if (videoquality === "HIGH"){

			    if (newline[i].match(/\,5\|http\:/) || newline[i].match(/\"5\|http\:/)) {
				fmt = "5";
				videourl = newline[i].replace(/.*"fmt_url_map":/,"").replace(/.*5\|/g,"").replace(/\|.*/g,"").replace(/",.*/g,"").replace(/,.*/g,"").replace(/\\/g,"");
				replacevideo = true;
				if(mimetype === "autodetect"){
				    newmimetype = "application/x-flv";
				}
				//access preferences interface
				this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
					.getService(Components.interfaces.nsIPrefService)
					.getBranch("extensions.flvideoreplacer.downloadersource.");
				//store download path
				this.prefs.setCharPref(videoid+"."+fmt,videourl);
			    }
			    if (newline[i].match(/\,18\|http\:/) || newline[i].match(/\"18\|http\:/)) {
				fmt = "18";
				videourl = newline[i].replace(/.*"fmt_url_map":/,"").replace(/.*18\|/g,"").replace(/\|.*/g,"").replace(/",.*/g,"").replace(/,.*/g,"").replace(/\\/g,"");
				replacevideo = true;
				if(mimetype === "autodetect"){
				    newmimetype = "video/mp4";
				}
				//access preferences interface
				this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
					.getService(Components.interfaces.nsIPrefService)
					.getBranch("extensions.flvideoreplacer.downloadersource.");
				//store download path
				this.prefs.setCharPref(videoid+"."+fmt,videourl);
			    }
			    if (newline[i].match(/\,34\|http\:/) || newline[i].match(/\"34\|http\:/)) {
				fmt = "34";
				videourl = newline[i].replace(/.*"fmt_url_map":/,"").replace(/.*34\|/g,"").replace(/\|.*/g,"").replace(/",.*/g,"").replace(/,.*/g,"").replace(/\\/g,"");
				replacevideo = true;
				if(mimetype === "autodetect"){
				    newmimetype = "application/x-flv";
				}
				//access preferences interface
				this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
					.getService(Components.interfaces.nsIPrefService)
					.getBranch("extensions.flvideoreplacer.downloadersource.");
				//store download path
				this.prefs.setCharPref(videoid+"."+fmt,videourl);
			    }
			    if (newline[i].match(/\,35\|http\:/) || newline[i].match(/\"35\|http\:/)) {
				fmt = "35";
				videourl = newline[i].replace(/.*"fmt_url_map":/,"").replace(/.*35\|/g,"").replace(/\|.*/g,"").replace(/",.*/g,"").replace(/,.*/g,"").replace(/\\/g,"");
				replacevideo = true;
				if(mimetype === "autodetect"){
				    newmimetype = "application/x-flv";
				}
				//access preferences interface
				this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
					.getService(Components.interfaces.nsIPrefService)
					.getBranch("extensions.flvideoreplacer.downloadersource.");
				//store download path
				this.prefs.setCharPref(videoid+"."+fmt,videourl);
			    }
			    if(prefermp4 === true){
				if (newline[i].match(/\,18\|http\:/) || newline[i].match(/\"18\|http\:/)) {
				    fmt = "18";
				    videourl = newline[i].replace(/.*"fmt_url_map":/,"").replace(/.*18\|/g,"").replace(/\|.*/g,"").replace(/",.*/g,"").replace(/,.*/g,"").replace(/\\/g,"");
				    replacevideo = true;
				    if(mimetype === "autodetect"){
					newmimetype = "video/mp4";
				    }
				}
				//access preferences interface
				this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
					.getService(Components.interfaces.nsIPrefService)
					.getBranch("extensions.flvideoreplacer.downloadersource.");
				//store download path
				this.prefs.setCharPref(videoid+"."+fmt,videourl);
			    }
			    if (newline[i].match(/\,22\|http\:/) || newline[i].match(/\"22\|http\:/)) {
				fmt = "22";
				videourl = newline[i].replace(/.*"fmt_url_map":/,"").replace(/.*22\|/g,"").replace(/\|.*/g,"").replace(/",.*/g,"").replace(/,.*/g,"").replace(/\\/g,"");
				replacevideo = true;
				if(mimetype === "autodetect"){
				    newmimetype = "video/mp4";
				}
				//access preferences interface
				this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
					.getService(Components.interfaces.nsIPrefService)
					.getBranch("extensions.flvideoreplacer.downloadersource.");
				//store download path
				this.prefs.setCharPref(videoid+"."+fmt,videourl);
			    }
			    if (newline[i].match(/\,37\|http\:/) || newline[i].match(/\"37\|http\:/)) {
				fmt = "37";
				videourl = newline[i].replace(/.*"fmt_url_map":/,"").replace(/.*37\|/g,"").replace(/\|.*/g,"").replace(/",.*/g,"").replace(/,.*/g,"").replace(/\\/g,"");
				replacevideo = true;
				if(mimetype === "autodetect"){
				    newmimetype = "video/mp4";
				}
				//access preferences interface
				this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
					.getService(Components.interfaces.nsIPrefService)
					.getBranch("extensions.flvideoreplacer.downloadersource.");
				//store download path
				this.prefs.setCharPref(videoid+"."+fmt,videourl);
			    }
			    if (newline[i].match(/\,38\|http\:/) || newline[i].match(/\"38\|http\:/)) {
				fmt = "38";
				videourl = newline[i].replace(/.*"fmt_url_map":/,"").replace(/.*38\|/g,"").replace(/\|.*/g,"").replace(/",.*/g,"").replace(/,.*/g,"").replace(/\\/g,"");
				replacevideo = true;
				if(mimetype === "autodetect"){
				    newmimetype = "video/mp4";
				}
				//access preferences interface
				this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
					.getService(Components.interfaces.nsIPrefService)
					.getBranch("extensions.flvideoreplacer.downloadersource.");
				//store download path
				this.prefs.setCharPref(videoid+"."+fmt,videourl);
			    }
			}

			if (replacevideo === true){

			    //declare player params
			    videowidth = "100%";
			    videoheight = "100%";
			    videoelement = "movie_player";
			    //declare strings to be used by extension incompatibility check
			    aSite = "YouTube";
			    aString = "youtube";
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
			}
		    }
		}
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
		req.open('GET', xmlsource, false);   
		req.send(null);  
		if(req.status === 200) {//match if data has been downloaded and execute function

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

			//declare player params
			videowidth = "640";
			videoheight = "384";
			videourl = "http://vimeo.com/moogaloop/play/clip:"+videoid+"/"+request_signature+"/"+request_signature_expires+"/?q=sd";
			videoelement = "meat";
			//declare the video should be replaced
			replacevideo = true;
			//declare strings to be used by extension incompatibility check
			aSite = "Vimeo";
			aString = "vimeo";
			fmt = "97";
			//declare auto selected mime type
			if(mimetype === "autodetect"){
			    newmimetype = "video/mp4";
			}
			//declare file mime
			if(mimetype === "autodetect"){
			    this.prefs.setCharPref("filemime",newmimetype);
			    filemime = newmimetype;
			}else{
			    this.prefs.setCharPref("filemime",mimetype);
			    filemime = mimetype;
			}
			//access preferences interface
			this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
				.getService(Components.interfaces.nsIPrefService)
				.getBranch("extensions.flvideoreplacer.downloadersource.");
			//store download path
			this.prefs.setCharPref(videoid,videourl);
		    }
		}
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
		    var matchpattern = /flashVars.*mediaURL\=.*gdaKey\=/.test(newline[i]);
		    var matchpattern2 = /flashVars.*mediaURL.*/.test(newline[i]);

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

		    //declare player params
		    videowidth = "615";
		    videoheight = "400";
		    videoelement = "FlashWrap";
		    //declare strings to be used by extension incompatibility check
		    aSite = "Metacafe";
		    aString = "metacafe";
		    fmt = "97";
		    //declare auto selected mime type
		    if(mimetype === "autodetect"){
			newmimetype = "video/mp4";
		    }
		    //declare file mime
		    if(mimetype === "autodetect"){
			this.prefs.setCharPref("filemime",newmimetype);
			filemime = newmimetype;
		    }else{
			this.prefs.setCharPref("filemime",mimetype);
			filemime = mimetype;
		    }
		    //access preferences interface
		    this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			    .getService(Components.interfaces.nsIPrefService)
			    .getBranch("extensions.flvideoreplacer.downloadersource.");
		    //store download path
		    this.prefs.setCharPref(videoid,videourl);
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
		    req.open('GET', xmlsource, false);   
		    req.send(null);  
		    if(req.status === 200) {//match if data has been downloaded and execute function

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

			    //declare player params
			    videowidth = "600";
			    videoheight = "470";
			    videoelement = "player";
			    //declare strings to be used by extension incompatibility check
			    aSite = "YouPorn";
			    aString = "youporn";
			    fmt = "97";
			    //declare auto selected mime type
			    if(mimetype === "autodetect"){
				newmimetype = "application/x-flv";
			    }
			    //declare file mime
			    if(mimetype === "autodetect"){
				this.prefs.setCharPref("filemime",newmimetype);
				filemime = newmimetype;
			    }else{
				this.prefs.setCharPref("filemime",mimetype);
				filemime = mimetype;
			    }
			    //access preferences interface
			    this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
				    .getService(Components.interfaces.nsIPrefService)
				    .getBranch("extensions.flvideoreplacer.downloadersource.");
			    //store download path
			    this.prefs.setCharPref(videoid,videourl);
			}
		    }
		}
	    }
	}
	if(sourceurl.match(/pornhub\.com\/view_video.php\?viewkey=/)){

	    //fetch video ID from url
	    videoid = sourceurl.replace(/.*viewkey=/g, "");
	    //declare element to be replaced
	    videoelement = "VideoPlayer";
	    testelement = doc.getElementById(videoelement);

	    if (testelement !== null) {

		//fetch page html content
		pagecontent = doc.getElementsByTagName("body").item(0).innerHTML;
		newline = pagecontent.split("\n");

		for(var i=0; i< newline.length; i++){

		    //match patterns
		    matchpattern = /addVariable\("video_url"/.test(newline[i]);

		    if (matchpattern === true) {
			videourl = newline[i].replace(/.*addVariable\("video_url","/,"").replace(/".*/,"");
			replacevideo = true;
		    }
		}

		if(replacevideo === true){

		    //declare player params
		    videowidth = "610";
		    videoheight = "480";
		    videoelement = "VideoPlayer";
		    //declare strings to be used by extension incompatibility check
		    aSite = "PornHub";
		    aString = "pornhub";
		    fmt = "97";
		    //declare auto selected mime type
		    if(mimetype === "autodetect"){
			newmimetype = "application/x-flv";
		    }
		    //declare file mime
		    if(mimetype === "autodetect"){
			this.prefs.setCharPref("filemime",newmimetype);
			filemime = newmimetype;
		    }else{
			this.prefs.setCharPref("filemime",mimetype);
			filemime = mimetype;
		    }
		    //access preferences interface
		    this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			    .getService(Components.interfaces.nsIPrefService)
			    .getBranch("extensions.flvideoreplacer.downloadersource.");
		    //store download path
		    this.prefs.setCharPref(videoid,videourl);
		}
	    }
	}
	if(sourceurl.match(/redtube\.com\/\d{1,8}/)){

	    //fetch video ID from url
	    videoid = sourceurl.replace(/.*redtube\.com\//g, "");
	    //declare element to be replaced
	    videoelement = "redtube_flv_player";
	    testelement = doc.getElementById(videoelement);

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

		    //declare player params
		    videowidth = "584";
		    videoheight = "468";
		    videoelement = "redtube_flv_player";
		    //declare strings to be used by extension incompatibility check
		    aSite = "RedTube";
		    aString = "redtube";
		    fmt = "97";
		    //declare auto selected mime type
		    if(mimetype === "autodetect"){
			newmimetype = "application/x-flv";
		    }
		    //declare file mime
		    if(mimetype === "autodetect"){
			this.prefs.setCharPref("filemime",newmimetype);
			filemime = newmimetype;
		    }else{
			this.prefs.setCharPref("filemime",mimetype);
			filemime = mimetype;
		    }
		    //access preferences interface
		    this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			    .getService(Components.interfaces.nsIPrefService)
			    .getBranch("extensions.flvideoreplacer.downloadersource.");
		    //store download path
		    this.prefs.setCharPref(videoid,videourl);
		}
	    }
	}

	//**********************check incompatible extensions************************************

	//access preferences interface
	this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefService)
		.getBranch("extensions.");

	var enableditems;

	if(replacevideo === true){
	    //check enabled extensions
	    try{
		enableditems = this.prefs.getCharPref("enabledAddons");
	    }catch(e){
		enableditems = this.prefs.getCharPref("enabledItems");
	    }finally{

		var whitelist;

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

		    if(!whitelist.match(aString)){

			//don't try to replace
			replacevideo = false;

			if(alertserror === true){

			    //get text from strbundle
			    message = strbundle.getFormattedString("flashblock", [ aSite ]);
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

		    if(!whitelist.match(aString)){

			//don't try to replace
			replacevideo = false;

			if(alertserror === true){

			    //get text from strbundle
			    message = strbundle.getFormattedString("mpc", [ aSite ]);
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
	    }
	}

	if(replacevideo === true){

	    //declare variables
	    var params, videoplayer,flvideoreplacer,childdivs,videodiv;

	    //access preferences interface
	    this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
		    .getService(Components.interfaces.nsIPrefService)
		    .getBranch("extensions.flvideoreplacer.");

	    if(replacemethod === "embedded"){

		//get plugin compatibility
		var pluginvmp4 = this.prefs.getBoolPref("pluginvmp4");
		var pluginxflv = this.prefs.getBoolPref("pluginxflv");
		var pluginaqt = this.prefs.getBoolPref("pluginaqt");
		var pluginawmp = this.prefs.getBoolPref("pluginawmp");

		if(newmimetype === "application/x-flv"){

		    //declare element to be replaced
		    videoplayer = doc.getElementById(videoelement);

		    if(pluginxflv === true){

			//create the object element
			flvideoreplacer = doc.createElement('object');
			flvideoreplacer.setAttribute("width", videowidth);
			flvideoreplacer.setAttribute("height", videoheight);
			flvideoreplacer.setAttribute("type", "application/x-flv");
			//append innerHTML code
			flvideoreplacer.innerHTML = "<param name=\"src\" value=\""+videourl+"\"></param><param name=\"autoplay\" value=\""+autoplay+"\"><param name=\"controller\" value=\"true\"><param name=\"loop\" value=\"false\"><param name=\"scale\" value=\"aspect\"><embed src=\""+videourl+"\" width=\""+videowidth+"\" height=\""+videoheight+"\" scale=\"aspect\" type=\"application/x-flv\" autoplay=\""+autoplay+"\" controller=\"true\" loop=\"false\" </embed>";
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

		    //declare element to be replaced
		    videoplayer = doc.getElementById(videoelement);

		    if(pluginvmp4 === true){

			//create the object element
			flvideoreplacer = doc.createElement('object');
			flvideoreplacer.setAttribute("width", videowidth);
			flvideoreplacer.setAttribute("height", videoheight);
			flvideoreplacer.setAttribute("classid", "clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B");
			flvideoreplacer.setAttribute("codebase", "http://www.apple.com/qtactivex/qtplugin.cab");
			flvideoreplacer.setAttribute("type", "video/mp4");
			//append innerHTML code
			flvideoreplacer.innerHTML = "<param name=\"src\" value=\""+videourl+"\"></param><param name=\"autoplay\" value=\""+autoplay+"\"><param name=\"controller\" value=\"true\"><param name=\"loop\" value=\"false\"><param name=\"scale\" value=\"aspect\"> <embed src=\""+videourl+"\" width=\""+videowidth+"\" height=\""+videoheight+"\" scale=\"aspect\" type=\"video/mp4\" autoplay=\""+autoplay+"\" controller=\"true\" loop=\"false\" </embed>";

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

		    //declare element to be replaced
		    videoplayer = doc.getElementById(videoelement);

		    if(pluginaqt === true){
			//create the object element
			flvideoreplacer = doc.createElement('object');
			flvideoreplacer.setAttribute("width", videowidth);
			flvideoreplacer.setAttribute("height", videoheight);
			flvideoreplacer.setAttribute("classid", "clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B");
			flvideoreplacer.setAttribute("codebase", "http://www.apple.com/qtactivex/qtplugin.cab");
			flvideoreplacer.setAttribute("type", "video/quicktime");
			//append innerHTML code
			flvideoreplacer.innerHTML = "<param name=\"src\" value=\""+videourl+"\"></param><param name=\"autoplay\" value=\""+autoplay+"\"><param name=\"controller\" value=\"true\"><param name=\"loop\" value=\"false\"><param name=\"scale\" value=\"aspect\"><embed src=\""+videourl+"\" width=\""+videowidth+"\" height=\""+videoheight+"\" scale=\"aspect\" type=\"video/quicktime\" autoplay=\""+autoplay+"\" controller=\"true\" loop=\"false\" </embed>";
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

		    //declare element to be replaced
		    videoplayer = doc.getElementById(videoelement);

		    if(pluginawmp === true){

			//create the object element
			flvideoreplacer = doc.createElement('object');
			flvideoreplacer.setAttribute("width", videowidth);
			flvideoreplacer.setAttribute("height", videoheight);
			flvideoreplacer.setAttribute("classid", "clsid:6BF52A52-394A-11D3-B153-00C04F79FAA6");
			flvideoreplacer.setAttribute("codebase", "http://activex.microsoft.com/activex/controls/mplayer/en/nsmp2inf.cab#Version=6,4,7,1112");
			flvideoreplacer.setAttribute("standby", "Loading Microsoft Windows Media Player components...");
			flvideoreplacer.setAttribute("type", "application/x-oleobject");
			//append innerHTML code
			flvideoreplacer.innerHTML = "<param name=\"fileName\" value=\""+videourl+"\"></param><param name=\"autoStart\" value=\""+autoplay+"\"><param name=\"showControls\" value=\"true\"><param name=\"loop\" value=\"false\"><embed type=\"application/x-mplayer2\" autostart=\""+autoplay+"\" showcontrols=\"true\" loop=\"false\" src=\""+videourl+"\" width=\""+videowidth+"\" height=\""+videoheight+"\" </embed>";
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

			var fmt = "99";
/*
			//create the object element
			flvideoreplacer = doc.createElement('object');
			flvideoreplacer.setAttribute("width", videowidth);
			flvideoreplacer.setAttribute("height", videoheight);
			flvideoreplacer.setAttribute("type", "application/x-shockwave-flash");
			flvideoreplacer.setAttribute("data", "http://www.webgapps.org/flowplayer/flowplayer-3.2.5.swf");
			//append innerHTML code
			flvideoreplacer.innerHTML = "<param name=\"movie\" value=\"http://www.webgapps.org/flowplayer/flowplayer-3.2.5.swf\"></param><param name=\"allowfullscreen\" value=\"true\"></param><param name=\"flashvars\" value='config={\"playlist\":[\"http://www.webgapps.org/flowplayer/flashvideoreplacer.png\", {\"url\": \""+videourl+"\",\"autoPlay\":"+autoplay+",\"autoBuffering\":true}]}'></param><img src=\"http://www.webgapps.org/flowplayer/flashvideoreplacer.png\" width=\""+videowidth+"\" height=\""+videowidth+"\" alt=\"FlashVideoReplacer\" title=\"No video playback capabilities.\" />";
*/
		    }
		}
	    }

	    if(replacemethod === "newtab"){

		//declare element to be replaced
		videoplayer = doc.getElementById(videoelement);

		if(sourceurl.match(/vimeo\.com\/\d{1,8}/)){
		    childdivs = videoplayer.getElementsByTagName("div");
		    videodiv = childdivs[2];
		    //replace video
		    videodiv.parentNode.removeChild(videodiv);

		}else{
		    //replace video
		    videoplayer.parentNode.removeChild(videoplayer);
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

		//declare element to be replaced
		videoplayer = doc.getElementById(videoelement);

		if(sourceurl.match(/vimeo\.com\/\d{1,8}/)){
		    childdivs = videoplayer.getElementsByTagName("div");
		    videodiv = childdivs[2];
		    //replace video
		    videodiv.parentNode.removeChild(videodiv);

		}else{
		    //replace video
		    videoplayer.parentNode.removeChild(videoplayer);
		}

		//set videourl pref
		this.prefs.setCharPref("videourl",videourl);
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

		//declare element to be replaced
		videoplayer = doc.getElementById(videoelement);

		if(sourceurl.match(/vimeo\.com\/\d{1,8}/)){
		    childdivs = videoplayer.getElementsByTagName("div");
		    videodiv = childdivs[2];
		    //replace video
		    videodiv.parentNode.removeChild(videodiv);

		    //load url bar change listener for getting url redirection 
		    flvideoreplacerURLBar.init();

		    var newTab = gBrowser.addTab(videourl);
		    newTab.label = "FlashVideoReplacer";
		    newTab.id = "FlashVideoReplacerVimeo"; 
		    gBrowser.selectedTab = newTab;

		}else{
		    //replace video
		    videoplayer.parentNode.removeChild(videoplayer);

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
	}
    },

    webmReplacer: function(aEvent) {

	//get osString
	var osString = Components.classes["@mozilla.org/network/protocol;1?name=http"]
		.getService(Components.interfaces.nsIHttpProtocolHandler).oscpu; 

	//access preferences interface
	this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefService)
		.getBranch("extensions.flvideoreplacer.");

	//get alerts prefs
	var alertsinfo = this.prefs.getBoolPref("alertsinfo");

	//declare document and element
	var doc = aEvent.originalTarget; // doc is document that triggered "onload" event
	//declare page url
	var sourceurl = doc.location.href;

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

    vidDownloader: function (aSite,aFile,aID,aFMT) {

	var filepath,file,sourceurl;

	//get osString
	var osString = Components.classes["@mozilla.org/network/protocol;1?name=http"]
		.getService(Components.interfaces.nsIHttpProtocolHandler).oscpu;

	//access preferences interface
	this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefService)
		.getBranch("extensions.flvideoreplacer.downloadersource.");

	//get video path from prefs
	if(aFMT === "0"){
	    sourceurl = this.prefs.getCharPref(aID);
	}else{
	    sourceurl = this.prefs.getCharPref(aID+"."+aFMT);
	}

	//access preferences interface
	this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefService)
		.getBranch("extensions.flvideoreplacer.");

	var dir = this.prefs.getCharPref("downdir");

	if(osString.match(/Windows/)){
	    filepath = dir+"\\"+aFile;
	}else if(osString.match(/Linux/)){
	    filepath = dir+"/"+aFile;
	}else if(osString.match(/OSX/) || osString.match(/Macintosh/) || osString.match(/OS X/)){
	    filepath = dir+"/"+aFile;
	}else{
	    //do nothing
	}

	if(filepath !== null){

	    file = Components.classes["@mozilla.org/file/local;1"]
			.createInstance(Components.interfaces.nsILocalFile);
	    file.initWithPath(filepath);

	    //download manager
	    var dm = Components.classes["@mozilla.org/download-manager;1"].createInstance(Components.interfaces.nsIDownloadManager);

	    // Create URI from which we want to download file
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

	    //Show download manager
	    var dm_ui = Components.classes["@mozilla.org/download-manager-ui;1"].createInstance(Components.interfaces.nsIDownloadManagerUI);
	    dm_ui.show(window, dl.id, Components.interfaces.nsIDownloadManagerUI.REASON_NEW_DOWNLOAD);
	}
    },

    flvrcopyToClipboard: function (aID,aFMT) {

	var sourceurl;

	//access preferences interface
	this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefService)
		.getBranch("extensions.flvideoreplacer.downloadersource.");

	//get video path from prefs

	try{
	    sourceurl = this.prefs.getCharPref(aID+"."+aFMT);
	}catch(e){
	    //do nothing
	}finally{
	    flvideoreplacerListener.docopyToClipboard(sourceurl);
	}

	try{
	    sourceurl = this.prefs.getCharPref(aID);
	}catch(e){
	    //do nothing
	}finally{
	    flvideoreplacerListener.docopyToClipboard(sourceurl);
	}
    },

    openLink: function (aLink) {//show and hide context menus
	gBrowser.addTab(aLink);
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

	//get localization
	var strbundle = document.getElementById("flvideoreplacerstrings");
	var original = strbundle.getString("original");
	var standard = strbundle.getString("standard");
	var detectionadd = strbundle.getString("detectionadd");
	var detectionremove = strbundle.getString("detectionremove");

	//hide menus
	document.getElementById("flvideoreplacer-embedded").hidden = true;
	document.getElementById("flvideoreplacer-embedded-detection").hidden = true;
	document.getElementById("flvideoreplacer-embedded-separator").hidden = true;

	//declare variables
	var detection = false, pagecontent,videoid, aSite, vidfilename, downloadurl=null, downloadurl5=null, downloadurl18=null, downloadurl34=null, downloadurl35=null, downloadurl22=null, downloadurl37=null, downloadurl38=null;

	if((replaceyt === true || replacevimeo === true) 
	      && sourceurl.match(/http/) 
	      && (!sourceurl.match(/youtube/) 
		  && !sourceurl.match(/vimeo/) 
		  && !sourceurl.match(/metacafe/) 
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
		detectionmenuitem.setAttribute('oncommand',"flvideoreplacerListener.detectionManager('remove','"+hostdomain+"');");
		detectionnewvbox.appendChild(detectionmenuitem);
	    }else{
		//append new menuitem
		detectionmenuitem = document.createElement("menuitem");
		detectionmenuitem.setAttribute("label",detectionadd);
		detectionmenuitem.setAttribute('oncommand',"flvideoreplacerListener.detectionManager('add','"+hostdomain+"');");
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
				embeddedmenuitem.setAttribute('oncommand',"flvideoreplacerListener.openLink('"+newlink+"');");
				embeddednewvbox.appendChild(embeddedmenuitem);
				document.getElementById("flvideoreplacer-embedded").hidden = false;

			    }

			    if (matchyoutoubeembed === true) {

				newembedid = newline[i].replace(/.*http:\/\/www.youtube.com\/embed\//,"").replace(/".*/,"");
				newlink = "http://www.youtube.com/watch?v="+newembedid;

				//append new menuitem
				embeddedmenuitem = document.createElement("menuitem");
				embeddedmenuitem.setAttribute("label",newlink);
				embeddedmenuitem.setAttribute('oncommand',"flvideoreplacerListener.openLink('"+newlink+"');");
				embeddednewvbox.appendChild(embeddedmenuitem);
				document.getElementById("flvideoreplacer-embedded").hidden = false;

			    }

			    if (matchvimeoembed === true) {

				newembedid = newline[i].replace(/.*http:\/\/player.vimeo.com\/video\//,"").replace(/\?.*/,"").replace(/\&.*/,"");
				newlink = "http://vimeo.com/"+newembedid;

				//append new menuitem
				embeddedmenuitem = document.createElement("menuitem");
				embeddedmenuitem.setAttribute("label",newlink);
				embeddedmenuitem.setAttribute('oncommand',"flvideoreplacerListener.openLink('"+newlink+"');");
				embeddednewvbox.appendChild(embeddedmenuitem);
				document.getElementById("flvideoreplacer-embedded").hidden = false;
			    }

			    if (matchvimeoembedold === true) {

				newembedid = newline[i].replace(/.*http:\/\/vimeo.com\/moogaloop.swf\?clip_id=/,"").replace(/\?.*/,"").replace(/\&.*/,"");
				newlink = "http://vimeo.com/"+newembedid;

				//append new menuitem
				embeddedmenuitem = document.createElement("menuitem");
				embeddedmenuitem.setAttribute("label",newlink);
				embeddedmenuitem.setAttribute('oncommand',"flvideoreplacerListener.openLink('"+newlink+"');");
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
			downloadurl5 = this.prefs.getCharPref(videoid+".5");
		    }catch(e){
			//do nothing
		    }
		    try{
			downloadurl18 = this.prefs.getCharPref(videoid+".18");
		    }catch(e){
			//do nothing
		    }
		    try{
			downloadurl34 = this.prefs.getCharPref(videoid+".34");
		    }catch(e){
			//do nothing
		    }
		    try{
			downloadurl35 = this.prefs.getCharPref(videoid+".35");
		    }catch(e){
			//do nothing
		    }
		    try{
			downloadurl22 = this.prefs.getCharPref(videoid+".22");
		    }catch(e){
			//do nothing
		    }
		    try{
			downloadurl37 = this.prefs.getCharPref(videoid+".37");
		    }catch(e){
			//do nothing
		    }
		    try{
			downloadurl38 = this.prefs.getCharPref(videoid+".38");
		    }catch(e){
			//do nothing
		    }
		}
		if(sourceurl.match(/vimeo\.com\/\d{1,8}/)){
		    aSite = "vimeo";
		    //fetch video ID from url
		    videoid = sourceurl.replace(/.*\//g, "");
		    downloadurl = this.prefs.getCharPref(videoid);
		}
		if(sourceurl.match(/metacafe\.com\/watch\//)){
		    aSite = "metacafe";
		    //fetch video ID from url
		    videoid = sourceurl.replace(/.*watch\//, "").replace(/\/.*/,"");
		    downloadurl = this.prefs.getCharPref(videoid);
		}
		if(sourceurl.match(/youporn\.com\/watch\//)){
		    aSite = "youporn";
		    //fetch video ID from url
		    videoid = sourceurl.replace(/.*watch\//g, "").replace(/\/.*/,"");
		    downloadurl = this.prefs.getCharPref(videoid);
		}
		if(sourceurl.match(/pornhub\.com\/view_video.php\?viewkey=/)){
		    aSite = "pornhub";
		    //fetch video ID from url
		    videoid = sourceurl.replace(/.*viewkey=/g, "");
		    downloadurl = this.prefs.getCharPref(videoid);
		}
		if(sourceurl.match(/redtube\.com\/\d{1,8}/)){
		    aSite = "redtube";
		    //fetch video ID from url
		    videoid = sourceurl.replace(/.*redtube\.com\//g, "");
		    downloadurl = this.prefs.getCharPref(videoid);
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
		    if(aSite === "youporn" || aSite === "pornhub" || aSite === "redtube"){
			newvidfilename = vidfilename+".flv";
		    }else{
			newvidfilename = vidfilename+".mp4";
		    }
		    //append new copy menuitem
		    copymenuitem = document.createElement("menuitem");
		    copymenuitem.setAttribute("label",standard);
		    copymenuitem.setAttribute('oncommand',"flvideoreplacerListener.flvrcopyToClipboard('"+videoid+"','0');");
		    copynewvbox.appendChild(copymenuitem);
		    //append new download menuitem
		    dlmenuitem = document.createElement("menuitem");
		    dlmenuitem.setAttribute("label",standard);
		    dlmenuitem.setAttribute('oncommand',"flvideoreplacerListener.vidDownloader('"+aSite+"','"+newvidfilename+"','"+videoid+"','0');");
		    dlnewvbox.appendChild(dlmenuitem);
		}
		if(downloadurl5 !== null){
		    newvidfilename = vidfilename+"-240p.flv";
		    //append new copy menuitem
		    copymenuitem = document.createElement("menuitem");
		    copymenuitem.setAttribute("label","240p [flv]");
		    copymenuitem.setAttribute('oncommand',"flvideoreplacerListener.flvrcopyToClipboard('"+videoid+"','5');");
		    copynewvbox.appendChild(copymenuitem);
		    //append new download menuitem
		    dlmenuitem = document.createElement("menuitem");
		    dlmenuitem.setAttribute("label","240p [flv]");
		    dlmenuitem.setAttribute('oncommand',"flvideoreplacerListener.vidDownloader('"+aSite+"','"+newvidfilename+"','"+videoid+"','5');");
		    dlnewvbox.appendChild(dlmenuitem);
		}
		if(downloadurl18 !== null){
		    newvidfilename = vidfilename+"-360p.mp4";
		    //append new copy menuitem
		    copymenuitem = document.createElement("menuitem");
		    copymenuitem.setAttribute("label","360p [mp4]");
		    copymenuitem.setAttribute('oncommand',"flvideoreplacerListener.flvrcopyToClipboard('"+videoid+"','18');");
		    copynewvbox.appendChild(copymenuitem);
		    //append new download menuitem
		    dlmenuitem = document.createElement("menuitem");
		    dlmenuitem.setAttribute("label","360p [mp4]");
		    dlmenuitem.setAttribute('oncommand',"flvideoreplacerListener.vidDownloader('"+aSite+"','"+newvidfilename+"','"+videoid+"','18');");
		    dlnewvbox.appendChild(dlmenuitem);
		}
		if(downloadurl34 !== null){
		    newvidfilename = vidfilename+"-360p.flv";
		    //append new copy menuitem
		    copymenuitem = document.createElement("menuitem");
		    copymenuitem.setAttribute("label","360p [flv]");
		    copymenuitem.setAttribute('oncommand',"flvideoreplacerListener.flvrcopyToClipboard('"+videoid+"','34');");
		    copynewvbox.appendChild(copymenuitem);
		    //append new download menuitem
		    dlmenuitem = document.createElement("menuitem");
		    dlmenuitem.setAttribute("label","360p [flv]");
		    dlmenuitem.setAttribute('oncommand',"flvideoreplacerListener.vidDownloader('"+aSite+"','"+newvidfilename+"','"+videoid+"','34');");
		    dlnewvbox.appendChild(dlmenuitem);
		}
		if(downloadurl35 !== null){
		    newvidfilename = vidfilename+"-480p.flv";
		    //append new copy menuitem
		    copymenuitem = document.createElement("menuitem");
		    copymenuitem.setAttribute("label","480p [flv]");
		    copymenuitem.setAttribute('oncommand',"flvideoreplacerListener.flvrcopyToClipboard('"+videoid+"','35');");
		    copynewvbox.appendChild(copymenuitem);
		    //append new download menuitem
		    dlmenuitem = document.createElement("menuitem");
		    dlmenuitem.setAttribute("label","480p [flv]");
		    dlmenuitem.setAttribute('oncommand',"flvideoreplacerListener.vidDownloader('"+aSite+"','"+newvidfilename+"','"+videoid+"','35');");
		    dlnewvbox.appendChild(dlmenuitem);
		}
		if(downloadurl22 !== null){
		    newvidfilename = vidfilename+"-720p.mp4";
		    //append new copy menuitem
		    copymenuitem = document.createElement("menuitem");
		    copymenuitem.setAttribute("label","720p [mp4]");
		    copymenuitem.setAttribute('oncommand',"flvideoreplacerListener.flvrcopyToClipboard('"+videoid+"','22');");
		    copynewvbox.appendChild(copymenuitem);
		    //append new download menuitem
		    dlmenuitem = document.createElement("menuitem");
		    dlmenuitem.setAttribute("label","720p [mp4]");
		    dlmenuitem.setAttribute('oncommand',"flvideoreplacerListener.vidDownloader('"+aSite+"','"+newvidfilename+"','"+videoid+"','22');");
		    dlnewvbox.appendChild(dlmenuitem);
		}
		if(downloadurl37 !== null){
		    newvidfilename = vidfilename+"-1080p.mp4";
		    //append new copy menuitem
		    copymenuitem = document.createElement("menuitem");
		    copymenuitem.setAttribute("label","1080p [mp4]");
		    copymenuitem.setAttribute('oncommand',"flvideoreplacerListener.flvrcopyToClipboard('"+videoid+"','37');");
		    copynewvbox.appendChild(copymenuitem);
		    //append new download menuitem
		    dlmenuitem = document.createElement("menuitem");
		    dlmenuitem.setAttribute("label","1080p [mp4]");
		    dlmenuitem.setAttribute('oncommand',"flvideoreplacerListener.vidDownloader('"+aSite+"','"+newvidfilename+"','"+videoid+"','37');");
		    dlnewvbox.appendChild(dlmenuitem);
		}
		if(downloadurl38 !== null){
		    newvidfilename = vidfilename+"-"+original+".mp4";
		    //append new copy menuitem
		    copymenuitem = document.createElement("menuitem");
		    copymenuitem.setAttribute("label",original);
		    copymenuitem.setAttribute('oncommand',"flvideoreplacerListener.flvrcopyToClipboard('"+videoid+"','38');");
		    copynewvbox.appendChild(copymenuitem);
		    //append new download menuitem
		    dlmenuitem = document.createElement("menuitem");
		    dlmenuitem.setAttribute("label",original);
		    dlmenuitem.setAttribute('oncommand',"flvideoreplacerListener.vidDownloader('"+aSite+"','"+newvidfilename+"','"+videoid+"','38');");
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
	}
    },

    cleanupPrefs: function () {

	this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefService)
		.getBranch("extensions.flvideoreplacer.");

	this.prefs.deleteBranch("downloadersource");
	this.prefs.deleteBranch("detectprivate");
	this.prefs.setCharlPref("videourl","");
    },

    docopyToClipboard: function (aText) {

	const gClipboardHelper = Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService(Components.interfaces.nsIClipboardHelper);
	gClipboardHelper.copyString(aText);
    }
};
window.addEventListener("load", function() { flvideoreplacerListener.init(); }, false);
window.addEventListener("unload", function() { flvideoreplacerListener.cleanupPrefs(); }, false);