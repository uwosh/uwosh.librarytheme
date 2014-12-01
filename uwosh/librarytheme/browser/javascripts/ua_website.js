// Create Tracker
	var ua = ua = new UniversalAnalyticsTracker('polk', {
		'ua_account_live': 'UA-50701418-1',
		'ua_matchurl_live': 'uwosh.edu',
		'ua_account_test': 'UA-50701418-1',
		'defined_dimensions':{'dimension2':'Fullsite'},
		'auto_pageview': false,
	});

// Polk Standard Tracking
	pas.track_group_with_pageview(ua); // Track Standard Pageview
	pas.track_outbounds(ua);
	pas.track_forms(ua);


// HEADER ========================================================================================
	ua.set_test_group('Header');
	ua.ev('.gat_hours', 'click', pas.category(['Header']), pas.VIEW_PAGE, 'Hours');

// FOOTER ========================================================================================
	ua.set_test_group('Footer');
	var footer = pas.category(['Footer']);
	ua.ev('.library_footer a:not([class])', 'click', footer, pas.VIEW_PAGE, function(t){
		 return jq(t).text().replace(/\s\s+/g, ' ');
	});
	
	// Footer specific links
	ua.ev('.gat_footer_primo', 'click', footer, pas.ENTER_PRIMO);
	ua.ev('.gat_footer_illiad', 'click', footer, pas.ENTER_ILLIAD);
	ua.ev('.gat_footer_worldcat', 'click', footer, pas.ENTER_DATABASE);
	ua.ev('.gat_footer_refworks', 'click', footer, pas.ENTER_REFWORKS);

// AB&M TAB ======================================================================================
	var everything = pas.category(['Search Bar', 'AB&M']);
	
	ua.set_test_group('ABM Search');
	ua.ev('.gat_everything_search', 'submit', everything, pas.SEARCH_PRIMO, function(t){
		var text = jq(t).find('option:selected').text();
        if (text.toLowerCase().indexOf('articles') > -1)
            return 'Articles';
        if (text.toLowerCase().indexOf('oshkosh') > -1)
            return 'Oshkosh';
        if (text.toLowerCase().indexOf('system') > -1)
            return 'UW System';
        if (text.toLowerCase().indexOf('digital') > -1)
            return 'UWDC';
		return 'Everything';
	});
	
	ua.set_test_group('ABM Links');
	ua.ev('.gat_everything_advanced', 'click', everything, pas.ENTER_PRIMO, pas.ADVANCED); // Advanced Search
	ua.ev('.gat_everything_opac', 'click', everything, pas.ENTER_OPAC, pas.ADVANCED); // Old Catalog
	ua.ev('.gat_everything_ill', 'click', everything, pas.VIEW_PAGE, 'Interlibrary Loan'); // Beyond UW System
	ua.ev('.gat_everything_wc', 'click', everything, pas.ENTER_DATABASE, 'WorldCat'); // Beyond UW System
	ua.ev('.gat_everything_more', 'click', everything, pas.VIEW_PAGE, 'Borrowing from other libraries'); // Beyond UW System
	ua.ev('.gat_everything_journal', 'click', everything, pas.ENTER_JOURNALS_AZ); // Journals by Search
	ua.ev('#fieldset-tab1 #polk-search-tutorial a', 'click', everything, pas.VIEW_TUTORIAL,'Search@UW'); // Tutorials
	
	ua.set_test_group('ABM Subjects');
	ua.ev('#fieldset-tab1 .gat_everything_subjects li>a', 'click', everything, pas.VIEW_PAGE, function(t){
		return jq(t).attr('title');
	}); // Jump to subject
	
	ua.set_test_group('ABM Databases');
	ua.ev('#fieldset-tab1 .gat_everything_db li>a', 'click', everything, pas.ENTER_DATABASE, function(t){
		return jq(t).attr('title');
	}); // Jump to database
	
