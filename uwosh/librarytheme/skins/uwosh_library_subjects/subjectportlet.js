var schema = (("https:" == document.location.protocol) ? "https://" : "http://");
var LIBRARY_ROOT = schema + "www.uwosh.edu/library";
var LIBRARY_ROOT_NONE_SECURE = "http://www.uwosh.edu/library";
var BIBID_LINK = 'http://oshlib.wisconsin.edu/vwebv/holdingsInfo?bibId=';
var DEFINED_SUBJECT = '';
var SUBJECT_GENERATED_TEMPLATE = ''+
	'<div id="pl-subject">'+
		'<a class="pl-heading subject-title" href="{SUBJECT_HREF}">'+
	    	'<h2>Library Resources</h2>'+
	    	'<h3>For {SUBJECT_TITLE}</h3>'+
		'</a>'+
	'</div>'+
	'<div id="pl-news-feed">'+
		'<ul class="pl-news-feed"></ul>'+
	'</div>'+
	'<div id="pl-search"></div>'+
	'<div id="pl-research-databases">'+
		'<h3><a class="pl-heading" href="{SECTION_HREF}">{SECTION_TITLE}</a></h3>'+
		'<ul class="pl-journals"></ul>'+
		'<ul class="pl-books"></ul>'+
		'<ul class="pl-primary"></ul>'+
	'</div>'+
	'<div id="pl-reference">'+
		'<h3><a class="pl-heading" href="{SECTION_HREF}">{SECTION_TITLE}</a></h3>'+
	'</div>'+
	'<div id="pl-emc">'+
		'<h3><a class="pl-heading" href="{SECTION_HREF}">{SECTION_TITLE}</a></h3>'+
	'</div>'+
	'<div id="pl-government">'+
		'<h3><a class="pl-heading" href="{SECTION_HREF}">{SECTION_TITLE}</a></h3>'+
	'</div>'+
	'<div id="pl-archives">'+
		'<h3><a class="pl-heading" href="{SECTION_HREF}">{SECTION_TITLE}</a></h3>'+
	'</div>'+
	'<div id="pl-campus-resources">'+
		'<h3><a class="pl-heading" href="{SECTION_HREF}">{SECTION_TITLE}</a></h3>'+
	'</div>'+
	'<div id="pl-films">'+
		'<h3><a class="pl-heading" href="{SECTION_HREF}">{SECTION_TITLE}</a></h3>'+
	'</div>'+
	'<div id="pl-new-books">'+
		'<h3><a class="pl-heading" href="{SECTION_HREF}">New Books: {SECTION_TITLE}</a></h3>'+
		'<ul class="pl-new-books"></ul>'+
	'</div>'+
	''+
	'';

