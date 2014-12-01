/**
 * Init, loads javascript once page is fully loaded.
 */
jq(document).ready( function() {
	
	// First load javascript from ZMI before running setup and handlers.
	LibrarySite.load_javascript_from_zmi(function(){
		
		LibrarySite.load_featured();
		LibrarySite.load_hours();
		LibrarySite.plone_hooks();
		LibrarySite.tab_handlers();
		LibrarySite.load_example_messages();
		LibrarySite.feedback_handler();
		LibrarySite.primo();
		
		// Solr Autocomplete Setup
//		var parameters = {'connectionUrl':LibrarySite._solr_base_url,
//						  'coursepages':LibrarySite._course_guides_base_url,
//						  'defaultSearchForm':SiteUtil.getRootURL() + '/find',
//						  'defaultDelay':LibrarySite._auto_complete_delay,
//						  'defaultResultSize': 7,
//						  'connectionParams':{'alt':'jsonp','group.limit':'7','group.offset':'0'}
//						  };
//		var autocomplete = new SolrSiteSearch("#library_search_in_guides","#library_autocomplete_suggestions",parameters);
//		autocomplete.on();
	});
	
});


/**
 * All library sites general javascript.
 */
var LibrarySite = {
	
	// LibrarySite Variables
	_articles_journals_msg : "", 
	_everything_msg : "", 
	_journals_msg : "", 
	_books_videos_msg : "",
	_courses_website_msg : "", 
	_feedback_msg : "", 
	_feedback_email : "youremail@uwosh.edu",
	_library_hours_url : "",
	_auto_complete_delay : 0,
	_course_guides_base_url : "", 
	_solr_base_url : "", 
	_featured_items : null,
	_featured_items_index : 0,
	hours : {},
	
	/**
	 * Load javascript variables from ZMI properties.
	 * @param {Object} callback
	 */
	load_javascript_from_zmi : function(callback){
	    var url = SiteUtil.getRootURL() + "/library/buildJavascript?alt=jsonp&callback=?";
		jq.getJSON(url, function(data){
			
			LibrarySite._solr_base_url = data.solr_url;
			LibrarySite._course_guides_base_url = data.coursepages_url;
			LibrarySite._feedback_msg = data.feedback_msg;
			LibrarySite._everything_msg = data.everything_msg; 
			LibrarySite._articles_journals_msg = data.articles_journals_msg; 
			LibrarySite._journals_msg = data.journals_msg; 
			LibrarySite._books_videos_msg = data.books_videos_msg; 
			LibrarySite._courses_website_msg = data.courses_website_msg;
			LibrarySite._auto_complete_delay = data.autocomplete_delay;
			LibrarySite._featured_items = data.featured_items;
			LibrarySite._library_hours_url = data.library_hours_url;
			LibrarySite.current_term_code = data.current_term_code;
			
			callback(); // Waited, all variables loaded, continue this function is complete.
		});
	},
	
	
	/**
	 * Load hours from Web Service.
	 */
	primo : function() {
        jQuery('#lib_everything_search').submit(function(){
            var query = jQuery.trim(jQuery('#library_search_in_everything').val().replace(/[,&]/g,''));
            jQuery('#primo-query').val( 'any,contains,' + query );
        });
	},
	
	/**
	 * Load hours from Web Service. 
	 */
	load_hours : function() {
	
		var fmt_minutes = function(dt) {
			if (dt.getMinutes().toString().length == 1)
				return '0' + dt.getMinutes();
			return dt.getMinutes();
		}
		
		var fmt_date = function(dt) {
			out = '';
			if ( dt.getHours() > 12)
				out += (dt.getHours()-12) + ':' + fmt_minutes(dt) + 'pm';
			else if ( dt.getHours() == 12)
				out += 12 + ':' + fmt_minutes(dt) + 'pm';
			else if ( dt.getHours() == 0)
				out += 12 + ':' + fmt_minutes(dt) + 'am';
			else
				out += dt.getHours() + ':' + fmt_minutes(dt) + 'am';
			return out;
		}
		
		var getStatus = function(content) {
			var patt = /\[([^)]+)\]/g;
			var content = patt.exec(content);
			try { content = content[1]; }
			catch(e){}
			try { return content.split('status=')[1]; }
			catch(e){ return ''; }
		}
		
		var upcomingHours = function(data) {
			var weekday = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
			
			jq('#polk-upcoming-hours').html('');
			for (var i = 0; i < data.times.length && i < 7; i++) {
				var open = new Date(data.times[i].open_loc*1000);
				var close = new Date(data.times[i].close_loc*1000);
				var status = getStatus(data.times[i].content);
				var content = '<b>' + weekday[open.getDay()] + ':</b> <span>Library Closed</span>';
				if (data.times[i].is_open == '1' && status == '')
					content = '<b>' + weekday[open.getDay()] + ':</b> <span>' + fmt_date(open) + ' - ' + fmt_date(close) + '</span>';
				else if (data.times[i].is_open == '0' && status == '')
					content = '<b>' + weekday[open.getDay()] + ':</b> <span> Library Closed </span>';
				else
					content = '<b>' + weekday[open.getDay()] + ':</b> <span>' + status + '</span>';
				jq('#polk-upcoming-hours').append(jq('<div>').html(content).attr('title',open.toLocaleDateString()));
			}
			jq('#polk-upcoming-hours').append('<div class="library_clear"></div>');
		}
		
		// Get Hour Data
		var no_cache = new Date().getTime(); // stop browser caching...
		jq.getJSON(LibrarySite._library_hours_url+'&callback=?&alt=jsonp&browser_cache_bypass='+no_cache,function(data) {
			upcomingHours(data);
			jq('a.library_hours span').html(getStatusMsg(data));
		});
		
		// Determine library message. 
		var getStatusMsg = function(data) {
			try {					
				var open = new Date(data.times[0].open_loc*1000);
				var close = new Date(data.times[0].close_loc*1000);
				if (data.currently_is_open == 0 || data.currently_is_open == '0')
					jq('.library_hours').parents('span.pane-tip-trigger').attr('data-show-time',0);
				if (data.Response == "None" || data.current_status_text.indexOf("Error") > -1)
					return "Library Hours"; // Handle if service goes down completely.
				return data.current_status_text;
			}
			catch(e) {
				return "Library Hours";
			}
		}
		
	},
	
	
	/**
	 * Adds action triggers to plone tinymce.
	 */
	plone_hooks : function(){
		
		var drop = function(tab_index) {
			jq('.formTabs .formTab:nth(' + tab_index + ') > a').trigger('click');
		}
		
		var select = function(selector,tab_index) {
			jq('.formPanel').hide();
			jq(selector).show();
			jq('.formTabs .formTab > a').removeClass('selected');
		    jq('.formTabs .formTab:nth(' + tab_index + ') > a').addClass('selected');
		}
		
		var flash = function() {
			jq('.library_search_in').delay(800).effect("highlight", {color : "#ffff00"}, 2000);
		}
		
		var setup = function(t,s,i){
			if (jq(t).hasClass('tab-drop'))
				drop(i);
			if (jq(t).hasClass('tab-select'))
				select(s,i);
			if (jq(t).hasClass('tab-flash'))
				flash(jq(t));
		}
		
		jq('.tab1-actions').click(function(){ setup(jq(this),'#fieldset-tab1',0); });
		jq('.tab2-actions').click(function(){ setup(jq(this),'#fieldset-tab2',1); });
		jq('.tab3-actions').click(function(){ setup(jq(this),'#fieldset-tab3',2); });
		
	},
	
	
	/**
	 * Loads featured images and sets up the image rotation.
	 */
	load_featured : function() {
		if (LibrarySite._featured_items.length > 2)
			for(var i in LibrarySite._featured_items) {
				if(LibrarySite._featured_items[i].url == jq('#hp_featured > a').attr('href')) {
					var item = LibrarySite._featured_items.splice(i,1);
					LibrarySite._featured_items.splice(0,0,item[0]);
				}
			}
			
		var flip = function(opt){
			if (opt == 'left') {
				LibrarySite._featured_items_index++;
				if (LibrarySite._featured_items_index % LibrarySite._featured_items.length == 0) LibrarySite._featured_items_index = 0;
			}
			else {
				LibrarySite._featured_items_index--;
				if (LibrarySite._featured_items_index < 0) LibrarySite._featured_items_index = LibrarySite._featured_items.length-1;
			}
			jq('#hp_featured').stop(true,true);
			jq('#hp_featured  > a').attr('href',LibrarySite._featured_items[LibrarySite._featured_items_index].url);
			jq('#hp_featured  > a > img').attr('src',LibrarySite._featured_items[LibrarySite._featured_items_index].image);
			jq('#hp_featured  > a > img').attr('title',LibrarySite._featured_items[LibrarySite._featured_items_index].description);
			jq('#hp_featured  > a > img').attr('alt',LibrarySite._featured_items[LibrarySite._featured_items_index].title);
			return false;
		}
		
		jq('#hp_featured').hover(
			function(){
				jq('#hp_featured .featured_item_r, #hp_featured .featured_item_l').css('visibility','visible');
			},
			function(){
				jq('#hp_featured .featured_item_r, #hp_featured .featured_item_l').css('visibility','hidden');
			}
		);
		
		jq('.featured_item_l').click( function(){ return flip('left'); });
		jq('.featured_item_r').click( function(){ return flip('right'); });
	},
	
	
	/**
	 * Handles Navigation Tabs such as Articles, Books, Website.
	 */
	tab_handlers : function() {
		
		var isAutocomplete = function(e) {
			return jq(e.target).is('.ac-button-r, .ac-button-l');
		}
		var down = function(e) {
			if (!jq(e.target).hasClass('heading'))
				jq('.library_search_hidden').stop(false,true).slideDown(100);
		}
		var up = function(e) {
			if (jq('#library_search_nav').has(jq(e.target)).length == 0) {
				if (SiteUtil.isHomepage()) return;
				jq('.library_search_hidden').hide();
			}
		}
		
	    jq('#library_search_nav ul.formTabs > li > a, #library_search_nav .library_search_in').bind('click',down);
	    jq('body').bind('click',up);
	},
	
	
	/**
	 * Load messages into the input and text fields on the site.
	 */
	load_example_messages : function() {
		
		var set_message = function(id,example){
			var exampleFont = {'color':'#555555','font-style':'italic'};
			var standardFont = {'color':'black','font-style':'normal'};
			
			if(jq(id).attr('value') == '' || example == jq(id).attr('value')){
				jq(id).attr('value',example);
				jq(id).css(exampleFont);
			}
			jq(id).click(function() {
				if (example == jq(id).attr('value')) {
					jq(id).attr('value', '');
					jq(id).css(standardFont);
				}
		    });
			jq(id).focusout(function() {
				if (jq(id).attr('value').trim() == '') {
					jq(id).attr('value', example);
					jq(id).css(exampleFont);
				}
		    });
		}
		
		var markers = [{"marker":"#library_search_in_everything","text":LibrarySite._everything_msg},
					   {"marker":"#library_search_in_books","text":LibrarySite._books_videos_msg},
					   {"marker":"#library_search_in_journals","text":LibrarySite._journals_msg},
					   {"marker":"#library_search_in_articles","text":LibrarySite._articles_journals_msg},
					   {"marker":"#library_search_in_guides","text":LibrarySite._courses_website_msg},
					   {"marker":"#library_feedback_textbox","text":LibrarySite._feedback_msg},
					   {"marker":"#library_feedback_email","text":LibrarySite._feedback_email}
					  ];
		
		for (m in markers)
			set_message(markers[m].marker,markers[m].text);
	},
	
	
	/**
	 * Setup Feedback Box and Feedback Side Tab.
	 */
	feedback_handler : function() {
		
		//Side-Screen FeedBack Tab
	    jq('#libary_feedback_side').click(function() {
			jq('html, body').animate({scrollTop: jq('body').height()}, 800);
			jq('#library_feedback_textbox').delay(800).effect("highlight", {color:"#ffff00"}, 2000);
		});
		
		//Feedback Submit is clicked.
		jq('#library_feedback_input').click(function() {
			
			var msg = jq.trim(jq('#library_feedback_textbox').val());
			var emailaddress = jq.trim(jq('#library_feedback_email').val());
			var authentication = jq('#content input[name="_authenticator"]').val();
			var form_submit = jq('#content input[name="form_submit"]').val();
			
			if(LibrarySite._feedback_email == emailaddress){
				jq('#library_feedback_email').css({'border':'1px solid red','background-color':'pink','background-image':'none'});
				PopupWidget.show_msg("Missing e-mail address","Please provide your e-mail address so that we can respond to your suggestion.");
				return false;
			}
		
			parameters = {'comments': msg,
						  'replyto':emailaddress,
						  'fieldset':'default',
						  'add_reference.destination:record':'',
						  'add_reference.type:record':'',
						  'add_reference.field:record':'',
						  '_authenticator':authentication,
						  'form.submitted':'1',
						  'last_referer':document.location.href,
						  'form_submit':form_submit,
						  'referer':SiteUtil.getCurrentURL()
						  };
	
			jq.post(SiteUtil.getRootURL() + "/contact/suggestions", parameters, function(data){
				jq('#library_feedback_email').css({'border':'1px solid #C0C0C0','background-color':'white','background-image':'none'});
				jq('#library_feedback_textbox').val(LibrarySite._feedback_msg); //default
				jq('#library_feedback_email').val(LibrarySite._feedback_email); //default
				PopupWidget.show_msg("Library Feedback","Message sent.<br /> Thank you for your feedback.");
			});
		});
	}

}


