/* 
 * AutoCompletion for Site Search and Course Pages.
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

 


var solrutil = {

	getTermCode : function(term) {
		var season = term.replace(/([0-9\s-_]+)/g, "").toLowerCase();
		var year = term.replace(/([A-Za-z\s-_]+)/g, "").toLowerCase();
		var termCode = (parseInt(year)-1945).toString(); // same as coursepages code
		
		if (season == "fall")
		    termCode += "0";
		if (season == "winter")
		    termCode += "3";
		if (season == "spring") {
		    termCode -= 1;
		    termCode += "5";
		}
		if (season == "summer") {
		    termCode -= 1;
		    termCode += "8";
		}
		if (termCode.length == 3){
			termCode = "0" + termCode;
		}
		return termCode;
	},
	
	getTermFriendly : function (termCode) {
		year = parseInt(termCode.substring(0,3), 10) + 1945;
		offset = termCode[3];
		season = "Fall";
		if (offset == 3)
			season = "Winter";
		else if (offset == 5)
			season = "Spring";
		else if (offset == 8)
			season = "Summer";
		if (season != "Fall") 
			year++;
		return season + " " + year;
	},
	
	appendResult : function(selector,data,value,value_full,actions) {
		var l = document.createElement('li');
		
		for(var d in data)
			jq(l).attr(data[d].name,data[d].value);
		for(var a in actions)
			jq(l).bind(actions[a].event,actions[a].func);
		jq(l).html(value);
		jq(l).attr('title',value_full);
		jq(l).addClass('ac-selectable');
		jq(selector+'-ul').append(l);
	},
	
	appendSet : function(selector,id,legend,legend_link) {
		var u = document.createElement('ul');
		var f = document.createElement('fieldset');
		var l = document.createElement('legend');
		var a = document.createElement('a');
		jq(a).attr({'href':legend_link,'data-url':legend_link});
		jq(a).addClass('ac-selectable');
		jq(a).html(legend);
		jq(u).attr('id',id + '-ul');
		jq(l).attr('id',id + '-legend');
		jq(l).html(a);
		jq(f).addClass('solr-ac-set-marker');
		jq(f).attr('id',id);
		jq(f).append(l);
		jq(f).append(u);
		jq(selector).append(f);
	},
	
	appendError : function(selector,title,messages) {
		var s = document.createElement('span');
		jq(s).addClass('error-title');
		jq(s).html(title + '<br />');
		var u = document.createElement('ul');
		jq(u).addClass('error-msg');
		for (var i in messages){
			var li = document.createElement('li');
			jq(li).html(messages[i]);
			jq(u).append(li);
		}
		jq(selector).html(s)
		jq(selector).append(u);
	},
	
	clearSet : function(selector) {
		jq(selector).html('');
	},
	
	removeSet : function(selector) {
		jq(selector).remove();
	},
	
	removeAllSet : function() {
		jq('.solr-ac-set-marker').remove();
	},
	
	paganationRight : function(selector,val,action) {
		var tmp = document.createElement('div');
		jq(tmp).addClass('ac-button-r');
		jq(tmp).html(val);
		jq(tmp).click(action);
		jq(selector).append(tmp);
		
		var tmp = document.createElement('div');
		jq(tmp).css({'clear':'both'});
		jq(selector).append(tmp);
	},
	
	paganationLeft : function(selector,val,action) {
		jq(selector).remove('ac-button-l-blank');
		var tmp = document.createElement('div');
		jq(tmp).addClass('ac-button-l');
		jq(tmp).html(val);
		jq(tmp).click(action);
		jq(selector).prepend(tmp);
		jq(selector + ' > legend').prependTo(jq(selector));
	},
	
	paganationLeftBlank : function(selector) {
		var tmp = document.createElement('div');
		jq(tmp).addClass('ac-button-l-blank');
		jq(tmp).html('&nbsp;');
		jq(selector).prepend(tmp);
		jq(selector + ' > legend').prependTo(jq(selector));
	},
	
	createCourseString : function (data) {
		var s = data.subject;
		var c = data.course_number;
		var d = solrutil.shortenText(data.title, 25);
		if (data.topic != '')
			d = solrutil.shortenText(data.topic, 25);
		var i = data.instructor;
		return solrutil.shortenText(solrutil.mrClean(s + " " + c + " : " + d + " - " + i),70);
	},
	
	createCourseFullString : function (data) {
		var s = data.subject;
		var c = data.course_number;
		var d = data.title;
		if (data.topic != '')
			d = data.topic;
		var i = data.instructor;
		var sec = data.section;
		return solrutil.mrClean(s + " " + c + " : " + d + " - " + i);
	},
	
	createWebsiteString : function (data) {
		var t = solrutil.shortenText(data.title,35); // limit 70, add with 30 below.
		var p = solrutil.shortenText(solrutil.inParent(data.parent_area),30); // limit 70, add with 35 above.
		var d = solrutil.styledString(p,{'color':'#777777'});
		return t + " " + d;
	},
	
	createWebsiteFullString : function (data) {
		var t = data.title;
		return t + solrutil.inParent(data.parent_area);
	},
	
	inParent : function(parent_area){
		if (parent_area.indexOf("Polk Library") == -1)
			return " in " + parent_area;
		return "";
	},
	
	createResultMessage : function (title,start,defaultsize,total) {
		var end = defaultsize + start;
		if (end > total)
			end = total;
		return title + " (" + total + ")";
	},
	
	styledString : function (text,styling) {
		var m = document.createElement('marker');
		var s = document.createElement('span');
		jq(s).html(text);
		jq(s).css(styling);
		jq(m).append(s);
		return jq(m).html(); //toString()
	},
	
	mrClean : function (str) {
		str = str.replace(/\(([A-Za-z]+)\)/g, "");
		str = str.replace(/,/g,", ");
		return str;
	},
	
	shortenText : function (str,len) {
		if (str.length > len) 
			return str.substring(0,len) + "...";
		return str;
	},
	
	getLibraryRootUrl : function () {
		var url = document.location.href;
		var end = url.lastIndexOf("/library");
		return url.substring(0,end) +  "/library";
	}
	
}



/**
 * Solr Connection Object.
 * 
 * @param {String} url
 * @param {Object} parameters
 */
