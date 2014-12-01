<script type="text/javascript">
    var gaJsHost = (("https:" == document.location.protocol) ? "https://ssl." : "http://www.");
    document.write(unescape("%3Cscript src='" + gaJsHost + "google-analytics.com/ga.js' type='text/javascript'%3E%3C/script%3E"));
</script>
<script type="text/javascript">
// Compressed by http://jscompress.com/
// Uncompressed here http://www.uwosh.edu/library/++resource++uwosh.librarytheme.javascripts/ga_analytics.js

jq(document).ready(function() {
	
	// Tracking Settings
	if (SiteUtil.getCurrentURL().indexOf("uwosh.edu/library") != -1) {
		GAT.setPageTracker("UA-25321418-1"); // Production Analytics
		GAT.consoleOut(false);
	}
	else {
		GAT.setPageTracker("UA-9924341-1"); // Test Analytics
		GAT.consoleOut(false);
		console.log("TEST ANALYTIC TRACKING");
	}
	
	// -- START ----------------
	// We are not tracking IP Addresses.  Each individual is placed into a user group.  The user group data tracked 
	// is as follows:  External, Instructional, Internal Public, Internal Staff.
		var usergroup_timeout = setTimeout(function(){
			GAT.setCustomVar(1, "Location", "JS Error", 3); // Set if response takes to long.
		},2000);
		jq.getJSON("http://www.uwosh.edu/library/ws/getAnalyticsUserGroup?alt=jsonp&callback=?",function(data){
			GAT.setCustomVar(1, "Location", data.group, 3);
			clearTimeout(usergroup_timeout);
			usergroup_timeout = null;
		});
	// -- END ----------------
	
	// Mobile VS Full
	GAT.setCustomVar(2, "Platform", "Fullsite", 3);
	
	// Extend GAT, add a few extra helpers and definitions.
	jq.extend(GAT, {
				
		trackExternal: function(u,p) {
			if (SiteUtil.isLocalLink(u) || SiteUtil.isOpac(u) || SiteUtil.isDOITCloud(u)) 
				return; // local link
			u = p + u.replace(/^http:\/\//, '');
			u = u.replace('www.remote.uwosh.edu/login?url=http://', 'proxy/');
			GAT.trackPageview(u);
		},
		
		getCategory : function (text) {
			var root = "Site";
			if(SiteUtil.isHomepage()) 
				root = "Home";
			for (var t in text)
				root += ' - ' + text[t];
			return root;
		},
		
        scope : function(data) {
            // THIS MUST MIRROR THE PRIMO ANALYTIC VALUES!!!!!!!!!!!!!!!!
            if (data.toLowerCase().indexOf('everything') > -1)
                return 'Everything';
            if (data.toLowerCase().indexOf('articles') > -1)
                return 'Articles';
            if (data.toLowerCase().indexOf('oshkosh') > -1)
                return 'Oshkosh';
            if (data.toLowerCase().indexOf('system') > -1)
                return 'UW System';
            if (data.toLowerCase().indexOf('digital') > -1)
                return 'UWDC';
        },
		
		getSubjectCategory : function () {
			var subject = jq.trim(jq('#lib_marker_context_id').text()); // Breadcrumb marker
			var f = (jq('.gat_main_subject').length == 0) ? GAT.SUBJECT_FULL + ' ' : '';
			return 'Subject - ' + subject + " - " + f;
		},
		
		cleanChars : function (t) {
			c = { '&amp;' : '&' , '&lt;' : '<' , '&gt;' : '>' };
  			return t.replace( /[&][a-zA-Z0-9]*[;]/g, function(s) {  return c[s]; } );
		},
		
		VIEW_PAGE : "View Page",
		VIEW_FILM_INFO : "View Film Information",
		VIEW_BIB_ITEM : "View Bib Item",
		VIEW_JOURNALS : "View Journals",
		VIEW_MORE_NEWS : "View More News",
		VIEW_MORE_BOOKS : "View More Bib Items",
		VIEW_MORE_FILMS : "View More Films on Demand",
		VIEW_MORE_DATABASES : "View More Databases",
		VIEW_DATABASE_TUTORIAL : "View Database Tutorial",
		VIEW_TUTORIAL : "View Tutorial",
		
		ENTER_OPAC : "Enter OPAC",
		ENTER_ILLIAD : "Enter ILLiad",
		ENTER_DATABASE : "Enter Database",
		ENTER_PRIMO : "Enter Primo",
		ENTER_JOURNALS_AZ : "Enter Journals A-Z",
		ENTER_REFWORKS : "Enter RefWorks",
		
		SEARCH_WEBSITE_SUG : "Search Website Suggestion",
		SEARCH_WEBSITE_MAN : "Search Website Manually",
		SEARCH_PRIMO : "Search Primo Basic",
		
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
		
		// Misc definitions
		SET_PREFERENCES : "Set Preferences",
		CLEAR_PREFERENCES : "Clear Preferences",
		ENTER_CHAT : "Enter Chat",
		LIBRARY_ACCOUNT : "My Account",
		LIBRARY_ACCOUNT_RENEW : "My Account - Renew",
		LIBRARY_ACCOUNT_REQUESTS : "My Account - Requests",
		LIBRARY_ACCOUNT_ESHELF : "My Account - e-Shelf",
		QUESTION_POINT : "Question Point",
		ADVANCED : "Advanced",
		PLAY_FILM : "Play Film",
		PLAY_VIDEO : "Play Video"
		

		
	});
	
	
    // Setep Handlers
    for (var k in GAHandlers)
        if(GAHandlers.hasOwnProperty(k))
            GAHandlers[k].call();
			
	YoutubeTracking.genericVideoViews();

});


/* -----------------------------------------------------------------------------------------------------------------------
 * Website Tracking Below
 */
var GAHandlers = {
	
	genericExternalLinks : function() {
		jq("a").click(function() { GAT.trackExternal(this.href, '/outgoingLink/'); });
	},
	
	
	genericFormSubmissions : function() {
		jq("form").submit(function() {
			var id = this.id ? this.id + '/' : '' 
		  	GAT.trackExternal(SiteUtil.stripArgsProxySafe(this.action), '/outgoingForm/' + id);
		});
	},
	
	
	handleHeaderAndFooter : function() {
		var header = GAT.getCategory(['Header']);
		var footer = GAT.getCategory(['Footer']);
		
		// Hours Link
		GAT.track('.gat_hours', 'click', header, GAT.VIEW_PAGE, 'Hours');
		GAT.test('.gat_hours', 'click', 'HEADER', 'Hours link in site header');
		
		// Footer ViewPage Links
		GAT.track('.library_footer a:not([class])', 'click', footer, GAT.VIEW_PAGE, function(t){
			 return jq(t).text().replace(/\s\s+/g, ' ');
		});
		GAT.test('.library_footer a:not([class])', 'click', 'FOOTER', 'All link in footer not Ask A Librian');
		
		// Footer non-ViewPage Links
		GAT.track('.gat_footer_primo', 'click', footer, GAT.ENTER_PRIMO);
		GAT.test('.gat_footer_primo', 'click', 'FOOTER SPECIAL', 'Primo Account Link');
		GAT.track('.gat_footer_illiad', 'click', footer, GAT.ENTER_ILLIAD);
		GAT.test('.gat_footer_illiad', 'click', 'FOOTER SPECIAL', 'Illiad Account Link');
		GAT.track('.gat_footer_worldcat', 'click', footer, GAT.ENTER_DATABASE);
		GAT.test('.gat_footer_worldcat', 'click', 'FOOTER SPECIAL', 'WorldCat Link');
		GAT.track('.gat_footer_refworks', 'click', footer, GAT.ENTER_REFWORKS);
		GAT.test('.gat_footer_refworks', 'click', 'FOOTER SPECIAL', 'Refworks Link');
		
		// Chat & Ask-A-Librarian handled else where.
	},
	
	
	handleSearchBarEverything: function(){
		var everything = GAT.getCategory(['Search Bar', 'AB&M']);
		
		// Searchbox Input
		GAT.track('.gat_everything_search', 'submit', everything, GAT.SEARCH_PRIMO, function(t){
			var e = jq(t).find('option:selected');
			return GAT.scope(jq(e).text());
		});
		GAT.test('.gat_everything_search', 'submit', 'AB&M TAB', 'Search Submission');
		
		// Advanced Search
		GAT.track('.gat_everything_advanced', 'click', everything, GAT.ENTER_PRIMO, GAT.ADVANCED);
		GAT.test('.gat_everything_advanced', 'click', 'AB&M TAB', 'Advance Search Click');
	
		// Old Catalog
		GAT.track('.gat_everything_opac', 'click', everything, GAT.ENTER_OPAC, GAT.ADVANCED);
		GAT.test('.gat_everything_opac', 'click', 'AB&M TAB', 'OPAC Click');
		
		// Beyond UW System
		GAT.track('.gat_everything_ill', 'click', everything, GAT.VIEW_PAGE, 'Interlibrary Loan');
		GAT.test('.gat_everything_ill', 'click', 'AB&M TAB', 'Beyound UW - Interlibrary Loan Click');
		
		GAT.track('.gat_everything_wc', 'click', everything, GAT.ENTER_DATABASE, 'WorldCat');
		GAT.test('.gat_everything_wc', 'click', 'AB&M TAB', 'Beyound UW - Worldcat Click');
		
		GAT.track('.gat_everything_more', 'click', everything, GAT.VIEW_PAGE, 'Borrowing from other libraries');
		GAT.test('.gat_everything_more', 'click', 'AB&M TAB', 'Beyound UW - Not sure Click');
		
		// Journals by Search
		GAT.track('.gat_everything_journal', 'click', everything, GAT.ENTER_JOURNALS_AZ);
		GAT.test('.gat_everything_journal', 'click', 'AB&M TAB', 'Journals by Title Click');
		
		// Jump to subject
		GAT.track('#fieldset-tab1 .gat_everything_subjects li>a', 'click', everything, GAT.VIEW_PAGE, function(t){
			return jq(t).attr('title');
		});
		GAT.test('#fieldset-tab1 .gat_everything_subjects li>a', 'click', 'AB&M TAB - SUBJECTS', 'Collections by Subject List');
		
		// Jump to database
		GAT.track('#fieldset-tab1 .gat_everything_db li>a', 'click', everything, GAT.ENTER_DATABASE, function(t){
			return jq(t).attr('title');
		});
		GAT.test('#fieldset-tab1 .gat_everything_db li>a', 'click', 'AB&M TAB - DATABASES', 'Research Database List');
		
		// Tutorials
		GAT.track('#fieldset-tab1 #polk-search-tutorial a', 'click', everything, GAT.VIEW_TUTORIAL,'Search@UW');
		GAT.test('#fieldset-tab1 #polk-search-tutorial a', 'click', 'AB&M TAB - TUTORIAL', 'Clicking Search@UW Tutorial');
		
		
	},
	
	
	handleSearchBarCourses: function(){
		var website = GAT.getCategory(['Search Bar', 'Website']);

		// Non-Javascript Search Form
		GAT.track('#library_autocomplete_nojs > form', 'submit', website, GAT.SEARCH_WEBSITE_MAN, function(t){
			return GAT.cleanChars(jq(t).find('option:selected').html());
		});
		GAT.test('#library_autocomplete_nojs > form', 'submit', 'NO-JS COURSE SEARCH', '');
		
		// When someone hits enter on auto-complete form.
		GAT.track('.gat_courses', 'submit', website, GAT.SEARCH_WEBSITE_MAN, "Courses & Services");
		GAT.test('.gat_courses', 'submit', 'MANUAL COURSE SEARCH', 'User hits enter in Course Search');
		
		// Track Analytics via Mouse Click
		GAT.track('#library_autocomplete_suggestions', 'click', website, GAT.SEARCH_WEBSITE_SUG, function(t,e){
			if (jq(e.target).is('a')) 
				return GAT.cleanChars(SiteUtil.mrClean(jq(e.target).text()));
			else 
				return "type=" + jq(e.target).attr('data-type') + 
				       "&amp;link=" + jq(e.target).attr('data-ga') + 
					   "&amp;rank=" + jq(e.target).attr('data-num');
		}, function(t,e){
			return jq(e.target).attr('data-num');
		}, function(t,e){
			if( !(jq(e.target).is('a') || jq(e.target).is('li')) ) 
				return false;
		});
		GAT.testManually('Course & Website Search: Select result with mouse.');
		
		// Track Analytics via Key Press
		GAT.track('#library_autocomplete input[type="text"]', 'keypress', website, GAT.SEARCH_WEBSITE_SUG, function(t,e){
			var element = jq('#library_autocomplete_suggestions .ac-selected');
			if (jq(element).is('a')) 
				return GAT.cleanChars(SiteUtil.mrClean(jq(element).text()));
			else 
				return "type=" + jq(element).attr('data-type') + 
				       "&amp;link=" + jq(element).attr('data-ga') + 
					   "&amp;rank=" + jq(element).attr('data-num');    
		}, function(t,e){
			return jq(e.target).attr('data-num');
		}, function(t,e){
			if(e.which != 13)
				return false;
		});
		GAT.testManually('Course & Website Search: Select result with keypress.');

	},
	
	
	handleHomepageMisc : function () {
		var news = GAT.getCategory(['News']);
		var featured = GAT.getCategory(['Featured']);
		var social = GAT.getCategory(['Social']);
		
		// News
		GAT.track('.gat_news_item', 'click', news, GAT.VIEW_PAGE, function(t){
			return SiteUtil.popBefore(jq(t).attr('title'));
		});
		GAT.test('.gat_news_item', 'click', 'HOME NEWS', 'User clicks news item on homepage.');
		GAT.track('.hp_news_heading > a', 'click', news, GAT.VIEW_PAGE, "View More News",1);
		GAT.test('.hp_news_heading > a', 'click', 'HOME NEWS', 'User clicks news heading.');
		GAT.track('#hp_news li:last-child > a', 'click', news, GAT.VIEW_PAGE, "View More News",0);
		GAT.test('#hp_news li:last-child > a', 'click', 'HOME NEWS', 'User clicks news bottom.');
		
		// Featured
		GAT.track('.gat_featured_item', 'click', featured, GAT .VIEW_PAGE, function(t){
			return jq(t).find('img').attr('alt');
		});
		GAT.test('.gat_featured_item', 'click', 'HOME FEATURED', 'User clicks feature on homepage.');
		
		// Featured Next
		GAT.track('.gat_featured_next', 'click', featured, "View More Featured");
		GAT.test('.gat_featured_next', 'click', 'HOME FEATURED', 'User clicks next feature on homepage.');

		// Social Links
		GAT.track('.gat_social_item', 'click', social, GAT.VIEW_PAGE, function(t){
			return jq(t).find('img').attr('alt');
		});
		GAT.test('.gat_social_item', 'click', 'HOME SOCIAL LINKS', 'User clicks social link on homepage.');

	},
	
	
	handleAllAskALibrarian : function () {
		var category = function(t) {
			if(jq('#library_header').has(t).length > 0)
				return GAT.getCategory(['Header','Ask A Librarian']);
			if(jq('.library_footer').has(t).length > 0)
				return GAT.getCategory(['Footer','Ask A Librarian']);
			return GAT.getCategory(['Ask A Librarian']);
		}

		// All Library Help Chats
		GAT.track('.gat_chat_lh','click', category, GAT.ENTER_CHAT, function(t){
			return jq(t).parent().attr('jid');
		});
		GAT.test('.gat_chat_lh', 'click', 'ASK A LIBRARIAN', 'Libraryh3lp Chats.');

		// All QuestionPoint Chats
		GAT.track('.gat_chat_qp','click', category, GAT.ENTER_CHAT, GAT.QUESTION_POINT);
		GAT.test('.gat_chat_qp', 'click', 'ASK A LIBRARIAN', 'QuestionPoint Chats.');

		// Image
		GAT.track('.gat_ask_img', 'click', category, GAT.VIEW_PAGE, "Ask A Librarian Image");
		GAT.test('.gat_ask_img', 'click', 'ASK A LIBRARIAN', 'Ask A Librarian Logo');

		// Links
		GAT.track('.gat_ask_link', 'click', category, GAT.VIEW_PAGE, function(t){ return jq(t).text(); });
		GAT.test('.gat_ask_link', 'click', 'ASK A LIBRARIAN', 'Ask a Librarian Sub-Links');

	},
	
	
	handleMyLibraryLinks : function () {
		var acc = GAT.getCategory(['My Library','Accounts']);
		var pre = GAT.getCategory(['My Library','Preferences']);
		var aud = GAT.getCategory(['My Library',jq('.gat_audience_type').text()]);
		var sub = GAT.getCategory(['My Library',jq('.gat_subject_type').text()]);
		
		// Accounts
		GAT.track('.gat_mylibrary_accounts', 'click', acc, GAT.VIEW_PAGE, function(t){
			return GAT.cleanChars(jq(t).text());
		});
		GAT.test('.gat_mylibrary_accounts', 'click', 'MY LIBRARY', 'Accounts heading link');
		GAT.track('.gat_mylibrary_polk', 'click', acc, GAT.ENTER_PRIMO, GAT.LIBRARY_ACCOUNT);
		GAT.test('.gat_mylibrary_polk', 'click', 'MY LIBRARY', 'Accounts primo link');
		GAT.track('.gat_mylibrary_ill', 'click', acc, GAT.ENTER_ILLIAD, GAT.LIBRARY_ACCOUNT);
		GAT.test('.gat_mylibrary_ill', 'click', 'MY LIBRARY', 'Accounts illiad link');
		
		GAT.track('.gat_mylibrary_polk_renew', 'click', acc, GAT.ENTER_PRIMO, GAT.LIBRARY_ACCOUNT_RENEW);
		GAT.test('.gat_mylibrary_polk_renew', 'click', 'MY LIBRARY', 'Accounts primo renew link');
		GAT.track('.gat_mylibrary_polk_requests', 'click', acc, GAT.ENTER_PRIMO, GAT.LIBRARY_ACCOUNT_REQUESTS);
		GAT.test('.gat_mylibrary_polk_requests', 'click', 'MY LIBRARY', 'Accounts primo request link');
		GAT.track('.gat_mylibrary_polk_eshelf', 'click', acc, GAT.ENTER_PRIMO, GAT.LIBRARY_ACCOUNT_ESHELF);
		GAT.test('.gat_mylibrary_polk_eshelf', 'click', 'MY LIBRARY', 'Accounts primo eshelf link');
		
		GAT.track('.gat_mylibrary_ill_renew', 'click', acc, GAT.ENTER_ILLIAD, GAT.LIBRARY_ACCOUNT_RENEW);
		GAT.test('.gat_mylibrary_ill_renew', 'click', 'MY LIBRARY', 'Accounts illiad renew link');
		
		GAT.track('.gat_mylibrary_refworks', 'click', acc, GAT.ENTER_REFWORKS);
		GAT.test('.gat_mylibrary_refworks', 'click', 'MY LIBRARY', 'Accounts refworks link');
		
	
		// QuickLinks Set
		GAT.track('.gat_mylibrary_set', 'submit', pre, GAT.SET_PREFERENCES, function(t){
			return jq(t).find('select[name="audience"] option:selected').html() + ', ' 
						      + jq(t).find('select[name="subject"] option:selected').html();
		});
		GAT.test('.gat_mylibrary_set', 'submit', 'MY LIBRARY', 'Set Preferences');

		// QuickLinks Clear
		GAT.track('.gat_mylibrary_clear', 'submit', pre, GAT.CLEAR_PREFERENCES);
		GAT.test('.gat_mylibrary_clear', 'submit', 'MY LIBRARY', 'Clear Preferences');
		
		// Audience Links
		GAT.track('.gat_audience_link', 'click', aud, GAT.VIEW_PAGE, function(t){ return jq(t).attr('title'); });
		GAT.test('.gat_audience_link', 'click', 'MY LIBRARY', 'Audience Link');
		
		// Subject Links
		GAT.track('.gat_subjects_link', 'click', sub, GAT.VIEW_PAGE, function(t){ return jq(t).attr('title'); });
		GAT.test('.gat_subjects_link', 'click', 'MY LIBRARY', 'Subject Link');
		GAT.track('.gat_subjects_db_link', 'click', sub, GAT.ENTER_DATABASE, function(t){ return jq(t).attr('title'); });
		GAT.test('.gat_subjects_db_link', 'click', 'MY LIBRARY', 'Subject Database Link');
		GAT.track('.gat_subjects_opac', 'click', sub, GAT.ENTER_OPAC, function(t){ return jq(t).attr('title'); });
		GAT.test('.gat_subjects_opac', 'click', 'MY LIBRARY', 'Subject Book Links');
		
	},
	
	
	handleSubjectGuides : function () {
		if (!SiteUtil.isSubjectGuides()) return;
		
		var background = GAT.getSubjectCategory() + GAT.SUBJECT_BACKGROUND;
		var db = GAT.getSubjectCategory() + GAT.SUBJECT_RESEARCH_DB;
		var campus_resources = GAT.getSubjectCategory() + GAT.SUBJECT_CAMPUS_RESOURCE;
		var emc = GAT.getSubjectCategory() + GAT.SUBJECT_EMC;
		var gov = GAT.getSubjectCategory() + GAT.SUBJECT_GOVERNMENT;
		var archives = GAT.getSubjectCategory() + GAT.SUBJECT_ARCHIVES;
		var news = GAT.getSubjectCategory() + GAT.SUBJECT_NEWS;
		var books = GAT.getSubjectCategory() + GAT.SUBJECT_BOOKS;
		var films = GAT.getSubjectCategory() + GAT.SUBJECT_FILMS;
		var featured = GAT.getSubjectCategory() + GAT.SUBJECT_FEATURED;
		
		// Research Databases - Note: also covers database sub page
		GAT.track('.gat_subject_search', 'submit', db, GAT.SEARCH_ARTICLES);
		GAT.test('.gat_subject_search', 'submit', 'SUBJECT GUIDE', 'Quick Article Search');
		GAT.track('.gat_research_link', 'click', db, GAT.ENTER_DATABASE, function(t){ return jq(t).attr('title'); });
		GAT.test('.gat_research_link', 'click', 'SUBJECT GUIDE', 'Research Databases');
		GAT.track('.gat_research_top_link', 'click', db, GAT.VIEW_MORE_DATABASES, function(t){ return jq(t).attr('title'); },1);
		GAT.test('.gat_research_top_link', 'click', 'SUBJECT GUIDE', 'Research Database Heading Link');
		GAT.track('.gat_research_bot_link', 'click', db, GAT.VIEW_MORE_DATABASES, function(t){ return jq(t).attr('title'); },0);
		GAT.test('.gat_research_bot_link', 'click', 'SUBJECT GUIDE', 'Research Database Bottom Link');

		// Background - Note: also covers background sub page
		GAT.track('.gat_background_link', 'click', background, GAT.ENTER_DATABASE, function(t){ return jq(t).attr('title'); });
		GAT.test('.gat_background_link', 'click', 'SUBJECT GUIDE', 'Reference & Background Link');
		GAT.track('.gat_background_top_link', 'click', background, GAT.VIEW_MORE_DATABASES, function(t){ return jq(t).attr('title'); },1);
		GAT.test('.gat_background_top_link', 'click', 'SUBJECT GUIDE', 'Reference & Background Heading Link');
		GAT.track('.gat_background_bot_link', 'click', background, GAT.VIEW_MORE_DATABASES, function(t){ return jq(t).attr('title'); },0);
		GAT.test('.gat_background_bot_link', 'click', 'SUBJECT GUIDE', 'Reference & Background Bottom Link');
		
		// Campus Resource - Note: also covers campus resources sub page
		GAT.track('.gat_campus_link', 'click', campus_resources, GAT.VIEW_PAGE, function(t){ return jq(t).attr('title'); });
		GAT.test('.gat_campus_link', 'click', 'SUBJECT GUIDE', 'Campus Resource Bottom Link');
		GAT.track('.gat_campus_top_link', 'click', campus_resources, GAT.VIEW_MORE_DATABASES, function(t){ return jq(t).attr('title'); },1);
		GAT.test('.gat_campus_top_link', 'click', 'SUBJECT GUIDE', 'Campus Resource Heading Link');
		GAT.track('.gat_campus_bot_link', 'click', campus_resources, GAT.VIEW_MORE_DATABASES, function(t){ return jq(t).attr('title'); },0);
		GAT.test('.gat_campus_bot_link', 'click', 'SUBJECT GUIDE', 'Campus Resource Bottom Link');
		
		// Journals
		GAT.track('.gat_journal_link', 'click', db, GAT.VIEW_JOURNALS);
		GAT.test('.gat_journal_link', 'click', 'SUBJECT GUIDE', 'Journals Link');
		
		// EMC
		GAT.track('.gat_emc_link', 'click', emc, GAT.VIEW_PAGE, function(t){ return jq.trim(jq(t).text()); });
		GAT.test('.gat_emc_link', 'click', 'SUBJECT GUIDE', 'EMC Links');
		
		// GOV
		GAT.track('.gat_gov_link', 'click', gov, GAT.VIEW_PAGE, function(t){ return jq.trim(jq(t).text()); });
		GAT.test('.gat_gov_link', 'click', 'SUBJECT GUIDE', 'Gov Links');
		
		// Archives
		GAT.track('.gat_arch_link', 'click', archives, GAT.VIEW_PAGE, function(t){ return jq.trim(jq(t).text()); });
		GAT.test('.gat_arch_link', 'click', 'SUBJECT GUIDE', 'Archives Links');
		
		// News
		GAT.track('.gat_news_link', 'click', news, GAT.VIEW_PAGE, function(t){ return jq(t).attr('title'); });
		GAT.test('.gat_news_link', 'click', 'SUBJECT GUIDE', 'News Link');
		GAT.track('.gat_news_top_link', 'click', news, GAT.VIEW_MORE_NEWS, null ,1);
		GAT.test('.gat_news_top_link', 'click', 'SUBJECT GUIDE', 'News Heading Link');
		GAT.track('.gat_news_bot_link', 'click', news, GAT.VIEW_MORE_NEWS, null ,0);
		GAT.test('.gat_news_bot_link', 'click', 'SUBJECT GUIDE', 'News Bottom Link');
		
		// Books
		var subcat = jq('.gat_books_top_link').text();
		GAT.track('.gat_books_top_link', 'click', books, GAT.VIEW_MORE_BOOKS, subcat ,1);
		GAT.test('.gat_books_top_link', 'click', 'SUBJECT GUIDE', 'Books Heading Link');
		GAT.track('.gat_books_bot_link', 'click', books, GAT.VIEW_MORE_BOOKS, subcat ,0);
		GAT.test('.gat_books_bot_link', 'click', 'SUBJECT GUIDE', 'Books Bottom Link');
		GAT.track('.gat_books_img', 'click', books, GAT.ENTER_OPAC, subcat ,1);
		GAT.test('.gat_books_img', 'click', 'SUBJECT GUIDE', 'Books cover image link');
		GAT.track('.gat_books_link', 'click', books, GAT.ENTER_OPAC, subcat ,0);
		GAT.test('.gat_books_link', 'click', 'SUBJECT GUIDE', 'Books text link');
		
		// Films
		jq('.gat_films_top_link, .gat_films_bot_link, .gat_films_info_link').unbind();
		GAT.track('.gat_films_top_link', 'click', films, GAT.VIEW_MORE_FILMS, null, 1);
		GAT.test('.gat_films_top_link', 'click', 'SUBJECT GUIDE', 'Films Heading Link');
		GAT.track('.gat_films_bot_link', 'click', films, GAT.VIEW_MORE_FILMS, null, 0);
		GAT.test('.gat_films_bot_link', 'click', 'SUBJECT GUIDE', 'Films Bottom Link');
		GAT.track('.gat_films_info_link', 'click', films, GAT.VIEW_FILM_INFO);
		GAT.test('.gat_films_info_link', 'click', 'SUBJECT GUIDE', 'Films Title Link');
		GAT.track('.gat_films_play_link', 'click', films, GAT.PLAY_FILM);
		GAT.test('.gat_films_play_link', 'click', 'SUBJECT GUIDE', 'Films Play Click');
		
		// Featured
		GAT.track('.gat_featured_link', 'click', featured, GAT.ENTER_DATABASE);
		GAT.test('.gat_featured_link', 'click', 'SUBJECT GUIDE', 'Featured database link');
	},
	

	handleAllPaneWindow : function() {
		// This handler is difficult, it covers many contexts and is dynamically generated.
		
		var markers = {'.gat_research_pane':GAT.SUBJECT_RESEARCH_DB,
					   '.gat_background_pane':GAT.SUBJECT_BACKGROUND,
					   '.gat_emc_pane':GAT.SUBJECT_EMC,
					   '.gat_government_pane':GAT.SUBJECT_GOVERNMENT,
					   '.gat_archives_pane':GAT.SUBJECT_ARCHIVES,
					   '.gat_campus_pane':GAT.SUBJECT_CAMPUS_RESOURCE,
					   '.gat_featured_pane':GAT.SUBJECT_FEATURED
					  }
		
		var category = function(t,e) {
			if (jq('#fieldset-tab1 .library_search_hidden').is(':visible')) 
				return GAT.getCategory(['Search Bar', 'Articles']);
			else if (jq('#fieldset-tab2 .library_search_hidden').is(':visible')) 
				return GAT.getCategory(['Search Bar', 'Books And Videos']);
			else if (SiteUtil.isSubjectGuides()) {
				var category = GAT.getSubjectCategory();
				for (var i in markers) 
					if (jq(t).is(i)) 
						return category + markers[i];
				return category + "Unknown"; // Breadcrumb marker
			}
		};
		var action = function(t,e) {
			if(jq(e.target).is('a.gat_database_tutorial'))
				return GAT.VIEW_TUTORIAL;
			if(jq(e.target).is('.gat_database_heading > a'))
				return GAT.ENTER_DATABASE;
		}
		var label = function(t,e){
			return jq.trim(jq(e.target).text());
		};
		var value = function(t,e){
			return 1;
		};
		var proceed = function(t,e){
			return jq(e.target).is('.gat_database_heading > a') || jq(e.target).is('a.gat_database_tutorial');
		};
		
		GAT.track('#pane-tipper > #pane-body', 'click', category, action, label, value, proceed);
		GAT.testManually('Database Window: All inner links.');
		
	},
	
	handleGuidedSearchBuilder : function() {
		var gsb = GAT.getCategory(['Guided Search Builder']);
		
		GAT.track('#results > #search_results', 'click', gsb, 
		function(t){
			if(jq(t).text().toLowerCase().indexOf('@uw') > -1)
				return GAT.ENTER_PRIMO;
			return GAT.ENTER_DATABASE;
		},
		function(t){
			if(jq(t).text().toLowerCase().indexOf('@uw') > -1)
				return "Search Primo Guided";
			return "Academic Search Complete";
		});
		GAT.test('#results > #search_results', 'click', 'GSB', 'Guided search builder search');
		
	}
	
	
	
	

} //end GAHandlers





/* -----------------------------------------------------------------------------------------------------------------------
 * Youtube Tracking... Beware of demons below!!!
 */
var films_played = false; // used for weird films on demand issue
var YoutubeTracking = {
	
	genericVideoViews : function() {
		GAT.testManually('Youtube Embeds');
		
		// ONLY FOR PLONE!!!! PLONE RE-RENDERS OBJECT TAGS...
		jQuery('object').each(function(i,t){
	        var id = 'video' + Math.floor(Math.random()*1000000);
	        jQuery(t).attr('id',id);
			jQuery(t).attr('data-played','0');
			
            if(typeof jQuery(t).attr('data') !== 'undefined')
                jQuery(t).attr('data', jQuery(t).attr('data') + '&amp;enablejsapi=1&amp;playerapiid=' + id);
	        
	        jQuery(t).find('param[name=src]').each(function(i,param){
	            var val = jQuery(param).attr('value') + "&amp;enablejsapi=1&amp;playerapiid="+id;
	            jQuery(param).attr('value',val);
	        });
	        jQuery(t).find('embed').each(function(i,param){
	            var src = jQuery(param).attr('src') + "&amp;enablejsapi=1&amp;playerapiid="+id;
	            jQuery(param).attr('src',src);
	        });
	    });
	},
	
	ripYoutubeID : function (url) {
		//http://www.youtube.com/v/g6yHM4eV0_s?
		try {
			url = url.split('/v/')[1];
			return url.split('?')[0];
		} catch (e) { return '0'; }
	},
		
	
	youtubeAdapter : function(id) {
	    var ended = 0, playing = 1, paused = 2;
	    _youtube_callback[id] = function(state) {
	        if (state == playing)
				YoutubeTracking.setupAnalyticData(id);
	    };
	    var element = document.getElementById(id);
	    element.addEventListener("onStateChange", "_youtube_callback."+id);
	},
	
	setupAnalyticData : function(id) {
		var video = jq('#'+id);
	    if(jQuery(video).attr('data-played') == '0') {
			var youtube_id = YoutubeTracking.ripYoutubeID(jq(video).attr('data'));
			jq.getJSON('http://gdata.youtube.com/feeds/api/videos/'+youtube_id+'?v=2&alt=json-in-script&callback=?',function(data){
				var category = "";
				jq('#portal-breadcrumbs a').each(function(i,t){
					if (i > 0)
						category += jq(t).text() + ' - ';
				});
				category = category.substring(0, category.length-3);
				var title = data.entry.title.$t;
				GAT.trackEvent(category,GAT.PLAY_VIDEO,title);
			});
		}
		jQuery('#'+id).attr('data-played','1');
	},
}
// onYouTubePlayerReady is required by Youtube API, I pipe it to my adapter.
var onYouTubePlayerReady = YoutubeTracking.youtubeAdapter;
var _youtube_callback = {};


</script>

<script>
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-6634319-1', 'uwosh.edu');
  ga('send', 'pageview');

</script>