var LibrarySubject = {
	
	ROOT_ID : '#pl-guide',
	USE_SUBJECT_TITLE : '{SUBJECT_TITLE}',
	USE_SUBJECT_HREF : '{SUBJECT_HREF}',
	USE_SECTION_TITLE : '{SECTION_TITLE}',
	USE_SECTION_HREF : '{SECTION_HREF}',
	USE_LIBRARY_ROOT : '{LIBRARY_HREF}',
	generated : false,
	subject : null,
	limit : {},
	
	run : function(complete) {
		
		try {
			var self = this;
			LibrarySubjectDAO.get(function(subject){
				self.subject = subject;
				
				if(jQuery.isEmptyObject(subject))
					return; // No response, halt
					
				try{ self.handle_research(); } catch(e){ }
				try{ self.handle_reference(); } catch(e){}
				try{ self.handle_emc(); } catch(e){}
				try{ self.handle_government(); } catch(e){}
				try{ self.handle_archives(); } catch(e){}
				try{ self.handle_campus_resources(); } catch(e){}
				try{ self.handle_news_feed(); } catch(e){}
				try{ self.handle_new_books(); } catch(e){ console.log(e); }
				try{ self.handle_films(); } catch(e){}
				try{ self.handle_featured_db(); } catch(e){}
				
				try{ self.handle_all_tags(); } catch(e){} // LAST
				jQuery(self.ROOT_ID).show(); // no errors, show portlet
                self._limitor();
				self._resize_elements();
				complete();
			});
		} catch(e) {
			// do nothing, we fail silently on others sites.
		}
		
	},
	
	handle_research : function() {
		this._put_links_in('ul.pl-journals',this.subject['journal_links']);
		this._put_links_in('ul.pl-books',this.subject['books_links']);
		this._put_links_in('ul.pl-primary',this.subject['primary_sources_links']);
		this._handle_section_tags('#pl-research-databases',this.subject['research_databases_heading']);
	},
	
	handle_reference : function() {
		this._check_section('#pl-reference',this.subject['reference_background_links']);
		this._put_links_in('ul.pl-reference',this.subject['reference_background_links']);
		this._handle_section_tags('#pl-reference',this.subject['reference_background_heading']);
	},
	
	handle_emc : function() {
		this._check_section('#pl-emc',this.subject['emc_links']);
		this._put_links_in('ul.pl-emc',this.subject['emc_links']);
		this._handle_section_tags('#pl-emc',this.subject['emc_heading']);
	},
	
	handle_government : function() {
		this._check_section('#pl-government',this.subject['government_information_links']);
		this._put_links_in('ul.pl-government',this.subject['government_information_links']);
		this._handle_section_tags('#pl-government',this.subject['government_information_heading']);
	},
	
	handle_archives : function() {
		this._check_section('#pl-archives',this.subject['archives_links']);
		this._put_links_in('ul.pl-archives',this.subject['archives_links']);
		this._handle_section_tags('#pl-archives',this.subject['archives_heading']);
	},
	
	handle_campus_resources : function() {
		this._check_section('#pl-campus-resources',this.subject['campus_resources_links']);
		this._put_links_in('ul.pl-campus-resources',this.subject['campus_resources_links']);
		this._handle_section_tags('#pl-campus-resources',this.subject['campus_resources_heading']);
	},
	
	handle_news_feed : function() {
		var limit = (this.generated ? 1 : 100);
		this._check_section('#pl-news-feed', this.subject['news_links']);
		this._put_links_in('ul.pl-news-feed', this.subject['news_links'],limit);
		this._handle_section_tags('#pl-news-feed', this.subject['news_heading']);
	},
	
	handle_new_books : function() {
		this._check_section('#pl-new-books',this.subject['voyager_links']);
		this._put_books_in('ul.pl-new-books',this.subject['voyager_links']);
		this._handle_section_tags('#pl-new-books',this.subject['voyager_heading']);
	},
	
	handle_films : function() {
		this._check_section('#pl-films',this.subject['films_on_demand_link']);
		var item = this.subject['films_on_demand_link'];
		//if (!this.isHttpsConnection()) {
			var a = jQuery('<a>').attr({
				'href': item['url'],
				'title': item['title']
			}).html(jQuery('<img>').attr({
				'src': item['image'],
				'class': 'cover-image'
			}));
			jQuery(a).append(jQuery('<img>').attr({
				'src': LIBRARY_ROOT_NONE_SECURE + '/++resource++uwosh.libraryguides.images/pop-play.png',
				'class': 'play-image'
			}));
			jQuery('ul.pl-films').append(jQuery('<li>').append(a));
		//}
		this._handle_section_tags('#pl-films',this.subject['films_on_demand_heading']);
	},
	
	handle_featured_db : function() {
		this._put_links_in('ul.pl-featured-db',this.subject['featured_database']);
	},
	
	handle_all_tags : function() {
		var html = jQuery(this.ROOT_ID).html();
		html = html.replace(new RegExp(this.USE_SUBJECT_TITLE, 'g'), this.subject['information']['title']);
		html = html.replace(new RegExp(this.USE_SUBJECT_HREF, 'g'), this.subject['information']['url']);
		html = html.replace(new RegExp(this.USE_LIBRARY_ROOT, 'g'), LIBRARY_ROOT);
		jQuery(this.ROOT_ID).html(html);
	},
	
	_handle_section_tags : function(selector,heading) {
		var html = jQuery(selector).html();
		html = html.replace(new RegExp(this.USE_SECTION_TITLE, 'g'), heading['title']);
		html = html.replace(new RegExp(this.USE_SECTION_HREF, 'g'), heading['url']);
		jQuery(selector).html(html);
	},
	
	_put_links_in : function (ul,list,limit) {
		if(list == null) return;
		if (limit == null) limit = 999;
		for (var i = 0; i < list.length && i < limit; i++) {
			var item = list[i];
			var a = jQuery('<a>').attr({'href':item['url'], 'title':item['description']}).html(item['title']);
			jQuery(ul).append(jQuery('<li>').append(a));
		}
	},
	
	_put_books_in : function(ul,list) {
		if(list == null) return;
		for (var l in list) {
			var item = list[l];
			var img = jQuery('<img>').addClass('syndetic-image').attr({'data-isbn':item['isbn'],
																	   'title':item['title'],
																	   'src':'http://www.uwosh.edu/library/++resource++uwosh.librarytheme.images/loading_preview.png'});
			var a = jQuery('<a>').attr('href',BIBID_LINK+item['bibId']).append(img);
			jQuery(ul).append(jQuery('<li>').append(a));
		}
	},
	
	_check_section : function(id,content) {
		var show = false;
		for (var key in content) show = true;
		if (!show) jQuery(id).hide();
	},
	
	isHttpsConnection : function() {
		var url = document.location.href;
		if(url.indexOf('https://') != -1 )
			return true;
		return false;
	},
	
	_resize_elements : function() {
		if (jQuery('#portal-column-one div.portletWrapper').width() < 175) {
			jQuery('#pl-guide h2').addClass('small');
			jQuery('#pl-guide h3').addClass('small');
		}
	},
    
    _limitor : function() {
        var self = this;
        for (var k in self.limit) {
            if (self.limit.hasOwnProperty(k)) {
                console.log(k + " " + self.limit[k]);
                jQuery('#' + k).find('li').each(function(i,t){
                    console.log(i);
                    if (i >= self.limit[k])
                        jQuery(t).hide();
                });
            }
        }
    }
    
	
}

