var urlBase = "http://www.uwosh.edu/library";

$(document).bind("mobileinit", function(){
	// Turn off jQuery Mobile's default ajax behavior
	$.mobile.ajaxEnabled = false;
	$.mobile.hashListeningEnabled = false;
});

$(document).ready(function () {
	$('#lib_everything_search').submit(function(){
		var query = $.trim($('#library_search_in_everything').val().replace(/[,&]/g,''));
		$('#primo-query').val( 'any,contains,' + query );
	});


	// Redirect to mobile landing page if trying to load full site landing page
	if(location.hash == "#" + urlBase || location.hash == "#" + urlBase + "/"){
		location.hash = "#" + urlBase + "/mobile";
	}
	
	// Load in hash url
	$("#content-wrap").load(location.hash.substring(1).replace(" ", "%20") + " #content", function(responsetext, status, xml){
		$("#content-wrap").trigger("create");
		if(status == "success"){
			init();
		}else{
			alert("Could not load page");
			window.location = urlBase + "/mobile";
		}
	});
	
	// Trigger jQuery mobile resize event
	$(window).triggerHandler("throttledresize");
});

window.onhashchange= function(){
	//Show loading spinner
    $.mobile.loading( 'show');
	if(location.hash == "#" + urlBase || location.hash == "#" + urlBase + "/"){
		location.hash = "#" + urlBase + "/mobile";
	}
	// Load in hash url
	$("#content-wrap").load(location.hash.substring(1).replace(" ", "%20") + " #content", function(responsetext, status, xml){
		$("#content-wrap").trigger("create");
		if(status == "success"){
			init();
		}else{
			alert("Could not load page");
			window.history.back();
		}
		// Hide loading spinner
		$.mobile.loading( 'hide');
		// Hide search popup
		$("#siteSearchPopup").popup("close");
		// Close side menu
        $("#mypanel").panel("close");
		$(document).scrollTop(0);
	});
};

