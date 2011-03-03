var flvideoreplacerOptions = {

    toggleMime: function() {

	//get osString
	var osString = Components.classes["@mozilla.org/network/protocol;1?name=http"]
		.getService(Components.interfaces.nsIHttpProtocolHandler).oscpu; 

	//access preferences interface
	this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefService)
		.getBranch("extensions.flvideoreplacer.");

	//get plugin info
	var replacemethod = this.prefs.getCharPref("method");
	var pluginvmp4 = this.prefs.getBoolPref("pluginvmp4");
	var pluginxflv = this.prefs.getBoolPref("pluginxflv");
	var pluginaqt = this.prefs.getBoolPref("pluginaqt");
	var pluginawmp = this.prefs.getBoolPref("pluginawmp");

	if(osString.match(/OSX/) || osString.match(/Macintosh/) || osString.match(/OS X/)){
	    if(replacemethod === "standalone"){
		this.prefs.setCharPref("method","prompt");
	    }
	    document.getElementById("mprompt").hidden=false;
	    document.getElementById("membed").hidden=false;
	    document.getElementById("mnewtab").hidden=false;
	    document.getElementById("mnewwin").hidden=false;
	    document.getElementById("mstand").hidden=true;
	    this.prefs.setBoolPref("prefermp4",true);
	}else{

	    if(pluginvmp4 === true){
		document.getElementById("pluginvmp4").hidden=false;
	    }else{
		document.getElementById("pluginvmp4").hidden=true;
	    }
	    if(pluginxflv === true){
		document.getElementById("pluginxflv").hidden=false;
	    }else{
		document.getElementById("pluginxflv").hidden=true;
	    }
	    if(pluginaqt === true){
		document.getElementById("pluginaqt").hidden=false;
	    }else{
		document.getElementById("pluginaqt").hidden=true;
	    }
	    if(pluginawmp === true){
		document.getElementById("pluginawmp").hidden=false;
	    }else{
		document.getElementById("pluginawmp").hidden=true;
	    }
	    if(pluginvmp4 === false && pluginxflv === false){
		this.prefs.setCharPref("method","standalone");
		document.getElementById("mprompt").hidden=true;
		document.getElementById("membed").hidden=true;
		document.getElementById("mnewtab").hidden=true;
		document.getElementById("mnewwin").hidden=true;
		document.getElementById("mstand").hidden=false;
	    }
	    if(pluginvmp4 === true && pluginxflv === false){
		this.prefs.setBoolPref("prefermp4",true);
	    }
	    if(pluginvmp4 === false && pluginxflv === true){
		this.prefs.setBoolPref("prefermp4",false);
	    }
	}
    },

    togglePlayer: function() {

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
    },

    toggleOptions: function() {

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

	//get localization
	var strbundle = document.getElementById("flvideoreplacerstrings");
	var messagetitle = strbundle.getString("flvideoreplacermessage");
	var alerttitle = strbundle.getString("flvideoreplaceralert");
	var message, bestplayer, webm;

	//get elements values
	var standalone = document.getElementById('standalone').value;
	var replacemethod = document.getElementById('method').value;

	if(osString.match(/Windows/)){

	    //set playerpath
	    if(standalone === "playerqt"){
		this.prefs.setCharPref("playerpath","C:\\Program Files\\QuickTime\\QuickTimePlayer.exe");
	    }
	    if(standalone === "playerwmp"){
		this.prefs.setCharPref("playerpath","C:\\Program Files\\Windows Media Player\\wmplayer.exe");
	    }
	    if(standalone === "playerkmp"){
		this.prefs.setCharPref("playerpath","C:\\Program Files\\The KMPlayer\\KMPlayer.exe");
	    }
	    if(standalone === "playerbsp"){
		this.prefs.setCharPref("playerpath","C:\\Program Files\\Webteh\\BSPlayer\\bsplayer.exe");
	    }
	    if(standalone === "playerbest"){

		if(playerbsp === true){
		this.prefs.setCharPref("playerpath","C:\\Program Files\\Webteh\\BSPlayer\\bsplayer.exe");
		}else if(playerkmp === true){
		    this.prefs.setCharPref("playerpath","C:\\Program Files\\The KMPlayer\\KMPlayer.exe");
		}else if(playerwmp === true){
		    this.prefs.setCharPref("playerpath","C:\\Program Files\\Windows Media Player\\wmplayer.exe");
		}else if(playerqt === true){
		    this.prefs.setCharPref("playerpath","C:\\Program Files\\QuickTime\\QuickTimePlayer.exe");
		}else{
		    bestplayer = "BS.Player";
		    message = strbundle.getFormattedString("nobestplayer", [ bestplayer ]);
		    this.prefs.setCharPref("playerpath",message);
		    document.getElementById('standalone').value = "playercustom";
		}
	    }

	}else if(osString.match(/Linux/)){

	    //set playerpath
	    if(standalone === "playertotem"){
		this.prefs.setCharPref("playerpath","/usr/bin/totem");
	    }
	    if(standalone === "playergmplayer"){
		this.prefs.setCharPref("playerpath","/usr/bin/gnome-mplayer");
	    }
	    if(standalone === "playerkaffeine"){
		this.prefs.setCharPref("playerpath","/usr/bin/kaffeine");
	    }
	    if(standalone === "playerkmp"){
		this.prefs.setCharPref("playerpath","/usr/bin/kmplayer");
	    }
	    if(standalone === "playersmplayer"){
		this.prefs.setCharPref("playerpath","/usr/bin/smplayer");
	    }
	    if(standalone === "playerbest"){

		if(playersmplayer === true){
		    this.prefs.setCharPref("playerpath","/usr/bin/smplayer");
		}else if(playergmplayer === true){
		    this.prefs.setCharPref("playerpath","/usr/bin/gnome-mplayer");
		}else if(playerkaffeine === true){
		    this.prefs.setCharPref("playerpath","/usr/bin/kaffeine");
		}else if(playerkmp === true){
		    this.prefs.setCharPref("playerpath","/usr/bin/kmplayer");
		}else if(playertotem === true){
		    this.prefs.setCharPref("playerpath","/usr/bin/totem");
		}else{
		    bestplayer = "SMPlayer";
		    message = strbundle.getFormattedString("nobestplayer", [ bestplayer ]);
		    this.prefs.setCharPref("playerpath",message);
		    document.getElementById('standalone').value = "playercustom";
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
	    if(replacemethod === "prompt"){

		document.getElementById("selectplugin").hidden=false;
		document.getElementById("standaloneplayer").hidden=true;
		document.getElementById("downloader").hidden=false;
		document.getElementById("checkplugin").hidden=false;
	    }
	    if(replacemethod === "newtab"){

		document.getElementById("selectplugin").hidden=true;
		document.getElementById("standaloneplayer").hidden=true;
		document.getElementById("downloader").hidden=false;
		document.getElementById("checkplugin").hidden=false;
		document.getElementById('mimetype').value = "autodetect";
	    }
	    if(replacemethod === "newwindow"){

		document.getElementById("selectplugin").hidden=true;
		document.getElementById("standaloneplayer").hidden=true;
		document.getElementById("downloader").hidden=false;
		document.getElementById("checkplugin").hidden=false;
		document.getElementById('mimetype').value = "autodetect";
	    }
	    if(replacemethod === "standalone"){
		this.prefs.setCharPref("method","prompt");
	    }
	    if(replacemethod === "embedded"){

		document.getElementById("selectplugin").hidden=false;
		document.getElementById("standaloneplayer").hidden=true;
		document.getElementById("downloader").hidden=false;
		document.getElementById("checkplugin").hidden=false;

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
	    if(replacemethod === "prompt"){

		document.getElementById("selectplugin").hidden=false;
		document.getElementById("standaloneplayer").hidden=false;
		document.getElementById("downloader").hidden=false;
		document.getElementById("checkplugin").hidden=false;
	    }
	    if(replacemethod === "newtab"){

		document.getElementById("selectplugin").hidden=true;
		document.getElementById("standaloneplayer").hidden=true;
		document.getElementById("downloader").hidden=false;
		document.getElementById("checkplugin").hidden=false;
		document.getElementById('mimetype').value = "autodetect";
	    }
	    if(replacemethod === "newwindow"){

		document.getElementById("selectplugin").hidden=true;
		document.getElementById("standaloneplayer").hidden=true;
		document.getElementById("downloader").hidden=false;
		document.getElementById("checkplugin").hidden=false;
		document.getElementById('mimetype').value = "autodetect";
	    }
	    if(replacemethod === "standalone"){

		document.getElementById("selectplugin").hidden=true;
		document.getElementById("standaloneplayer").hidden=false;
		document.getElementById("downloader").hidden=false;
		document.getElementById("checkplugin").hidden=false;

	    }
	    if(replacemethod === "embedded"){

		document.getElementById("selectplugin").hidden=false;
		document.getElementById("standaloneplayer").hidden=true;
		document.getElementById("downloader").hidden=false;
		document.getElementById("checkplugin").hidden=false;

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
    },

    checkPlugin: function() {

	//get osString
	var osString = Components.classes["@mozilla.org/network/protocol;1?name=http"]
		.getService(Components.interfaces.nsIHttpProtocolHandler).oscpu;

	//initiate file
	var pluginreg = Components.classes["@mozilla.org/file/directory_service;1"]
		.getService(Components.interfaces.nsIProperties)
		.get("ProfD", Components.interfaces.nsIFile);
	pluginreg.append("pluginreg.dat");

	//get localization
	var strbundle = document.getElementById("flvideoreplacerstrings");
	var messagetitle = strbundle.getString("flvideoreplacermessage");
	var alerttitle = strbundle.getString("flvideoreplaceralert");
	var message, prompts;

	//get players info
	var playertotem = this.prefs.getBoolPref("playertotem");
	var playergmplayer = this.prefs.getBoolPref("playergmplayer");
	var playerkaffeine = this.prefs.getBoolPref("playerkaffeine");
	var playersmplayer = this.prefs.getBoolPref("playersmplayer");
	var playerkmp = this.prefs.getBoolPref("playerkmp");
	var playerqt = this.prefs.getBoolPref("playerqt");
	var playerbsp = this.prefs.getBoolPref("playerbsp");
	var playerwmp = this.prefs.getBoolPref("playerwmp");

	//get plugin info
	var pluginvmp4 = this.prefs.getBoolPref("pluginvmp4");
	var pluginxflv = this.prefs.getBoolPref("pluginxflv");
	var pluginaqt = this.prefs.getBoolPref("pluginaqt");
	var pluginawmp = this.prefs.getBoolPref("pluginawmp");

	//declare variables
	var pluginstatus, bestplugin = false, forcedplugin = false, pluginavaliable, istream;

	if(pluginvmp4 === true && pluginxflv === true){
	    pluginstatus = "full";
	}else if(pluginvmp4 === true && pluginxflv === false){
	    pluginstatus = "application/x-flv";
	}else if(pluginvmp4 === false && pluginxflv === true){
	    pluginstatus = "video/mp4";
	}else{
	    pluginstatus = "noplugin";
	}

	if(pluginstatus === "noplugin"){

	    if(osString.match(/Windows/)){

		if(playerbsp === true || playerkmp === true){
		    message = strbundle.getString("nopluginplayerbest");
		}else if(playerwmp === true){
		    message = strbundle.getString("nopluginplayerfull");
		}else if(playerqt === true){
		    message = strbundle.getString("nopluginplayeralt");
		}else{
		    message = strbundle.getString("nopluginplayerno");
		}
		this.prefs.setCharPref("mimetype","autodetect");
	    }
	    if(osString.match(/Linux/)){

		if(playersmplayer === true){
		    message = strbundle.getString("nopluginplayerbest");
		}else if(playergmplayer === true || playertotem === true || playerkaffeine === true || playerkmp === true){
		    message = strbundle.getString("nopluginplayerfull");
		}else{
		    message = strbundle.getString("nopluginplayerno");
		}
		this.prefs.setCharPref("mimetype","autodetect");
	    }
	    if(osString.match(/OSX/) || osString.match(/Macintosh/) || osString.match(/OS X/)){
		message = strbundle.getString("nopluginplayeralt");
		this.prefs.setCharPref("mimetype","autodetect");
	    }
	}

	if(pluginstatus === "application/x-flv" || pluginstatus === "video/mp4"){

	    if(osString.match(/Windows/)){

		if(playerbsp === true || playerkmp === true){
		    message = strbundle.getFormattedString("partpluginplayerbest", [ pluginstatus ]);
		}else if(playerwmp === true){
		    message = strbundle.getFormattedString("partpluginplayerfull", [ pluginstatus ]);
		}else if(playerqt === true){
		    message = strbundle.getFormattedStringg("partpluginplayeralt", [ pluginstatus ]);
		}else{
		    message = strbundle.getFormattedString("partpluginplayerno", [ pluginstatus ]);
		}
		this.prefs.setCharPref("mimetype","autodetect");
	    }
	    if(osString.match(/Linux/)){

		//read file
		istream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
		istream.init(pluginreg, 0x01, 444, 0);
		istream.QueryInterface(Components.interfaces.nsILineInputStream);

		var line = {}, lines = [], hasmore;
		do {
		    hasmore = istream.readLine(line);
		    lines.push(line.value);

		    //check plugin by name
		    pluginavaliable = /totem/.test(line.value);
		    if (pluginavaliable === true) {
			forcedplugin = true;
		    }
		} while(hasmore);
		istream.close();

		if(pluginstatus === "application/x-flv" && forcedplugin === true){
		    message = strbundle.getFormattedString("forcedplugin", [ "application/x-mplayer2" ]);
		    this.prefs.setCharPref("mimetype","application/x-mplayer2");
		}else{
		    if(playersmplayer === true ){ 
			message = strbundle.getString("partpluginplayerbest", [ pluginstatus ]);
		    }else if(playergmplayer === true || playertotem === true || playerkaffeine === true || playerkmp === true){
			message = strbundle.getFormattedString("partpluginplayerfull", [ pluginstatus ]);
		    }else{
			message = strbundle.getFormattedString("partpluginplayerno", [ pluginstatus ]);
		    }
		    this.prefs.setCharPref("mimetype","autodetect");
		}
	    }
	    if(osString.match(/OSX/) || osString.match(/Macintosh/) || osString.match(/OS X/)){
		message = strbundle.getFormattedString("partpluginplayeralt", [ pluginstatus ]);
		this.prefs.setCharPref("mimetype","video/quicktime");
	    }
	}

	if(pluginstatus === "full"){

	    if(osString.match(/Windows/)){
		message = strbundle.getString("fullplugin");
		this.prefs.setCharPref("mimetype","autodetect");
	    }
	    if(osString.match(/Linux/)){

		//read file
		istream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
		istream.init(pluginreg, 0x01, 444, 0);
		istream.QueryInterface(Components.interfaces.nsILineInputStream);

		var line = {}, lines = [], hasmore;
		do {
		    hasmore = istream.readLine(line);
		    lines.push(line.value);

		    //check plugin by name
		    pluginavaliable = /gecko/.test(line.value);
		    if (pluginavaliable === true) {
			bestplugin = true;
		    }
		} while(hasmore);
		istream.close();

		if(bestplugin === false){
		    message = strbundle.getString("fullplugin");
		}else{
		    message = strbundle.getString("bestplugin");
		}
		this.prefs.setCharPref("mimetype","autodetect");
	    }
	    if(osString.match(/OSX/) || osString.match(/Macintosh/) || osString.match(/OS X/)){
		message = strbundle.getString("fullplugin");
		this.prefs.setCharPref("mimetype","autodetect");
	    }
	}

	if(pluginstatus === "full"){
	    //alert user
	    prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
		    .getService(Components.interfaces.nsIPromptService);
	    prompts.alert(window, messagetitle, message);
	}else{
	    //alert user
	    prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
		    .getService(Components.interfaces.nsIPromptService);
	    prompts.alert(window, alerttitle, message);
	}

	if(pluginstatus !== "full"){

	    var loc, wm, wmed, win, content;

	    loc = "about:plugins";

	    //open in new tab
	    wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService();
	    wmed = wm.QueryInterface(Components.interfaces.nsIWindowMediator);
	    win = wmed.getMostRecentWindow("navigator:browser");

	    if ( !win ) {
		win = window.openDialog("chrome://browser/content/browser.xul","_blank","chrome,all,dialog=no",loc, null, null);
	    }
	    else {
		content = win.document.getElementById("content");
		content.selectedTab = content.addTab(loc);
	    }

	    loc = "http://www.webgapps.org/addons/flashvideoreplacer";

	    //open in new tab
	    wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService();
	    wmed = wm.QueryInterface(Components.interfaces.nsIWindowMediator);
	    win = wmed.getMostRecentWindow("navigator:browser");

	    if ( !win ) {
		win = window.openDialog("chrome://browser/content/browser.xul","_blank","chrome,all,dialog=no",loc, null, null);
	    }
	    else {
		content = win.document.getElementById("content");
		content.selectedTab = content.addTab(loc);
	    }
	}
    }
};
window.addEventListener("load",function(){ flvideoreplacerOptions.toggleMime(); },true);
window.addEventListener("load",function(){ flvideoreplacerOptions.togglePlayer(); },true);