function SolrConnection(url,parameters){
	this.u = url + "?callback=?";
	this.p = parameters;
	
	if (parameters == null) {
		this.p = { alt:"jsonp" };
	}
	
	this.query = function(q,c) {
		this.p.q = q;
		jq.getJSON(this.u, this.p, function(data){
			c(data);
		});

	}
	
}





function SolrSiteSearch(inputId,outputId,parameters){
	
	// Okay to set or override these.
	this.inputId = inputId;
	this.outputId = outputId;
	this.minLength = 2;
	this.searchOnSpaces = true;
	this.defaultDelay = 0;
	this.defaultWindowDelay = 360000;
	this.defaultMsg = "No Results.";
	this.connectionUrl = "none";
	this.connectionParams = null;
	this.coursepages = "";
	this.defaultResultSize = 5;
	this.defaultSearchForm = "";
	this.defaultArrowPoint = -1;
	this.defaultNowSearchingMessage = "Searching...";
	
	this.defaultOOSTitle = 'Sorry, Course Reserves &amp; Website search is not available at the moment.';
	this.defaultOOSLists = ['For e-reserves, research databases and other course resources, please use the <i>Library Course Page</i> link on your <a href="http://www.uwosh.edu/d2l/">D2L</a> course.',
							'<a href="'+SiteUtil.getRootURL()+'/help">Ask A Librarian</a> for any assistance.'];
	
	// Do not set or override these.
	this._searchMarker = 0;
	this.courseDataSet = new Array();
	this._courseDataSetTotal = 0;
	this._courseDataSetPos = 0;
	this.siteDataSet = new Array();
	this._siteDataSetPos = 0;
	this._siteDataSetTotal = 0;
	this._timer = null;
	this._timerReady = true;
	this._windowCloseTimer = null;
	this._isTargeted = false;
	this._enter_seleted = null;
	this._lastSearchTerm = "";
	
	// Sets all parameters. woot!
	if (parameters != null) 
		for (var key in parameters) 
			if (parameters.hasOwnProperty(key)) 
				this[key] = parameters[key];
	
	
	
	this.solrSource = function(reload){
		var t = this;
		var conn = new SolrConnection(this.connectionUrl, this.connectionParams);
		this._lastSearchTerm = this.getSearchTerm();
			conn.query(this.getSearchTerm(), function(data){
				try{
					var groups = data.grouped.type.groups;
					for (var d in groups) {
						if (groups[d].groupValue.toLowerCase() == "website") {
							t.siteDataSet = t.siteDataSet.concat(jq.extend([], groups[d].doclist.docs));
							t._siteDataSetTotal = groups[d].doclist.numFound;
						}
						if (groups[d].groupValue.toLowerCase() == "course") {
							t.courseDataSet = t.courseDataSet.concat(jq.extend([], groups[d].doclist.docs));
							t._courseDataSetTotal = groups[d].doclist.numFound;
						}
					}
					if (reload) 
						t.solrSourceReady();
				}
				catch(e){
					// Catches when server is offline, wrong url and bad sets.
					solrutil.appendError(t.outputId,t.defaultOOSTitle,t.defaultOOSLists);
				}
								
			});
	}
	

	this.solrSourceReady = function() {
		// Add DataSets to Window
		this.resetSelectionMarker();
		this.changeCoursePane();
		this.changeSitePane();
	}

	this.changeCoursePane = function () {
		var t = this;
		var docs = this.courseDataSet;
		solrutil.removeSet('#CourseSet');
		if (docs.length > 0) {
			solrutil.appendSet(this.outputId, 
			                   'CourseSet',
							   solrutil.createResultMessage("Course Pages for " + solrutil.getTermFriendly(LibrarySite.current_term_code),
				   								            this._courseDataSetPos,
															this.defaultResultSize, 
															this._courseDataSetTotal),
							   this.defaultSearchForm + "?type=courses&category=more&q=" + this.getSearchTerm());
			for(var i = this._courseDataSetPos, j = 0; i < docs.length && j < this.defaultResultSize; i++, j++) 
				solrutil.appendResult('#CourseSet',
									  [{'name':'data-id','value':docs[i].id},
									   {'name':'data-num','value':i},
									   {'name':'data-ga','value':docs[i].subject + " " + docs[i].course_number},
									   {'name':'data-type','value':'Course'},
									   {'name':'data-url','value':t.coursepages + 
														 	  		"?psClassNum=" + docs[i].course_id +
															   		"&termCode=" + solrutil.getTermCode(docs[i].term)}
									  ], 
									  solrutil.createCourseString(docs[i]),
									  solrutil.createCourseFullString(docs[i]),
									  [{'event':'click', 
									    'func': function() {
											window.location = jq(this).attr('data-url');
									   }},
									   {'event':'mousedown', 
									    'func': function(e){
											if (e.which == 2) {
												window.open(jq(this).attr('data-url'), '_blank');
											}
									   }},
									   {'event':'mouseover', 
									    'func': function(){
											jq(this).css({'text-decoration':'underline','color':'#003399'});
									   }},
									   {'event':'mouseout', 
									    'func': function(){
											jq(this).css({'text-decoration':'none','color':'black'});
									   }}
									   ]
				);
		}
	}

	this.changeSitePane = function () {
		var t = this;
		var docs = this.siteDataSet;
		solrutil.removeSet('#WebsiteSet');
		if (docs.length > 0) {
			solrutil.appendSet(this.outputId, 
							   'WebsiteSet',
							   solrutil.createResultMessage("Services &amp; More",
							  							    this._siteDataSetPos,
														    this.defaultResultSize,
														    this._siteDataSetTotal),
							   this.defaultSearchForm + "?type=website&category=more&q=" + this.getSearchTerm());
			for(var i = this._siteDataSetPos, j = 0; i < docs.length && j < this.defaultResultSize; i++, j++) 
				solrutil.appendResult('#WebsiteSet',
									  [{'name':'data-url','value':docs[i].id},
									   {'name':'data-num','value':i},
									   {'name':'data-type','value':'Website'},
									   {'name':'data-ga','value':docs[i].title + ' in ' + docs[i].parent_area},
									  ], 
									  solrutil.createWebsiteString(docs[i]),
									  solrutil.createWebsiteFullString(docs[i]),
									  [{'event':'click', 
									    'func': function() {
											window.location = jq(this).attr('data-url');
									   }},
									   {'event':'mousedown', 
									    'func': function(e){
											if (e.which == 2) {
												window.open(jq(this).attr('data-url'), '_blank');
											}
									   }},
									   {'event':'mouseover', 
									    'func': function(){
											jq(this).css({'text-decoration':'underline','color':'#003399'});
											jq(this).children().css({'color':'#003399'});
									   }},
									   {'event':'mouseout', 
									    'func': function(){
											jq(this).css({'text-decoration':'none','color':'black'});
											jq(this).children().css({'color': '#777777'});
									   }}
									   ]
				);
		}
	}

	
	this.next = function() {
		this.connectionParams['group.offset'] = new Number(this.connectionParams['group.offset']) + this.defaultResultSize;
		this._paganation_switch();
	}

	this.prev = function() {
		this.connectionParams['group.offset'] = new Number(this.connectionParams['group.offset']) - this.defaultResultSize;
		this._paganation_switch();
	}
	
	this._paganation_switch = function() {
		jq(this.inputId).focus();
		if (this._searchMarker < new Number(this.connectionParams['group.offset'])) {
			this._searchMarker += this.defaultResultSize;
			this.solrSource(true);
		}
		else {
			this.solrSourceReady();
		}
	}
	

	this.upsAndDowns = function(e) {
		if (e.keyCode == 38)
			this.defaultArrowPoint -= 1
		if (e.keyCode == 40)
			this.defaultArrowPoint += 1
			
		try {
			max = jq('.ac-selectable').length;
			if (this.defaultArrowPoint > max-1) this.defaultArrowPoint = 0;
			if (this.defaultArrowPoint < 0) this.defaultArrowPoint = max-1;
				
			this.clearSelected();
			var element = jq('.ac-selectable')[this.defaultArrowPoint];
			jq(element).addClass("ac-selected");
			
		}
		catch(e){}
	}
	
	this.clearSelected = function(){
		jq('.ac-selectable').removeClass("ac-selected");
	}
	
	this.resetSelectionMarker = function() {
		this.defaultArrowPoint = -1;
	}

	this.openSelectedItem = function(){
		// No other way I can see...
		this._enter_seleted = setTimeout(function(){ window.location = jq(".ac-selected").attr('data-url'); },500);
		return false;
	}
	
	this.isSomethingSelected = function() {
		return (jq(".ac-selected").length > 0)
	}

	this.on = function () {
		
		var t = this;
		
		// Focus Input Controller
		jq(this.inputId).focus( function(){
			t._isTargeted = true;
		});
		jq(this.inputId).focusout( function(){
			t._isTargeted = false;
		});
		
		arrow_condition = function(t,e){ return (e.keyCode >= 37 && e.keyCode <= 40); };
		enter_condition = function(t,e){ return (e.keyCode == 13 && t.isSomethingSelected()); };
		backspace_condition = function(t,e){ return (e.keyCode == 8) };
		
		// Key Controller, Keyup optimizes searching, Keydown best for arrow controls.
		// Warning, Keypress has issues in IE with both e.keyCode and e.which on special chars!
		jq(this.inputId).keyup( function(e){
			//t.resetReady(); // TURN ON TO LIMIT SEARCHING.
			if (backspace_condition(t,e) && t.checkWhiteSpace(t.getSearchTerm()))
				t.queryHandler();
			else if (backspace_condition(t,e) && t.getSearchTerm().length < t.minLength)
				t.fullreset();
			else if(!arrow_condition(t,e) && !enter_condition(t,e) && !backspace_condition(t,e))
				t.queryHandler();
		});
		jq(this.inputId).keydown( function(e){
			if(arrow_condition(t,e)) 
				t.upsAndDowns(e);
			else if(enter_condition(t,e))
				return t.openSelectedItem();
		});
		
		// Closing Windows Controller
		jq('body').bind('click',function(e) {
			if (jq(t.outputId + ','+ t.inputId).has(jq(e.target)).length == 0) {
				jq(t.outputId).hide();
				t.fullreset();
			}
		});

	}
	
	this.queryHandler = function() {
		if (this.searchCriteriaMet())
			this.fireSearch(true);
		//else 
		//	this.fullreset(); //Removed for keeping results visible.
	}
	
	this.searchCriteriaMet = function() {
		if (this.getSearchTerm().length >= this.minLength && this._isTargeted) 
			if (this._timerReady || this.checkWhiteSpace(this.getSearchTerm())) 
				return true;
		return false;
	}
	
	this.fireSearch = function(reset) {
		this.clearAllDataSets();
		this.display();
		if (reset)
			this.resetReady();
		this.solrSource(true);
	}


	this.getSearchTerm = function() {
		return jq(this.inputId).val();
	}
	
	this.display = function () {
		jq(this.outputId).css('display','block');
	}
	
	this.fullreset = function() {
		jq(this.outputId).css('display','none');
		this.clearAllDataSets();
		solrutil.removeAllSet();
	}
	
	this.clearAllDataSets = function() {
		this.connectionParams['group.offset'] = 0;
		
		this.resetSelectionMarker();
		this._searchMarker = 0;
		this.courseDataSet = new Array();
		this._courseDataSetTotal = 0;
		this._courseDataSetPos = 0;
		this.siteDataSet = new Array();
		this._siteDataSetPos = 0;
		this._siteDataSetTotal = 0;
		this._windowCloseTimer = null;
	}
	
	this.checkWhiteSpace = function (val) {
		if (!this.searchOnSpaces) 
			return false;
		if (val.substr(-1) == " ")
			return true;
		return false;	
	}
	
	this.timerIsReady = function() {
		this._timerReady = true;
		clearTimeout(this._timer);
		if(this.searchCriteriaMet() && this._lastSearchTerm != this.getSearchTerm())
			//alert("|" + this._lastSearchTerm + "|" + this.getSearchTerm() + "|");
			this.fireSearch(false);
			
	}
	
	this.resetReady = function() {
		clearTimeout(this._timer);
		if(jq.browser.msie) {
			var bridge = this;
			this._timer = setTimeout(function(){ie_fix_timer_wrapper(bridge)}, this.defaultDelay);
		}
		else
			this._timer = setTimeout(function(t){ t.timerIsReady(); }, this.defaultDelay, this);

		this.timerIsNotReady();
	}
	
	this.timerIsNotReady = function() {
		this._timerReady = false;
	}
	
	
	
}





//Needed to wrapper Timeout for IE.
function ie_fix_timer_wrapper(t) {
	t.timerIsReady();
}