function init(){
	// Set hours button text
	$.getJSON("http://www.uwosh.edu/library/ws/getLibraryHours?v=2&alt=jsonp&callback=?", function(data){$("#hoursbutton").text(data["current_status_text"]);});
	
	
	// Bunch of one-off styling modifications
	$("#lib_find_no_js_website > div").addClass("ui-bar ui-bar-e");
	$("#lib_find_no_js_courses > div").addClass("ui-bar ui-bar-e");
	$("legend").addClass("ui-bar ui-bar-a");
	$(".atoz-information a[style='font-weight:bold;']").addClass("ui-bar ui-bar-a");
	$("*").attr("style","");
	$(".library_headline").addClass("ui-bar ui-bar-a");
	$(".summary").addClass("ui-bar ui-bar-a");
	$("h2").addClass("ui-bar ui-bar-a");
	$("h2 .summary").removeClass("ui-bar ui-bar-a");
	//$(".library_staff_font_l").addClass("ui-bar ui-bar-a");
	$(".library_staff_folder").addClass("ui-bar ui-bar-a");
	$(".library_staff_back_plain").addClass("ui-bar ui-bar-a");
	$(".library_staff_back").addClass("ui-bar ui-bar-a");
	//$(".library_staff_folder a").css("color", "#FFFFFF");
	$(".library_staff_folder a").css("pointer-events", "none");
	$(".library_staff_folder a").css("cursor", "default");
	$(".library_staff_folder a").css("text-decoration", "none");
	$("#archetypes-fieldname-referer input").val("Mobile");
	
		
	// remove blank table elements
	$("td, th").each(function(){
			if($(this).text() == ""){
				$(this).remove();
			}
	});
	
	//Reformat the collections by subject list
	if(location.hash.indexOf("/library/subjects", location.hash.length - "/library/subjects".length) != -1 || location.hash.indexOf("/library/subjects/", location.hash.length - "/library/subjects/".length) != -1 ){
	//	$("td ul li").addClass("ui-bar ui-bar-e");
		$("#content td").css({"padding":"0", "margin-bottom":"-1px"});
		$("#content ul").css("margin","0px");
		$("#content tbody").css({"display":"block", "width":"100%"});
		$("#content tr").css({"display":"block", "margin":"0 -15px"});
		$("#content li > span > a").each(function(){
			$(this).parent().parent().prepend($(this));
		});
		$("#content ul").attr("data-role","listview");
		$("#content-wrap").trigger("create");
		$("td ul li span a").each(function(){
			// Add "/" to the end of collections by subject links (so relative links will work correctly)
			$(this).prop("href", $(this).prop("href") + "/");
		});
	}
	
	// Resize youtube objects
	$("object[type=\"application/x-shockwave-flash\"]").each(function(){
		$(this).attr("width",160);
		$(this).attr("height",140);
	});
	
	// Unbind anchor click events
	$("a").unbind("click");
	
	// Full site link function
	$(".fullsitelink").click(function() {
		set_cookie("mobile-preference","full", (60*10));
		if(location.hash == "#" + urlBase + "/mobile" || location.hash == "#" +  urlBase + "/mobile/" || location.hash == "")
			window.location = urlBase;
		else
			window.location = location.hash.substring(1);
	});
	
	//GroupFinder link function
	$(".groupfinder").click(function() {
		window.location = "http://www.uwosh.edu/library/groupfinder";
	});
	
	// Home page link function
	$("#homepagelink").click(function() {
		location.hash = "#" + urlBase + "/mobile";
	});
	
	$(".searchpanelbutton").click(function() {
        $("#searchpanel").panel("close");
	});
	
	// "Search" button function
    $("#srch").click(function () {
       /* $("#nav").animate({
            height: 'toggle'
        });*/
        $("#searchpanel").panel("toggle");
    });
	
	$(".required").each(function(){
		$(this).text("* Required");
		$(this).css({"color": "darkred", "font-style":"italic"});
	});
	
	// "Menu" button function
    $("#menu").click(function () {
        $("#mypanel").panel("toggle");
    });
	
	//search form submit function
	$("#searchform").submit(function(event){
		event.preventDefault();
		location.hash = urlBase + "/find?q=" + $("#siteSearchText").val() + "&type=everything&category=more&start=0";
        $("#searchpanel").panel("close");
	});
	
	// Fix anchor links
	$(".anchor-link").each(function(){
		
	});
	
	
	// Rebind all other links
	$("a").on("click", function(event){
		if($(this).prop("href").indexOf(urlBase) != -1 && $(this).prop("href").indexOf("#", $(this).prop("href").length - 1) == -1 && $(this).prop("href").indexOf("getItem?") == -1 && $(this).prop("href").indexOf("mobile-computer-availability") == -1 && !$(this).hasClass("gat_gov_link") && $(this).prop("href").indexOf("map-of-the-library") == -1){
			event.preventDefault();
			location.hash = $(this).prop("href");
		}
		// Add case for anchor links
		if($(this).hasClass("anchor-link")){
			event.preventDefault();
			alert($(this).attr("href"));
		}
	});
	
	// Rebind relative links
	$("#content-core a").each(function(index){
		if($(this).attr("href") != null && $(this).attr("href").indexOf("http") == -1 && $(this).attr("href").indexOf("mailto:") == -1 && !$(this).hasClass("anchor-link")){
			var base = location.hash.substring(1, location.hash.lastIndexOf("/")+1);
			$(this).prop("href", base + $(this).attr("href"));
		}
	});
	
	// Load in book covers
	SyndeticImages.screenSweep();
	
	// Trigger jQuery mobile resize event
	$(window).triggerHandler("throttledresize");
}

//Set full site cookie
function set_cookie(name,value,expiration) {
		var e = new Date();
		e.setSeconds(e.getSeconds() + expiration);
		document.cookie = name + "=" + escape(value) + ((expiration) ? "; expires=" + e.toGMTString() : "") + "; path=/";
}