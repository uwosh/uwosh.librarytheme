var PolkAnalyticStandards = {
	
	// STANDARD DEFINITIONS BELOW ==============================================
	
	ACCOUNT : "My Account",
	ACCOUNT_RENEW : "My Account - Renew",
	ACCOUNT_REQUESTS : "My Account - Requests",
	ACCOUNT_ESHELF : "My Account - e-Shelf",
    ADD_ESHELF : "Add e-Shelf",
    ADD_FACET : "Add Facet",
	ADVANCED : "Advanced", 
	   
	BASIC : "Basic",
	
    CALL_SLIP : "Call Slip",
	CATEGORY_WEBSITE_HOME : "Home",
	CATEGORY_WEBSITE_OTHER : "Site",
	CATEGORY_PRIMO : "Primo",
	CLEAR_PREFERENCES : "Clear Preferences",
    CREATE_REQUEST : "Create Request",

	ENTER_CHAT : "Enter Chat",
	ENTER_OPAC : "Enter OPAC",
	ENTER_ILLIAD : "Enter ILLiad",
	ENTER_DATABASE : "Enter Database",
	ENTER_PRIMO : "Enter Primo",
	ENTER_JOURNALS_AZ : "Enter Journals A-Z",
	ENTER_REFWORKS : "Enter RefWorks",
	EXPAND_BIB_HOLDINGS : "Expand Bib Holdings",
	EXPAND_BIB_ITEM : "Expand Bib Item",
	
	GOTO_PAGE : "Go To Page",
	
	HOLD : "Hold",
	
	PLAY_FILM : "Play Film",
	PLAY_VIDEO : "Play Video",
	POLK_LIBRARY : "Polk Library",
	POPOUT_TAB : "Popout Tab",
	POPOUT_SOURCE : "Popout Source",
	
    OPEN_FACET : "Open Facet Options",
    OPEN_INTERNET_LINK : "Open Internet Link",
    OPEN_TAB : "Open Tab",
    OPEN_TITLE : "Open Title",
    OPEN_TYPE_ICON : "Open Type Icon",
	QUESTION_POINT : "Question Point",
	
    RECALL : "Recall",
    REMOVE_ESHELF : "Remove e-Shelf",
    REMOVE_FACET : "Remove Facet",
	
	SAVE_SEARCH : "Save Search",
	SCOPE_EVERYTHING : "Everything",
	SCOPE_ARTICLES : "Articles",
	SCOPE_OSHKOSH : "Oshkosh",
	SCOPE_UWSYSTEM : "UW System",
	SCOPE_UWDC : "UWDC",
	SEARCH_WEBSITE_SUG : "Search Website Suggestion",
	SEARCH_WEBSITE_MAN : "Search Website Manually",
    SEARCH_PRIMO_BASIC : "Search Primo Basic",
    SEARCH_PRIMO_ADVANCED : "Search Primo Advanced",
	SEND_TO : "Send To",
	SET_PREFERENCES : "Set Preferences",
	SIGNIN : "Sign In",
	SIGNOUT : "Sign Out",
	SORT_BY : "Sort By",
	SUBJECT_FULL : "Full",
	SUBJECT_RESEARCH_DB : "Databases",
	SUBJECT_BACKGROUND : "Background",
	SUBJECT_CAMPUS_RESOURCE : "Campus Resources",
	SUBJECT_EMC : "EMC",
	SUBJECT_GOVERNMENT : "Government",
	SUBJECT_ARCHIVES : "Archives",
	SUBJECT_NEWS : "News",
	SUBJECT_BOOKS : "Books",
	SUBJECT_FILMS : "Films",
	SUBJECT_FEATURED : "Featured",
	
	UB : "UB",
	
	VIEW_BIB_ITEM : "View Bib Item",
    VIEW_CITATIONS : "View Citations",
	VIEW_DATABASE_TUTORIAL : "View Database Tutorial",
	VIEW_DETAILS : "View Details",
	VIEW_FILM_INFO : "View Film Information",
	VIEW_FINDIT : "View Find It",
	VIEW_HELP : "View Help",
	VIEW_JOURNALS : "View Journals",
	VIEW_LOCATIONS : "View Locations",
	VIEW_MORE_BOOKS : "View More Bib Items",
	VIEW_MORE_DATABASES : "View More Databases",
	VIEW_MORE_FILMS : "View More Films on Demand",
	VIEW_MORE_NEWS : "View More News",
	VIEW_ONLINE : "View Online",
	VIEW_PAGE : "View Page",
	VIEW_RECOMMENDATIONS : "View Recommendations",
	VIEW_REQUESTS : "View Requests",
	VIEW_TUTORIAL : "View Tutorial",
	VERSIONS : 'Versions',

	
	
	// STANDARD FUNCTIONS BELOW =====================================================
	
	track_group_with_pageview : function(tracker) {
		var load_error = setTimeout(function(){
			tracker.set_dimension("dimension1", "Error: Timeout");
			tracker.pv(); // Register pageview
		},2000);
		jQuery.getJSON("http://www.uwosh.edu/library/ws/getAnalyticsUserGroup?alt=jsonp&callback=?",function(data){
			clearTimeout(load_error);
			load_error = null;
			tracker.set_dimension("dimension1", data.group);
			tracker.pv(); // Register pageview
		});
	},
	
	track_outbounds : function(tracker) {
		var self = this;
		jQuery("a").mousedown(function(e) {
			if (self.is_external(this.href) && (e.which == 1 || e.which == 2)) {
				data = '/outgoingLink/' + this.href.replace(/^http:\/\//, '');
				data = data.replace('www.remote.uwosh.edu/login?url=http://', 'proxy/');
				tracker.pv(data);
			}
		});
	},
	
	track_forms : function(tracker) {
		var self = this;
		jQuery("form").submit(function() {
			var id = this.id ? this.id + '/' : '' 
			var data = '/outgoingForm/' + id + self.remove_args(this.action);
			tracker.pv(data);
		});
	},
	
	
	category : function(additional) {
		var base = "UNKNOWN";
		if((this.is_localhost(this.get_url()) || this.is_website(this.get_url())) && (this.url_endswith('/library') || this.url_endswith('/library/'))) 
			base = this.CATEGORY_WEBSITE_HOME;
		else if(this.is_localhost(this.get_url()) || this.is_website(this.get_url()))
			base = this.CATEGORY_WEBSITE_OTHER;
		else if(this.is_primo(this.get_url()))
			base = this.CATEGORY_PRIMO;
			
		for (var i in additional)
			base += ' - ' + additional[i];
		return base;
	},
	
    scope : function(text) {
		var scopes = {'everything': this.SCOPE_EVERYTHING,
					  'articles': this.SCOPE_ARTICLES,
					  'oshkosh': this.SCOPE_OSHKOSH,
					  'system': this.SCOPE_UWSYSTEM,
					  'digital': this.SCOPE_UWDC }
		for (var i in scopes)
			if (text.toLowerCase().indexOf(i) > -1)
				return scopes[i];
    },
	
	clean_text : function (t) {
		c = { '&amp;' : '&' , '&lt;' : '<' , '&gt;' : '>' };
		return t.replace(/\(([A-Za-z\d]+)\)/g, "");
			//return t.replace( /[&][a-zA-Z0-9]*[;]/g, function(s) { return c[s]; } );
	},
	
	remove_args : function (u) {
		var p = u.split('?');
		if (this.is_proxy(u))
			return p[0] + '?' + p[1]
		return p[0]
	},
	
	url_contains : function (unique_target) {
		return (this.get_url().indexOf(unique_target) > -1)
	},
	
	url_endswith : function (arg) {
		return this.ends_with(this.get_url(),arg);
	},
	
	contains : function (string,ends) {
		return (string.indexOf(ends) != -1)
	},
	
	ends_with : function (string,ends) {
		return (string.indexOf(ends) + ends.length == string.length)
	},
	
	begins_with : function (string,begins) {
		return (begins == string.substring(0, begins.length)); 
	},
	
	get_url : function () {
		return document.location.href;
	},
	
	is_doit : function(url) {
		return this.begins_with(url,'http://polk')
	},
	
	is_same_origin : function(url) {
		return this.contains(url, document.location.host);
	},
	
	is_localhost : function(url) {
		return this.contains(url, 'localhost/');
	},
	
	is_website : function(url) {
		return this.contains(url,'://www.uwosh.edu/library');
	},
	
	is_proxy : function(url) {
		return this.contains(url,'://remote.uwosh.edu/');
	},
	
	is_voyager : function(url) {
		return this.contains(url,'://oshlib.wisconsin.edu/vwebv/');
	},
	
	is_alma : function(url) {
		return this.contains(url,'ALMA_PLACEHOLDER.edu');
	},
	
	is_primo : function(url) {
		return this.contains(url,'hosted.exlibrisgroup.com');
	},
	
	is_external : function(url) {
		if (this.is_doit(url) || this.is_voyager(url) || this.is_alma(url) || this.is_primo(url) || this.is_same_origin(url))
			return false;
		return true;
	},
	
}


var pas = PolkAnalyticStandards; // Minified Access Point