jq(document).ready(function(){

(function() { //Protect global namespace (david added)
	
	//variables
	var synonym_max = 12;			//maximum number of synonyms that can be displayed at one time
	var function_position = 0;
	
	//synonym lists
	var nouns;
	var adjectives;
	var verbs;
	
	//dragging synonyms
	var dragged, mousex, mousey, coordinates = [];
	var drag = {"x": 0, "y": 0};
	var classIndex = null;
	
	//help features
	var research_topic_entered = false;
	var key_concepts_entered = false;
	var related_terms_entered = false;
	var word_dragged = false;
	var turn_off_help = false;
	var showed_research_topic = false;
	var showed_key_concepts = false;
	var showed_related_terms = false;
	var showed_keyconcbh = false;
	var showed_reltermsbh = false;
	var showed_synonyms = false;
	
	var initial_animate = false;
	
	//function array
	var fn = [];
	
	//database searching
	var selected_db = "primo";
	var query = "";				//academic search complete
	
	var timer;
	
	//clear any values that may be around from a previous session
	jq("#research_topic_input").val("");
	jq(".key_concepts_input").val("");
	jq(".related_terms_input").val("");
	
	//initial settings
	var name = jq("#results_tab1").html();
	jq("#search_results").html("Search with " + name);
	
	
	//check if browser is not ie8
	if(jq.browser.msie && (jq.browser.version < 9.0)) {
		jq("#old_browser").html("You are using an older browser. Update it <a href='http://windows.microsoft.com/en-us/internet-explorer/downloads/ie-9/worldwide-languages'>here</a>.");
	}
	
	/*********************************************
	*																				*
	*								ANIMATIONS								*
	*																				*
	*********************************************/
	
	function animateMenus(){
		jq("#helper_research_topic").fadeOut(500, function(){
			jq("#research_topic_input").animate({ width: "600px" });
			jq(".helper_content").css({ marginTop: "0px" });
			jq("#research_topic").animate({ width: "700px" }, function(){
				jq("#key_concepts_titlebar").fadeIn();
				jq("#related_terms_titlebar").fadeIn();
				jq("#results").fadeIn();
				jq("#results_tree").fadeIn();
				
				/* HIDE SYNONYMS */
				//jq("#synonyms").fadeIn();
				
				jq("#dividers").fadeIn();
				jq("#add_row").fadeIn();
				jq("#concepts_terms").fadeIn();
				//showSynonymsHelp();
				if (jq("research_topic_input").val()) 
					research_topic_entered = true;
			});
			initial_animate = true;
		});
	}
	
	var animatePartial = function(){
		jq("#helper_research_topic").fadeOut(500, function(){
			jq("#research_topic_input").animate({ width: "600px" });
			jq("#research_topic").animate({ width: "700px" }, function(){
				jq("#key_concepts_titlebar").fadeIn();
				jq("#results").fadeIn();
				jq("#results_tree").fadeIn();
				
				/* HIDE SYNONYMS */
				//jq("#synonyms").fadeIn();
				
				jq("#dividers").fadeIn();
				jq("#add_row").fadeIn();
				jq("#concepts_terms").fadeIn().css({ width: "220px" });
				//hide related terms
				jq("#related_terms_titlebar").hide();
				jq(".related_terms").hide();
				jq(".add_term_icon").hide();
				jq(".related_terms_input").hide();
				jq(".arrow_connector").hide();
				jq(".divider").css({ width: "210px" });				
				//showSynonymsHelp();
				showKeyConceptsHelp();
				if( jq("research_topic_input").val() )
					research_topic_entered = true;
			});
			initial_animate = true;
		});	
	}
	
	function showKeyConceptsHelp(){
		if(!turn_off_help && !showed_key_concepts){
			jq("#helper_research_topic").fadeOut();
			jq("#concepts_terms").fadeIn(500, function(){
				jq("#helper_key_concepts").fadeIn();
				jq(".helper_content").css({ width: "380px", height: "100px", marginLeft: "-1px" });
				jq(".helper_container").css({ width: "420px" });
				jq(".helper_pointer_left").css({ marginTop: "30px" });
			});
		}
	}
	
	var showRelatedTermsHelp = function(){
		if(!turn_off_help && !showed_related_terms){
			//hide key concepts help
			jq("#helper_key_concepts").fadeOut();
			jq("#concepts_terms").delay(200).animate({ width: "700px" }, function(){
				jq("#related_terms_titlebar").fadeIn();
				jq("#helper_related_terms").fadeIn().css({ width: "300px", marginLeft: "250px", marginTop: "-250px" });
				jq(".helper_content").css({ width: "380px", height: "95px" });
				jq(".helper_pointer_down").css({ marginLeft: "170px" });
			});
			jq(".divider").delay(200).animate({ width: "690px" }, function(){
				jq(".related_terms").fadeIn();
				jq(".related_terms_input").fadeIn();
				jq(".arrow_connector").fadeIn();
				jq(".add_term_icon").fadeIn();
			});
		}
	}
	
	var showSearchHelp = function(){
		if(!turn_off_help){
			jq("#helper_related_terms").fadeOut();
			jq("#helper_search_results").fadeIn().css({ marginTop: "-140px" });
			jq(".helper_content").css({ width: "320px", height: "115px" });
			jq(".helper_pointer_down").css({ marginLeft: "145px"});
		}
	}

	jq(".helper_button").click(function(){
		//jq(".helper_container").fadeOut();
	});
	
	var fadeAll = function(){
		jq("#helper_research_topic").fadeOut();
		jq("#helper_key_concepts").fadeOut();
		jq("#helper_related_terms").fadeOut();
		jq("#helper_search_results").fadeOut();
	}
	
	function fadeExtras(){
		jq("#helper_button_1").fadeOut();
		jq("#helper_button_2").fadeOut();
		jq("#helper_synonyms").fadeOut();
	}
	
	//push functions onto stack
	fn.push(animatePartial);
	fn.push(showRelatedTermsHelp);
	fn.push(showSearchHelp);
	fn.push(fadeAll);
	
	jq(".helper_next").click(function(){
		fn[function_position]();
		function_position++;
	});
	
	jq(".helper_done").click(function(){
	
		if( jq(this).parent().parent().attr('id') == "helper_button_1" ){
			jq(this).parent().parent().fadeOut();
		} else if( jq(this).parent().parent().attr('id') == "helper_button_2" ){
			jq(this).parent().parent().fadeOut();
		} else if( jq(this).parent().parent().attr('id') == "helper_synonyms" ){
			showed_synonyms = true;
			jq(this).parent().parent().fadeOut();
		} else{
			//fadeAll();
			if( jq(this).parent().parent().attr('id') == "helper_research_topic" ){
				showed_research_topic = true;
			}
			
			if( jq(this).parent().parent().attr('id') == "helper_key_concepts" ){
				showed_key_concepts = true;
			}
			
			if( jq(this).parent().parent().attr('id') == "helper_related_terms" ){
				showed_related_terms = true;
			}
		}
	});
	
	jq(".helper_disable").click(function(){
		fadeAll();
		fadeExtras();
		turn_off_help = true;
		animateMenus();
		//for(var i in fn)
		//	fn[i]();
	});
	
	/*********************************************
	*																				*
	*					SELECTING A DATABASE							*
	*																				*
	*********************************************/
	
	//adding another database requires following a similar pattern to what is already being done
	//it is also necessary to adjust the css and pt files accordingly so that the new database tabs
	//are displayed correctly
	
	//select db1
	jq("#results_tab1").click(function(){
		var color = jq(this).css("background-color");
		var name = jq(this).html();
		jq(this).css({ backgroundColor: "#E0E0E0", border: "0px", borderRight: "1px", borderColor: color, boxShadow: "inset 3px -3px 1px -3px #000000" });
		jq("#results_tab2").css({ backgroundColor: "#999999", border: "0px", borderTop: "1px solid black", borderRight: "1px solid black", boxShadow: "inset 0px 4px 3px 1px #777777" });
		jq("#results_tab3").css({ backgroundColor: "#999999", border: "0px", borderTop: "1px solid black", borderRight: "1px solid black", boxShadow: "inset 0px 4px 3px 1px #777777" });
		//jq("#results, #results_text_field").css({ backgroundColor: color });
		jq("#search_results").html("Search with " + name);
		selected_db = "primo";
	});
	
	//select db2
	jq("#results_tab2").click(function(){
		var color = jq(this).css("background-color");
		var name = jq(this).html();
		jq(this).css({ backgroundColor: "#E0E0E0", border: "0px", borderRight: "1px", borderColor: color, boxShadow: "inset 3px -3px 1px -3px #000000" });
		jq("#results_tab1").css({ backgroundColor: "#999999", border: "0px", borderBottom: "1px solid black", borderRight: "1px solid black", boxShadow: "inset 0px 4px 3px 1px #777777" });
		jq("#results_tab3").css({ backgroundColor: "#999999", border: "0px", borderTop: "1px solid black", borderRight: "1px solid black", boxShadow: "inset 0px 4px 3px 1px #777777" });
		//jq("#results, #results_text_field").css({ backgroundColor: color });
		jq("#search_results").html("Search with " + name);
		selected_db = "asc";
	});
	
	jq("#search_results").click(function(){
		if(selected_db == "asc")
			window.open("http://www.remote.uwosh.edu/form?qurl=http://search.ebscohost.com/login.aspx?authtype=ip,uid&profile=ehost&defaultdb=a9h&direct=true&bquery=" + query);
		else if(selected_db == "primo")
			window.open("http://uw-primo.hosted.exlibrisgroup.com/primo_library/libweb/action/search.do?dscnt=0&frbg=&scp.scps=primo_central_multiple_fe&tab=default_tab&dstmp=1368544002288&srt=rank&ct=search&mode=Basic&dum=true&indx=1&vl%28freeText0%29=" + query + "&fn=search&vid=OSH");
			
			
	});

	/*********************************************
	*																				*
	*								ADD SYNONYMS							*
	*																				*
	*********************************************/
	
	//synonyms are all disabled for now due to the API not working as desired
	//the code is still all in place, however, should that change
	
	var parentPosition = { "x":0, "y":0 };
	var vertical_position = 0;
	var current_synonym = 1;
	
	function populateSynonyms(word){

		var className = "synonyms_item";
		
		if(vertical_position < synonym_max){
			jq("#synonyms_words").append( jq("<div>" + word + "</div>").addClass(className).addClass(className + current_synonym) );
			vertical_position++;
			current_synonym++;
		}
		
		jq(".synonyms_item").unbind("mousedown", startDragging);
		jq(".synonyms_item").bind("mousedown", startDragging);
	}
	
	/**********************
	*			JSON Request			*
	**********************/
	
	function getSynonyms(word){

// COMMENTED OUT TO STOP NETWORK ERROR UNTIL WE CAN GET BETTER SOLUTION
//		if(word){
//			jq.getJSON('http://words.bighugelabs.com/api/2/70a9fb15672a04293b3363569956e8e8/' + word + '/json?callback=?', function(data, status, xhr){
//				if (data.noun) {
//					nouns = data.noun.syn;
//					for (word in nouns) {
//						populateSynonyms(nouns[word]);
//					}
//				}
//				if (data.adjective) {
//					adjectives = data.adjective.syn;
//					for (word in adjectives) {
//						populateSynonyms(adjectives[word]);
//					}
//				}
//				if (data.verb) {
//					verbs = data.verb.syn[1];
//					for (word in verbs) {
//						populateSynonyms(nouns[word]);
//					}
//				}
//			});
//		}
	}
	
	/*********************************************
	*																				*
	*									TRIGGERS				 				*
	*																				*
	*********************************************/
	
	//these are the conditions by which synonyms will be generated
	
	var selected_item = "";
	var empty_research_topic = false;
	
	jq(".key_concepts_input").change(function(){ 
		jq("#synonyms_words").html("");
		vertical_position = 0;
		getSynonyms(jq(this).val());
		if(!key_concepts_entered){
			key_concepts_entered = true;
		}
	});
	
	jq("#research_topic_input").click(function(){
		if(empty_research_topic){
			jq(this).val("");
			jq(this).css({ color: 'black' });
			empty_research_topic = false;
		}
		if(selected_item != this){
			jq("#synonyms_words").html("");
			vertical_position = 0;
			getSynonyms(jq(this).val());
		}
		selected_item = this;
	});
	
	jq("#research_topic_input").keypress(function(event) {
		if(event.which == 13) {
			fn[function_position]();
			function_position++;
		}
	});
	
	var changeSynonyms = function(){
		jq(".key_concepts_input").click(function(){
			if(selected_item != this){
				jq("#synonyms_words").html("");
				vertical_position = 0;
				getSynonyms(jq(this).val());
			}
			selected_item = this;
		});
	}
	
	jq(".key_concepts_input").keypress(function(event) {
		if(event.which == 13) {
			fn[function_position]();
			function_position++;
		}
	});
	
	jq(".key_concepts_input").bind("click", changeSynonyms);	
	
	jq(".related_terms_input").change(function(){ 
		jq("#synonyms_words").html("");
		vertical_position = 0;
		getSynonyms(jq(this).val());
		if(!related_terms_entered){
			related_terms_entered = true;
		}
	});
	
	jq(".related_terms_input").keypress(function(event) {
		if(event.which == 13) {
			fn[function_position]();
			function_position++;
		}
	});
	
	/*********************************************
	*																				*
	*						BUILD SEARCH QUERY							*
	*																				*
	*********************************************/
	
	
	var colors = ["#C3DD55", "#A1A167", "#DE9B54", "#916637"];

	//Disable caching so setInterval works with IE
	jq.ajaxSetup ({
		cache: false
	});
	
	//there are two strings, one is for the visual representation (result_string), 
	//the other for actually sending in to the database (query)
	
	setInterval(function(){
		var result_string = "";
		query = "(";
		var keyconcepts_string = "";
		var pos = 1;
		var color_position = 0;
		var width_of_terms = 0;
		var max_width = 0;
		
		jq(".key_concepts_input").each(function(){
			var elem = jq(this);
			if(elem.val() != ""){
				jq("#divider"+pos).css({ backgroundColor: colors[color_position] });
				if(color_position > 0){
					query += ")+AND+(";
					result_string += "<div>AND</div>";
				}
				result_string += "<div style=\"background-color:" + colors[color_position] + ";\">";
				color_position++;
				if(elem.val().indexOf(" ") != -1){
					query += "\"" + elem.val() + "\"";
					result_string += "(\"" + elem.val() + "\"";
				} else {
					query += elem.val();
					result_string += "(" + elem.val();
				}
				
				jq("#results_tree_concterms"+pos).html(elem.val()).css({ backgroundColor: colors[color_position] });
				
				jq(".related_terms_input_" + pos).each(function(){
					var rel_term = jq(this);
					if(rel_term.val() != ""){
						query += "+OR+";
						result_string += " OR ";
						if(rel_term.val().indexOf(" ") != -1){
							query += "\"" + rel_term.val() + "\"";
							result_string += "\"" + rel_term.val() + "\"";
						} else {
							query += rel_term.val();
							result_string += rel_term.val();
						}
						
						jq("#results_tree_concterms"+pos).append("<br>" + rel_term.val());
					}
				});
				
				result_string += ")</div>";
				
				width_of_terms += max_width;
				max_width = 0;
			}
			pos++;
		});
		query += ")";
		jq("#results_textarea").html(result_string);
	}, 200);
	
	/*********************************************
	*																				*
	*						ADD KEY CONCEPTS								*
	*																				*
	*********************************************/

	//this is for adding additional key concepts when the + button is clicked
	
	var keyconc_count = 4;
	
	function addConcepts(){
		jq("#add_row_icon").click(function(){
			var elem = jq(this);
			
			//extend key concepts and related terms
			jq("#dividers").append( jq("<div id=\"divider" + keyconc_count + "\"></div>").addClass("divider") );
			jq("#divider" + keyconc_count).append( jq("<div></div>").addClass("key_concepts_" + keyconc_count).addClass("key_concepts_text_field") );
			jq(".key_concepts_" + keyconc_count).append( jq("<input id='key_concepts_input" + keyconc_count + "' type=\"text\" name=\"key_concept" + keyconc_count + "\"/>").addClass("key_concepts_input") );
			jq("#divider" + keyconc_count).append( jq('<img alt="Next on the right" src="++resource++uwosh.librarytheme.images/arrow_connector.png">').addClass("arrow_connector") );

			jq("#divider" + keyconc_count).append( jq("<div></div>").addClass("related_terms").addClass("related_terms_" + keyconc_count).addClass("related_terms_text_field") );
			jq(".related_terms_" + keyconc_count).append( jq("<input type=\"text\" name=\"related_term" + keyconc_count + ".2\" />").addClass("related_terms_input").addClass("related_terms_input_" + keyconc_count) );
			jq(".related_terms_" + keyconc_count).append( jq("<input type=\"text\" name=\"related_term" + keyconc_count + ".2\" />").addClass("related_terms_input").addClass("related_terms_input_" + keyconc_count) );
			jq(".related_terms_" + keyconc_count).append( jq('<img alt="Add Term" src="++resource++uwosh.librarytheme.images/add_icon.png">').addClass("add_term_icon").addClass("add_term_icon" + keyconc_count).addClass("add_term") );
			
			//check if related terms has been shown
			//if it has, then do nothing, otherwise hide the related terms class that was added
			if(function_position < 2){
				jq(".related_terms").hide();
				jq(".divider").css({ width: "210px" });
				jq(".arrow_connector").hide();
			}
				
			keyconc_count++;

			jq(".key_concepts_input").unbind("click", changeSynonyms);
			jq(".key_concepts_input").bind("click", changeSynonyms);
		});
	}
	
	/*********************************************
	*																				*
	*								ADD TERMS									*
	*																				*
	*********************************************/
	
	//this is for adding additional related terms when the + button is clicked
	
	var relterm_count = 3;
	
	function addTerms(){
		jq("#guided_keywords").delegate(".add_term_icon", "click", function(){
			var elem = jq(this);
			var position = parseInt(elem.attr('class').replace(/\D/g,''));
			
			//extend key concepts and related terms
			jq("#divider" + position).animate({ height: "+=42" }, 500, function(){
				//after animate, put in a new key concept
				jq(".related_terms_" + position).append( jq("<input type=\"text\" name=\"related_term" + position + "." + relterm_count + "\"/>").addClass("related_terms_input").addClass("related_terms_input_" + position) );
				jq(".related_terms_" + position).append( jq("<input type=\"text\" name=\"related_term" + position + "." + (relterm_count + 1) + "\"/>").addClass("related_terms_input").addClass("related_terms_input_" + position) );
				relterm_count += 2;
			});
		});
	}
	
	/*********************************************
	*																				*
	*						SELECTING SYNONYMS							*
	*																				*
	*********************************************/
	
	// Dragging and dropping functionality for synonyms

	var continueDragging = function(e) {
		// change the location of the draggable object
		dragged.css({ "left": e.pageX - (dragged.width() / 2), "top": e.pageY - (dragged.height() / 2) });

		// check if any boxes were hit
		for (var i in coordinates) {
			if (mousex >= coordinates[i].left && mousex <= coordinates[i].right && mousey >= coordinates[i].top && mousey <= coordinates[i].bottom) {
				// the mouse is on a droppable area
				coordinates[i].dom.addClass("somethingover");
				coordinates[i].dom.css({ background: "#2244FF" });
			} else {
				// no objects hit yet
				coordinates[i].dom.removeClass("somethingover");
				coordinates[i].dom.css({ background: "#77FF00" });
			}
		}
		// Keep the last positions of the mouse coords
		mousex = e.pageX;
		mousey = e.pageY;
	}

	var endDragging = function(e) {
		var dropped_element = false;
	
		if(e.button == 0) {
			// remove document event listeners
			jq(document).unbind("mousemove", continueDragging);
			jq(document).unbind("mouseup", endDragging);

			// check if any boxes were hit
			for (var i in coordinates) {
				if (mousex >= coordinates[i].left && mousex <= coordinates[i].right && mousey >= coordinates[i].top && mousey <= coordinates[i].bottom) {
					//the mouse is on a droppable area
					droptarget = coordinates[i].dom;
					droptarget.removeClass("somethingover").addClass("dropped");
					droptarget.val(dragged.html());														//put text from dropped synonym_item into the input field
					classIndex = parseInt(dragged.attr('class').replace(/\D/g,'')) + 1;			//strip class name down to its integer
					dropped_element = true;
					dragged.hide("fast", function() {
						jq("#synonyms_words").html("");
						vertical_position = 0;
						getSynonyms(dragged.html());
						jq(this).remove();				
					});
				}
				coordinates[i].dom.css({ background: "#FFFFFF" });
			}
			
			if(dropped_element){
				vertical_position--;
				dropped_element = false;
			}
			
			else{
				dragged.animate({ left: drag.x, top: drag.y - 5 }, 500, function(){
					vertical_position--;
					populateSynonyms(dragged.html());
					dragged.remove();
					dragged = null;
					//jq(this).css({ 'position': 'relative' }).appendTo("#synonyms_words");
					
				});
			}

			// reset variables
			mousex = 0;
			mousey = 0;
			coordinates = [];
		}
	}

	var startDragging = function(e) {
		if(e.button == 0) {
			// Find coordinates of the droppable bounding boxes
			jq(".key_concepts_input, .related_terms_input").each(function() {
				var lefttop = jq(this).offset();
				jq(this).css({ background: "#77FF00" });
				// and save them in a container for later access
				coordinates.push({
					dom: jq(this),
					left: lefttop.left,
					top: lefttop.top,
					right: lefttop.left + jq(this).width(),
					bottom: lefttop.top + jq(this).height()
				});
			});

			// When the mouse down event is received
			if (e.type == "mousedown") {
				dragged = jq(this);
				// Change the position of the draggable
				drag.x = dragged.offset().left;
				drag.y = dragged.offset().top;
				dragged.css({ "left": e.pageX - (dragged.width() / 2), "top": e.pageY - (dragged.height() / 2), "position": "absolute" });
				// Bind the events for dragging and stopping
				jq(document).bind("mousemove", continueDragging);
				jq(document).bind("mouseup", endDragging);
				if(!word_dragged){
					jq("#helper_synonyms").fadeOut();
					word_dragged = true;
					//showSearchHelp();
				}
			}
		}
	}

	// Start the dragging
	jq(".synonyms_item").bind("mousedown", startDragging);
	
	//main
	addConcepts();
	addTerms();
	
	
	})(); // Protect Global Namespace (David added)
});	