// COURSE RESERVES AND WEBSITE TAB ================================================================
	var website = pas.category(['Search Bar', 'Website']);
	ua.manual_test_group('Course Reserves & Website Tab');

	// Non-Javascript Search Form
	ua.ev('#library_autocomplete_nojs > form', 'submit', website, pas.SEARCH_WEBSITE_MAN, function(t){
		return pas.clean_text(jq(t).find('option:selected').html());
	});
	
	// When someone hits enter on auto-complete form.
	ua.ev('.gat_courses', 'submit', website, pas.SEARCH_WEBSITE_MAN, "Courses & Services");
	
	// Track Analytics via Mouse Click
	ua.ev('#library_autocomplete_suggestions', 'click', website, pas.SEARCH_WEBSITE_SUG, function(t,e){
		if (jq(e.target).is('a')) 
			return pas.clean_text(jq(e.target).text());
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
	
	// Track Analytics via Key Press
	ua.ev('#fieldset-tab2 input[type="text"]', 'keydown', website, pas.SEARCH_WEBSITE_SUG, function(t,e){
		var element = jq('#library_autocomplete_suggestions .ac-selected');
		if (jq(element).is('a')) 
			return pas.clean_text(jq(element).text());
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
	
// HOMEPAGE NEWS & FEATURED & SOCIAL ======================================================================================
	var news = pas.category(['News']);
	var featured = pas.category(['Featured']);
	var social = pas.category(['Social']);
	
	// News
	ua.set_test_group('News');
	ua.ev('.gat_news_item', 'click', news, pas.VIEW_PAGE, function(t){
		return jq(t).attr('title');
	});
	ua.ev('.hp_news_heading > a', 'click', news, pas.VIEW_PAGE, "View More News",1);
	ua.ev('#hp_news li:last-child > a', 'click', news, pas.VIEW_PAGE, "View More News",0);
	
	// Featured
	ua.set_test_group('Featured');
	ua.ev('.gat_featured_item', 'click', featured, pas.VIEW_PAGE, function(t){
		return jq(t).find('img').attr('alt');
	});
	
	// Featured Next
	ua.ev('.gat_featured_next', 'click', featured, "View More Featured");

	// Social Links
	ua.set_test_group('Social');
	ua.ev('.gat_social_item', 'click', social, pas.VIEW_PAGE, function(t){
		return jq(t).find('img').attr('alt');
	});

// ASK A LIBRARIAN ======================================================================================
	ua.set_test_group('Ask A Librarian');
	var category = function(t) {
		if(jq('#library_header').has(t).length > 0)
			return pas.category(['Header','Ask A Librarian']);
		if(jq('.library_footer').has(t).length > 0)
			return pas.category(['Footer','Ask A Librarian']);
		return pas.category(['Ask A Librarian']);
	}

	// All Library Help Chats
	ua.ev('.gat_chat_lh','click', category, pas.ENTER_CHAT, function(t){
		return jq(t).parent().attr('jid');
	}, null,false);
	ua.ev('.gat_chat_qp','click', category, pas.ENTER_CHAT, pas.QUESTION_POINT); // All QuestionPoint Chats
	ua.ev('.gat_ask_img', 'click', category, pas.VIEW_PAGE, "Ask A Librarian Image"); // Image
	ua.ev('.gat_ask_link', 'click', category, pas.VIEW_PAGE, function(t){ return jq(t).text(); }); // Links

// MY LIBRARY ======================================================================================
	var ml_accounts = pas.category(['My Library','Accounts']);
	var ml_preferences = pas.category(['My Library','Preferences']);
	var ml_audience = pas.category(['My Library',jq('.gat_audience_type').text()]);
	var ml_subjects = pas.category(['My Library',jq('.gat_subject_type').text()]);
	
	// Accounts
	ua.set_test_group('MyLibrary Accounts');
	ua.ev('.gat_mylibrary_accounts', 'click', ml_accounts, pas.VIEW_PAGE, function(t){
		return pas.clean_text(jq(t).text());
	});
	ua.ev('.gat_mylibrary_polk', 'click', ml_accounts, pas.ENTER_PRIMO, pas.LIBRARY_ACCOUNT);
	ua.ev('.gat_mylibrary_ill', 'click', ml_accounts, pas.ENTER_ILLIAD, pas.LIBRARY_ACCOUNT);
	ua.ev('.gat_mylibrary_polk_renew', 'click', ml_accounts, pas.ENTER_PRIMO, pas.LIBRARY_ACCOUNT_RENEW);
	ua.ev('.gat_mylibrary_polk_requests', 'click', ml_accounts, pas.ENTER_PRIMO, pas.LIBRARY_ACCOUNT_REQUESTS);
	ua.ev('.gat_mylibrary_polk_eshelf', 'click', ml_accounts, pas.ENTER_PRIMO, pas.LIBRARY_ACCOUNT_ESHELF);
	ua.ev('.gat_mylibrary_ill_renew', 'click', ml_accounts, pas.ENTER_ILLIAD, pas.LIBRARY_ACCOUNT_RENEW);
	ua.ev('.gat_mylibrary_refworks', 'click', ml_accounts, pas.ENTER_REFWORKS);
	
	// Quicklinks
	ua.set_test_group('MyLibrary Links');
	ua.ev('.gat_mylibrary_set', 'submit', ml_preferences, pas.SET_PREFERENCES, function(t){
		return jq(t).find('select[name="audience"] option:selected').html() + ', ' 
					      + jq(t).find('select[name="subject"] option:selected').html();
	});
	ua.ev('.gat_mylibrary_clear', 'submit', ml_preferences, pas.CLEAR_PREFERENCES);		
	ua.ev('.gat_audience_link', 'click', ml_audience, pas.VIEW_PAGE, function(t){ return jq(t).attr('title'); });
	ua.ev('.gat_subjects_link', 'click', ml_subjects, pas.VIEW_PAGE, function(t){ return jq(t).attr('title'); });
	ua.ev('.gat_subjects_db_link', 'click', ml_subjects, pas.ENTER_DATABASE, function(t){ return jq(t).attr('title'); });
	ua.ev('.gat_subjects_opac', 'click', ml_subjects, pas.ENTER_OPAC, function(t){ return jq(t).attr('title'); });

// MY LIBRARY ======================================================================================
	if(jQuery('body').hasClass('section-subjects')) {
		ua.set_test_group('Subject Guides');
		var get_subject = function () {
			var subject = jq.trim(jq('#lib_marker_context_id').text()); // Breadcrumb marker
			var f = (jq('.gat_main_subject').length == 0) ? pas.SUBJECT_FULL + ' ' : '';
			return 'Subject - ' + subject + " - " + f;
		}
		var subject_background = get_subject() + pas.SUBJECT_BACKGROUND;
		var subject_db = get_subject() + pas.SUBJECT_RESEARCH_DB;
		var subject_campus_resources = get_subject() + pas.SUBJECT_CAMPUS_RESOURCE;
		var subject_emc = get_subject() + pas.SUBJECT_EMC;
		var subject_gov = get_subject() + pas.SUBJECT_GOVERNMENT;
		var subject_archives = get_subject() + pas.SUBJECT_ARCHIVES;
		var subject_news = get_subject() + pas.SUBJECT_NEWS;
		var subject_books = get_subject() + pas.SUBJECT_BOOKS;
		var subject_films = get_subject() + pas.SUBJECT_FILMS;
		var subject_featured = get_subject() + pas.SUBJECT_FEATURED;
		
		// Research Databases - Note: also covers database sub page
		ua.ev('.gat_subject_search', 'submit', subject_db, pas.SEARCH_ARTICLES);
		ua.ev('.gat_research_link', 'click', subject_db, pas.ENTER_DATABASE, function(t){ return jq(t).attr('title'); });
		ua.ev('.gat_research_top_link', 'click', subject_db, pas.VIEW_MORE_DATABASES, function(t){ return jq(t).attr('title'); },1);
		ua.ev('.gat_research_bot_link', 'click', subject_db, pas.VIEW_MORE_DATABASES, function(t){ return jq(t).attr('title'); },0);

		// Background - Note: also covers background sub page
		ua.ev('.gat_background_link', 'click', subject_background, pas.ENTER_DATABASE, function(t){ return jq(t).attr('title'); });
		ua.ev('.gat_background_top_link', 'click', subject_background, pas.VIEW_MORE_DATABASES, function(t){ return jq(t).attr('title'); },1);
		ua.ev('.gat_background_bot_link', 'click', subject_background, pas.VIEW_MORE_DATABASES, function(t){ return jq(t).attr('title'); },0);
		
		// Campus Resource - Note: also covers campus resources sub page
		ua.ev('.gat_campus_link', 'click', subject_campus_resources, pas.VIEW_PAGE, function(t){ return jq(t).attr('title'); });
		ua.ev('.gat_campus_top_link', 'click', subject_campus_resources, pas.VIEW_MORE_DATABASES, function(t){ return jq(t).attr('title'); },1);
		ua.ev('.gat_campus_bot_link', 'click', subject_campus_resources, pas.VIEW_MORE_DATABASES, function(t){ return jq(t).attr('title'); },0);
		
		// Journals
		ua.ev('.gat_journal_link', 'click', subject_db, pas.VIEW_JOURNALS);
		
		// EMC & Gov & Archives
		ua.ev('.gat_emc_link', 'click', subject_emc, pas.VIEW_PAGE, function(t){ return jq.trim(jq(t).text()); });
		ua.ev('.gat_gov_link', 'click', subject_gov, pas.VIEW_PAGE, function(t){ return jq.trim(jq(t).text()); });
		ua.ev('.gat_arch_link', 'click', subject_archives, pas.VIEW_PAGE, function(t){ return jq.trim(jq(t).text()); });
		
		// News
		ua.ev('.gat_news_link', 'click', subject_news, pas.VIEW_PAGE, function(t){ return jq(t).attr('title'); });
		ua.ev('.gat_news_top_link', 'click', subject_news, pas.VIEW_MORE_NEWS, null ,1);
		ua.ev('.gat_news_bot_link', 'click', subject_news, pas.VIEW_MORE_NEWS, null ,0);
		
		// Books
		var subcat = jq('.gat_books_top_link').text();
		ua.ev('.gat_books_top_link', 'click', subject_books, pas.VIEW_MORE_BOOKS, subcat ,1);
		ua.ev('.gat_books_bot_link', 'click', subject_books, pas.VIEW_MORE_BOOKS, subcat ,0);
		ua.ev('.gat_books_img', 'click', subject_books, pas.ENTER_OPAC, subcat ,1);
		ua.ev('.gat_books_link', 'click', subject_books, pas.ENTER_OPAC, subcat ,0);
		
		// Films
		jq('.gat_films_top_link, .gat_films_bot_link, .gat_films_info_link').unbind();
		ua.ev('.gat_films_top_link', 'click', subject_films, pas.VIEW_MORE_FILMS, null, 1);
		ua.ev('.gat_films_bot_link', 'click', subject_films, pas.VIEW_MORE_FILMS, null, 0);
		ua.ev('.gat_films_info_link', 'click', subject_films, pas.VIEW_FILM_INFO);
		ua.ev('.gat_films_play_link', 'click', subject_films, pas.PLAY_FILM);
		
		// Featured
		ua.ev('.gat_featured_link', 'click', subject_featured, pas.ENTER_DATABASE);
	}

// PANE WINDOWS ================================================================
// This handler is difficult, it covers many contexts and is dynamically generated.
	var markers = {'.gat_research_pane':pas.SUBJECT_RESEARCH_DB,
				   '.gat_background_pane':pas.SUBJECT_BACKGROUND,
				   '.gat_emc_pane':pas.SUBJECT_EMC,
				   '.gat_government_pane':pas.SUBJECT_GOVERNMENT,
				   '.gat_archives_pane':pas.SUBJECT_ARCHIVES,
				   '.gat_campus_pane':pas.SUBJECT_CAMPUS_RESOURCE,
				   '.gat_featured_pane':pas.SUBJECT_FEATURED
				  }
	var get_subject = function () {
			var subject = jq.trim(jq('#lib_marker_context_id').text()); // Breadcrumb marker
			var f = (jq('.gat_main_subject').length == 0) ? pas.SUBJECT_FULL + ' ' : '';
			return 'Subject - ' + subject + " - " + f;
		}
	ua.ev('#pane-tipper > #pane-body', 'click', 
		function(t,e) {
			console.log('PANE CLICK');
			if (jq('#fieldset-tab1 .library_search_hidden').is(':visible')) 
				return pas.category(['Search Bar', 'AB&M']);
			else if (jQuery('body').hasClass('section-subjects')) {
				var category = get_subject();
				for (var i in markers) 
					if (jq(t).is(i)) 
						return category + markers[i];
				return category + "Unknown"; // Breadcrumb marker
			}
		}, 
		function(t,e) {
			if(jq(e.target).is('a.gat_database_tutorial'))
				return pas.VIEW_TUTORIAL;
			if(jq(e.target).is('.gat_database_heading > a'))
				return pas.ENTER_DATABASE;
		}, 
		function(t,e) {
			return jq.trim(jq(e.target).text());
		}, 
		1,
		null,
		function(t,e) {
			return jq(e.target).is('.gat_database_heading > a') || jq(e.target).is('a.gat_database_tutorial');
		}
	);
	ua.manual_test_group('All links inside window tooltips.');
	
// GUIDED SEARCH BUILDER ================================================================
	var gsb = pas.category(['Guided Search Builder']);
	
	ua.ev('#results > #search_results', 'click', gsb, 
		function(t){
			if(jq(t).text().toLowerCase().indexOf('@uw') > -1)
				return pas.ENTER_PRIMO;
			return pas.ENTER_DATABASE;
		},
		function(t){
			if(jq(t).text().toLowerCase().indexOf('@uw') > -1)
				return "Search Primo Guided";
			return "Academic Search Complete";
		}
	);
	


// YOUTUBE TRACKING ================================================================
	var films_played = false; // used for weird films on demand issue
	var YoutubeTracking = {
		
		genericVideoViews : function() {
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
					ua.ev(category,pas.PLAY_VIDEO,title);
				});
			}
			jQuery('#'+id).attr('data-played','1');
		},
	}
	// onYouTubePlayerReady is required by Youtube API, I pipe it to my adapter.
	var onYouTubePlayerReady = YoutubeTracking.youtubeAdapter;
	var _youtube_callback = {};
	YoutubeTracking.genericVideoViews(); // Init