var LibrarySubjectDAO = {

	service : LIBRARY_ROOT + '/ws/getSubjectGuide',
	parameters : '?url=' + document.location.href + '&alt=jsonp&callback=?',
	
	get : function(c) {
		this.check_for_subject();
		jQuery.getJSON(this.service + this.parameters, function(d){
			c(d);
		});
	},
	
	check_for_subject : function(){
		if (DEFINED_SUBJECT != '')
			this.parameters  = '?subject_id=' + DEFINED_SUBJECT + '&alt=jsonp&callback=?';
	}
	
}

jQuery(document).ready(function(){
	
    var cache_prevention = function(c) {
        var date = new Date();
        return '' + date.getFullYear() + date.getMonth() + date.getDate();
    }
	
	if (jQuery('#pl-guide').hasClass('pl-generated')) {
		jQuery('#pl-guide').html(SUBJECT_GENERATED_TEMPLATE);
		LibrarySubject.generated = true;
	}
	
	// Pre-run
	jQuery('head').append('<link href="'+LIBRARY_ROOT+'/subjectportlet.css?cache='+cache_prevention()+'" rel="stylesheet" type="text/css">');
	
	// Run Subject Calls; Callback post-run
	LibrarySubject.run(function(){
		jQuery('head').append('<script type="text/javascript" src="'+LIBRARY_ROOT+'/++resource++uwosh.librarytheme.javascripts/syndetic.js?cache='+cache_prevention()+'"></script>');
	});
	
});

//============================================================================================
// Analytics Below
//============================================================================================