/**
 * Simple popup a overlay box
 */
var PopupWidget = {
    show_msg : function(title,content,width) {
		//Body
		var popup_body = document.createElement('div');
		jq(popup_body).attr('id','library_popup_widget_box');
		jq(popup_body).css({'box-shadow':'10px 10px 15px #777777','-webkit-box-shadow':'10px 10px 15px #777777'});
		if(width != null)
			jq(popup_body).css({'width':width,'margin-left':-((width/2)+1)});
		
		//Close
		var popup_close = document.createElement('div');
		jq(popup_close).attr('id','library_popup_widget_close');
		var popup_close_img = document.createElement('img');
		jq(popup_close_img).attr('src',SiteUtil.getRootURL() + '/pb_close.png');
		jq(popup_close).append(popup_close_img);
		jq(popup_body).append(popup_close); //Attach to body
		
		
		//Heading
		if (title != null) {
			var popup_head = document.createElement('div');
			jq(popup_head).attr('class', 'library_popup_widget_h1');
			jq(popup_head).append(document.createTextNode(title));
			jq(popup_body).append(popup_head);  //Attach to body
		}
	
		//Main Content
		if (content != null) {
			var popup_content = document.createElement('div');
			jq(popup_content).append(content);
			jq(popup_body).append(popup_content);  //Attach to body
		}
			
		// Finalized - Attach to Body
		jq("body").append(popup_body);
		
		// Event Listeners
		jq("#library_popup_widget_box").fadeIn('fast');
		jq('#library_popup_widget_box').click(function() {
			jq('#library_popup_widget_box').fadeOut('fast',function(){
				jq('#library_popup_widget_box').remove();
			});
		});
	}
}


