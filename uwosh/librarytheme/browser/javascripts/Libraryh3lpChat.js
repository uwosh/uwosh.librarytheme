/*
 * Libraryh3lp Controllers
 * =============================================================================================
 */
/**
 * This is the global callback.  It uses Classname to allow many chats to one page.  Original 
 * code only allows a one chat to one page.  
 */
var jq = jQuery;
var LibraryH3lp_interval = null;
var LibraryH3lp_count = 0;
var LibraryH3lp_max = 3;

jq(document).ready( function() {
	LibraryH3lp.checkAllChats(); // Initial Check
	jq("body").mouseover(function(){
		LibraryH3lp.start();
	});
});

var LibraryH3lp = {
	
	stop : function(){
		clearInterval(window.LibraryH3lp_interval);
		window.LibraryH3lp_interval = null;
	},
	
	start : function(interval) {
		if (window.LibraryH3lp_interval == null) {
			window.LibraryH3lp_count = 0;
			var time = 1000 * 60 * 2;
			if (interval != null) time = interval;
			window.LibraryH3lp_interval = setInterval("LibraryH3lp.checkAllChats()", time);
		}
		
	},
	
	showOnline : function(selector) {
		var offline = true;
		jq.each(jq(selector).parent(),function(i,t){
			jq(t).children().css('display', 'none');
			jq(t).find('.libraryh3lp-online').each(function(j,tt) {
				jq(tt).css('display', '');
				offline = false;
				return false;
			});
			if (offline) 
				jq(t).find(':last-child').css('display', '');
		});
	},
	
	available : function(selector) {
		jq(selector).addClass('libraryh3lp-online');
	},
	
	unavailable: function(selector) {
		jq(selector).removeClass('libraryh3lp-online');
	},
	
	chatCallback : function(marker){
	    for (var i in jabber_resources) {
	        var resource = jabber_resources[i];
	        if (resource.show === 'available' || resource.show === 'chat') 
				LibraryH3lp.available(marker);
			else
				LibraryH3lp.unavailable(marker);
			LibraryH3lp.showOnline(marker);
	    }
		
	},
	
	createDynamicCallback : function(name, marker){
		window[name] = function(){ LibraryH3lp.chatCallback( '.' + marker ); }
	},
	
	checkAllChats : function(){
		try {
			if (window.LibraryH3lp_count >= window.LibraryH3lp_max) {
				LibraryH3lp.stop();
				return;
			}
			window.LibraryH3lp_count++;
			
			var set = {}; // ensures 1 lookup, no dups.
			jq('.libraryh3lp').each(function(index){
				var jid = LibraryH3lp.getJID(this);
				
				if (jid != null) {
					var p = jid.split('@');
					var marker = p[0] + '-marker';
					jq(this).addClass(marker);
					set[marker] = marker;
				}
			});
			for (var i in set) {
				var p = LibraryH3lp.getJID(jq('.' + set[i])).split('@');
				var func_name = "lh_callback_id_" + new Date().getTime();
				
				LibraryH3lp.createDynamicCallback(func_name, set[i]); // dynamic callbacks
				var url = ['http://libraryh3lp.com/presence/jid', p[0], p[1], 'js'].join('/');
				
				element = document.createElement("script");
				jq(element).attr('src', url + '?cb=' + func_name);
				jq(element).attr('type', 'text/javascript');
				jq('head').append(element);
			}
		}catch(e){
			// Fail silently...
		}
	},
	
	getJID : function(t){
		var jid = jq(t).attr('jid');
		if (jid == '' || jid == null) {
			var cs = jq(t).attr('class').split(' ');
			for (c in cs) {
				var p = cs[c].indexOf('data-jid-');
				if(p != -1) 
					return cs[c].substring(p+9,cs[c].length) + '@chat.libraryh3lp.com';
			}
		}
		return jid;
	}
}

var ExternalFooter =  {
	
	load : function(library_url,selector) {
        if (jq.browser.msie) {
            var xdr = new XDomainRequest(); //IE8+ Cross domain.
            function xdrCallback() {
                jq(selector).html(xdr.responseText);
                LibraryH3lp.checkAllChats();
            }
            if (xdr){
                xdr.open("GET", library_url + "/footer_links?external=1");
                xdr.onload = xdrCallback;
                xdr.send();
            }
        }
        else
            jq(selector).load(library_url + "/footer_links?external=1", function(){ LibraryH3lp.checkAllChats(); });
	}
	
}
