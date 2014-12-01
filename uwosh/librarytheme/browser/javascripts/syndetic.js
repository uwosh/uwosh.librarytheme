/* 
 * Syndetic Image Loader and Toolset.
 * Copyright 2012, David Hietpas
 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *   http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* 
 * If this javascript is included on any page, it will automatically handle all book previews if the 
 * following format is followed:
 * 
 *    <img class="syndetic-image" data-isbn="1234567890" src="loading-image.jpg" alt="book preview" />
 *    
 * To turn off this, add SyndeticImages._auto_sweep = false; after this file is loaded.
 * 
 * This script can also be called to get the cover image manually via some other javascript.  It can
 * handle a single book, array of books or a JSON object.
 * 
 */


var SyndeticImagesThread = function(src, type, callback) {
	
	var self = this;
	self.found = false;
	self.source = "";
	self.attempts = 0;
	self.MAX_ATTEMPTS = 30; // ~3 seconds
	
	try {
		self.img = new Image();
		self.img.src = src;
	}
	catch(e){
		self.stop(); // fail safe
	}
	
	self.thread = setInterval(function(){
		if(src == '')
			self.stop();
		else if(self.img.height > 10){
			self.found = true;
			self.source = src;
			self.stop();
		}
		else if(self.attempts > self.MAX_ATTEMPTS) 
			self.stop();
		
		self.attempts++;
	},100);
	
	self.stop = function(){
		clearInterval(self.thread);
		self.thread = null;
		callback(self.found,self.source);
	}

}

 
var SyndeticImages = {
	
	url : 'http://www.syndetics.com/index.aspx',
	clientcode : null,
	fake_cover_titles_on : false,
	cover_img_css : {'width':'45px','border':'1px solid black'},
	cover_span_css : {'font-size':'5px','position':'absolute','width':'35px','margin':'6px','word-wrap':'break-word','line-height':'1.1em'},
	cover_a_css : {'display':'inline-block'},
	overlay_on : false,
	css_overlay_electronic : {'position':'absolute','margin-top':'-17px','text-align':'right'},
	cover_overlay_img : "http://www.uwosh.edu/library/images/misc/cover-image-electronic.png",
	no_cover_textclass : 'no-cover-available',
	no_cover_url_list : [{'url':'http://polk.uwosh.edu/shared/images/fake_cover_image_1.jpg','color':'#cccccc'},
						 {'url':'http://polk.uwosh.edu/shared/images/fake_cover_image_2.jpg','color':'#333333'},
						 {'url':'http://polk.uwosh.edu/shared/images/fake_cover_image_3.jpg','color':'#333333'},
						 {'url':'http://polk.uwosh.edu/shared/images/fake_cover_image_4.jpg','color':'#222222'},
						 {'url':'http://polk.uwosh.edu/shared/images/fake_cover_image_5.jpg','color':'#dddddd'},
						 {'url':'http://polk.uwosh.edu/shared/images/fake_cover_image_6.jpg','color':'#444444'},
						 {'url':'http://polk.uwosh.edu/shared/images/fake_cover_image_7.jpg','color':'#333333'},
						 {'url':'http://polk.uwosh.edu/shared/images/fake_cover_image_8.jpg','color':'#dddddd'},
						 {'url':'http://polk.uwosh.edu/shared/images/fake_cover_image_9.jpg','color':'#cccccc'}],
	
	_auto_sweep : true,
	_show_captions: false,
	_captions : null,
	_backgroundColor : null,
	size : null,
	
	SMALL : 'SC.GIF',
	MEDIUM : 'MC.GIF',
	
	init : function(params) {
		for (key in params)
			this[key] = params[key];
	},
	
	/**
	 * Will screenSweep the screen and transform any img tag with class="syndetic-image" with
	 * a data-isbn="" or data-gisbn="" attribute.  This is very general, it can work on many platforms.
	 * 
	 * Example:
	 *    <img class="syndetic-image" data-isbn="1234567890" src="loading-image.jpg" alt="book preview" />
	 * 
	 */
	screenSweep : function() {
		var hook = this;
		jQuery('img.syndetic-image').each(function(i,element){
			try {
				jQuery(element).css(hook.cover_img_css);
				var isbn = jQuery(element).attr('data-isbn') || '1234'; // fake fall back.
				var title = jQuery(element).attr('title') || 'A';


				var bowker = hook.getSyndeticImage(isbn);
				var bowkerThread = null, googleThread = null;
				
				bowkerThread = new SyndeticImagesThread(bowker, "BOWKER", function(found, source){
					if (found) 
						jQuery(element).attr("src", source);
					else {
						var google = hook.getGoogleImage(isbn);
						googleThread = new SyndeticImagesThread(google, "GOOGLE", function(found, source){
							if (found) 
								jQuery(element).attr("src", source);
							else 
								hook.replaceImgWithFake(element); // FINAL FALL BACK
						});
					}
				});


				// Parent anchor
				if(jQuery(element).parent().is('a')) {
					jQuery(element).parent().css(hook.cover_a_css);
					if(hook.overlay_on)
						hook.addElectronicOverlay(element,title);
				}

			} catch(e){ 
				alert(e);
			}
		});
	},
	
	
	addElectronicOverlay : function(element,title) {
		if (title.indexOf("[electronic resource]") != -1 || title.indexOf("[computer resource]") != -1) {
			var ebook_icon = jQuery('<img>').attr('src',this.cover_electric_img);
			var div = jQuery('<div>').append(ebook_icon).css(this.css_cover_electronic);
			jQuery(div).css('width',jQuery(element).width());
			jQuery(element).parent().append(div);
		}
	},
	
	
	switchToSSL : function(src) {
		var url = document.location.href;
		if(url.indexOf('https://') != -1 )
			return src.replace('http://','https://');
		return src;
	},
	
	
	isHttpsConnection : function() {
		var url = document.location.href;
		if(url.indexOf('https://') != -1 )
			return true;
		return false;
	},


	getSyndeticImage : function(isbn,size,caption,color) {
		if (isbn == null) 
			isbn = "__MISSING_ISBN__";
		if (size != null) 
			this.size = size;
		if (caption != null) {
			this._show_captions = true;
			this._captions = caption;
		}
		if (color != null) 
			this._backgroundColor = color;
		return this._getSyndeticImage(isbn);
	},
	
	
	getGoogleImage : function(isbn) {
		var url = 'http://books.google.com/books?jscmd=viewapi&callback=?&bibkeys=';
		if (isbn.indexOf('ISBN:') == -1) isbn = 'ISBN:' + isbn;
		var google_cover_url = '';
		jQuery.getJSON(url + isbn, function(data){
			try {
				google_cover_url = data[isbn]['thumbnail_url'];
			} catch(e){}
		});
		return google_cover_url;
	},
	
	
	_getSyndeticImage : function(isbn) {
		var url = this.url;
		url += '?client=' + this.clientcode;
		url += '&isbn=' + this._format_isbn(isbn);
		
		if(this._show_captions)
			url += '&showCaptionBelow=t&caption=' + this._captions;
		if(this._backgroundColor != null)
			url += '&bgColor=' + this._backgroundColor;
			
		return url;
	},
	
	
	getDynamicNoCover : function (title) {
		try {
			var abc = ['C', 'F', 'I', 'L', 'O', 'R', 'U', 'W', 'Z'];
			for (var i = 0; i < this.no_cover_url_list.length; i++) 
				if (title[0].toUpperCase() <= abc[i]) 
					return this.no_cover_url_list[i];
			return this.no_cover_url_list[0];
		} catch(e){
			return this.no_cover_url_list[0]; // defensive
		}
		
	},
	
	
	replaceImgWithFake : function(element) {
		var title = jQuery(element).attr('title');
		var data = this.getDynamicNoCover(title);
		var getTitle = function() {
			var tmp = title.replace(/\[.*\]/g, "").split(':')[0]; //subcategory removal
			tmp = tmp.split('/')[0].substring(0,45); // Author removal
			return tmp.length < 35 ? tmp + "..." : tmp;
		}
		
		var PX = function(px){
			return parseInt(px.replace('px',''));
		}
		
		if(jQuery(element).parent().is('a') && title != null && this.fake_cover_titles_on) {
			var span = jQuery('<span>').addClass(this.no_cover_textclass).html(getTitle())
					   .css({'color':data.color});
			jQuery(span).css(this.cover_span_css);
			jQuery(element).parent().prepend(span);
			
			if (jQuery(element).width() != PX(this.cover_span_css['width'])+10) {
				this.cover_span_css['width'] = (jQuery(element).width() - 10) + 'px';
				jQuery(span).css(this.cover_span_css);
			}
		}
		jQuery(element).attr('src', data.url);
	},
	
	/**
	 * Cleans and formats ISBN and adds the Image Type
	 * @param {String} isbn
	 */
	_format_isbn : function(isbn) {
		return jQuery.trim(isbn.toUpperCase().replace(/[^0-9X]/g,'')) + '/' + this.size;
	},
	
	isAutoSweep : function() {
		return this._auto_sweep;
	}
	
}


/**
 * To turn stop auto-sweep, include the following snippet 
 * somewhere after the syndetic.js file. 
 * 
 *   SyndeticImages._auto_sweep = false;
 */
jQuery(document).ready(function(){
	
	var args = {'clientcode':'uowioshkosh' , 'size':SyndeticImages.SMALL, 'fake_cover_titles_on':true }
	
	if (SyndeticImages.isAutoSweep()) {
		SyndeticImages.init(args);
		SyndeticImages.screenSweep();
	}
	
});