/**
 * Utility class
 */
var SiteUtil = {
	
	isDOITCloud : function(url) {
		return SiteUtil.beginsWith(url,'http://polk.uwosh.edu/library');
	},
	
	isLocalLink : function(url) {
		return SiteUtil.beginsWith(url,SiteUtil.getRootURL());
	},
	
	isProxy : function(url) {
		return SiteUtil.contains(url,'remote.uwosh.edu/');
	},
	
	isOpac : function(url) {
		return SiteUtil.beginsWith(url,'http://oshlib.wisconsin.edu/vwebv/');
	},
	
	isHomepage : function() {
		var url = SiteUtil.getCurrentURL();
		url = url.split('?')[0];
		url = url.split('#')[0];
		return (SiteUtil.endsWith(url,'/library') || SiteUtil.endsWith(url,'/library/'));
	},
	
	isEMC : function() {
		return SiteUtil.urlContains('/library/emc');
	},
	
	isGovInfo : function() {
		return SiteUtil.urlContains('/library/government');
	},
	
	isSubjectGuides : function() {
		return (SiteUtil.urlContains('/library/subjects/') && !SiteUtil.urlEndsWith('/library/subjects/'));
	},
	
	urlContains : function (unique_target) {
		return (SiteUtil.getCurrentURL().indexOf(unique_target) > -1)
	},
	
	urlEndsWith : function (arg) {
		return SiteUtil.endsWith(SiteUtil.getCurrentURL(),arg);
	},
	
	contains : function (string,ends) {
		return (string.indexOf(ends) != -1)
	},
	
	endsWith : function (string,ends) {
		return (string.indexOf(ends) + ends.length == string.length)
	},
	
	beginsWith : function (string,begins) {
		return (begins == string.substring(0, begins.length)); 
	},
	
	getCurrentURL : function () {
		return document.location.href;
	},
	
	getRootURL : function () {
		var root = "/library";
		var url = SiteUtil.getCurrentURL();
		return url.substring(0, url.indexOf(root) + root.length);
	},
	
	addFunction : function (name,func) {
		this[name] = func;
	},
	
	mrClean : function (str) {
		return str.replace(/\(([A-Za-z\d]+)\)/g, "");
	},
	
	popBefore : function (s,o) {
		var p = s.split(o);
		return jq.trim(p[0]);
	},
	
	stripArgsProxySafe : function (u) {
		var p = u.split('?');
		if (SiteUtil.isProxy(u))
			return p[0] + '?' + p[1]
		return p[0]
	},

	emailTransformer : function(text){
	    var regEx = /(\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*)/;
	    var tmp = jq('<span>').html(text); // wrap it
	    jq(tmp).filter(function() {
	        return jq(this).html().match(regEx);
	    }).each(function() {
	        jq(this).html(jq(this).html().replace(regEx, "<a class=\"library_link\" href=\"mailto:$1\">$1</a>"));
	    });
		return jq(tmp).html(); // unwrap it
	}
	
}

