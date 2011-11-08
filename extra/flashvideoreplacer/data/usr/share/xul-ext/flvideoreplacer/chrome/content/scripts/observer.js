//declare observer
const FlashVideoReplacerObserver =
{
		observe: function(subject, topic, prefName)
		{
			//check if preferences changed
			if (topic == "nsPref:changed" && (prefName == "extensions.flvideoreplacer.videoquality" || prefName == "extensions.flvideoreplacer.enabled" ))
			{

				//declare page url ****doesn't work if tab is loaded in the backround***
				//var sourceurl = gURLBar.value;
				var sourceurl =  content.window.location.href;

				if((sourceurl.match(/youtube.*watch.*v\=/)  && !sourceurl.match("html5=True")) 
						|| sourceurl.match(/vimeo\.com\/\d{1,8}/)
						|| (sourceurl.match(/metacafe\.com\/watch\//) && !sourceurl.match(/http.*http:\/\/www.metacafe\.com/))
						|| sourceurl.match(/youporn\.com\/watch\//)
						|| sourceurl.match(/pornhub\.com\/view_video.php\?viewkey=/)
						|| sourceurl.match(/redtube\.com\/\d{1,8}/)
				){
					content.window.location.reload();
				}
			}
		}
};

var flvideoreplacerObserver = {//observer registering functions

		registerObserver: function(aEvent) {//register and unregister observers

			//declare observer type
			var FlashVideoReplacerPrefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranchInternal);

			if (aEvent == "register"){//register observers
				FlashVideoReplacerPrefService.addObserver("extensions.flvideoreplacer.videoquality", FlashVideoReplacerObserver, false);
				FlashVideoReplacerPrefService.addObserver("extensions.flvideoreplacer.enabled", FlashVideoReplacerObserver, false);
			}

			if (aEvent == "unregister"){//unregister observers
				FlashVideoReplacerPrefService.removeObserver("extensions.flvideoreplacer.videoquality", FlashVideoReplacerObserver);
				FlashVideoReplacerPrefService.removeObserver("extensions.flvideoreplacer.enabled", FlashVideoReplacerObserver);
			}
		}
};
window.addEventListener("load",function(){ flvideoreplacerObserver.registerObserver('register'); },false);//launch observer register
window.addEventListener("unload",function(){ flvideoreplacerObserver.registerObserver('unregister'); },false);//launch observer unregister