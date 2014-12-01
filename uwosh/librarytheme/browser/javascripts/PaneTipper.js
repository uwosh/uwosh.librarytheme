/*
 * Javascript-less popout window pane.  Just follow the example html below and it will generate the
 * window for you with no additional javascript setup.  Feel free to do what ever with this script.
 * @author: David Hietpas
 * @email: hietpasd@uwosh.edu
 * @date: 2-16-2013
 * 
 * <!-- HOW TO MAKE WINDOW PANES -->
 * <span class="pane-tip-trigger">
 *     <!-- Any content in the pane-tip-target will trigger the pane to appear. -->
 *     <a href="location">Some link</a>
 *     
 *     <span class="pane-tip-window">
 *     	   <!-- Any content in the pane-tip-window will go in the pane. -->
 *         <div>Stuff....</div>
 *     </span>
 * </span>
 * 
 * Extra Classes:  Any addition classes added to the pane-tip-window will be transferred to the window body.
 * 
 */

var PaneTipperThread = null;
var PaneTipperStructureThread = null;
var PaneTipper = {
	active : null,
	timing : {'show':300,'hide':300},
	overlay : { 'id':'#pane-tipper','body':{'id':'#pane-body'},'left': {'id': '#pane-left'},'right': {'id': '#pane-right'}, 'top': {'id': '#pane-top'},
			    'width':0,'height':0},
	pane: {'trigger':'.pane-tip-trigger','window':'.pane-tip-window','load':'.pane-load','force':{'left':'.pane-force-left','right':'.pane-force-right','down':'.pane-force-down'}},
	target : {'width':0,'height':0},
	arrows : {'active':'center','position':0,
	          'left_base':'pane-left-','right_base':'pane-right-','top_base':'pane-top-',
			  'top_ext':'top','bottom_ext':'bottom','center_ext':'center'},
	structure : null,
	scrolling : false,
	
	on : function() {
		var origin = this;
		origin.setup();
		jq(origin.overlay.id + ',' + origin.pane.trigger).hover(
			function(){
				origin.clearThread();
				if (jq(this).is(origin.pane.trigger)) {
					origin.active = this;
					if (!jq(origin.active).is(origin.pane.load)) {
						origin.renderPane();
						PaneTipperThread = setTimeout(function(){
							jq(origin.overlay.id).css('visibility', 'visible');
						}, origin._get_data(jq(origin.active),'data-show-time',origin.timing.show,'int'));
					}
					else {
						var event = origin.active;
						PaneTipperThread = setTimeout(function(){
							origin.loadingPane();
							origin.structure(event, function(html){
								if (!origin.scrolling && html != null) {
									jq(origin.overlay.id).css('visibility','hidden'); 
									jq(event).removeClass('pane-load');
									jq(event).find(origin.pane.window).html(html);
									origin.renderPane();
									jq(origin.overlay.id).css('visibility', 'visible');
								}
							});
						}, origin._get_data(jq(origin.active),'data-show-time',origin.timing.show,'int'));
					}
				}
			},
			function(){ 
				origin.clearThread();
				PaneTipperThread = setTimeout(function(){
					jq(origin.overlay.id).css('visibility','hidden'); 
				},origin._get_data(jq(origin.active),'data-hide-time',origin.timing.show,'int'));
			}
		);
		
		jq('body').bind('DOMMouseScroll mousewheel', function() {
			origin.scrolling = true;
		});
		
	},
	
	_get_data : function(element, name, default_value, type) {
		var value = jQuery(element).attr(name);
		if (value == '' || value == null || typeof value == 'undefined') 
			return default_value;
		if (type == 'int')
			return parseInt(value);
		if (type == 'float')
			return parseFloat(value);
		return value;
	},
	
	clearThread : function() {
		clearTimeout(PaneTipperThread);
		PaneTipperThread = null;
		this.scrolling = false;
	},
	
	loadingPane : function() {
		var div = jq('<div>').addClass('pane-tip-heading').append("<a>Loading...</a>");
		jq(this.overlay.body.id).html('').append(div);
		var inner = jq('<div>').addClass('library_text_center').append(jq('<img>').attr({'alt':'Loading',
																	   'src': SiteUtil.getRootURL() + '/++resource++uwosh.librarytheme.images/icon-loading.gif'
																	  }));
		jq(this.overlay.body.id).addClass('pane-loading').append(inner);
		this.determineSide();
		jq(this.overlay.id).css('visibility', 'visible');
	},
	
	renderPane: function(){
		this.transferClasses( jq(this.active).find(this.pane.window).attr('class') );
		try {
			jq(this.overlay.body.id).html(SiteUtil.emailTransformer(jq(this.active).find(this.pane.window).html()));
		} 
		catch (e) {
			jq(this.overlay.body.id).html(jq(this.active).find(this.pane.window).html());
		}
		this.determineSide();
	},
	
	preset : function() {
		jq(this.overlay.id).css({'left': (jq(this.active).offset().left + this.target.width),
						  		 'top' : jq(this.active).offset().top - (this.overlay.height / 2)});
	},
	
	rightSide : function() {
		jq(this.overlay.right.id).attr('class','').hide();
		jq(this.overlay.top.id).attr('class','').hide();
		jq(this.overlay.id).css({'left': (jq(this.active).offset().left + this.target.width),
						  		 'top' : this.arrows.position});
		jq(this.overlay.left.id).css({'height': this.overlay.height}).attr('class',this.arrows.left_base + this.arrows.active).show();	
	},
	
	leftSide : function() {
		jq(this.overlay.left.id).attr('class','').hide();
		jq(this.overlay.top.id).attr('class','').hide();
		jq(this.overlay.id).css({'left': (jq(this.active).offset().left - this.overlay.width),
								 'top': this.arrows.position});
		jq(this.overlay.right.id).css({'height': this.overlay.height}).attr('class',this.arrows.right_base + this.arrows.active).show();	
	},
	
	topSide : function() {
		jq(this.overlay.left.id).attr('class','').hide();
		jq(this.overlay.right.id).attr('class','').hide();
		jq(this.overlay.id).css({'left': jq(this.active).offset().left + ((jq(this.active).width() - this.overlay.width) / 2),
								 'top': jq(this.active).offset().top + jq(this.active).height()});
		jq(this.overlay.top.id).attr('class',this.arrows.top_base + this.arrows.active).show();	
	},
	
	determineLevel : function() {
		if (this.collideWithTop()) {
			this.arrows.position = jq(this.active).offset().top;
			this.arrows.active = this.arrows.top_ext;
		}
		else if (this.collideWithBottom()) {
			this.arrows.position = jq(this.active).offset().top - this.overlay.height;
			this.arrows.active = this.arrows.bottom_ext;
		}
		else {
			this.arrows.position = jq(this.active).offset().top - (this.overlay.height / 2);
			this.arrows.active = this.arrows.center_ext;
		}
	},
	
	determineSide : function () {
		this.overlay.width = jq(this.overlay.id).width();
		this.overlay.height = jq(this.overlay.body.id).height();
		this.target.height = jq(this.active).height();
		this.target.width = jq(this.active).width();
		this.preset(); // Set right center for calculations
		this.determineLevel();
		if (jq(this.active).find(this.pane.window).is(this.pane.force.down)) 
			this.topSide(); 
		else if (this.collideWithRight() || jq(this.active).find(this.pane.window).is(this.pane.force.left)) 
			this.leftSide();
		else if (jq(this.active).find(this.pane.window).is(this.pane.force.right))
			this.rightSide(); 
		else 
			this.rightSide();
	},

	transferClasses : function(classes) {
		jq(this.overlay.body.id).attr('class','').addClass(classes.replace(this.pane.window.replace('.',''),''));
	},
	
	collideWithTop : function() { return (jq(this.overlay.id).offset().top < this.screenTop()); },
	collideWithBottom : function() { return ((jq(this.overlay.id).offset().top + this.overlay.height + this.target.height) > this.screenBottom()); },
	collideWithRight : function() { return ((jq(this.overlay.id).offset().left + this.overlay.width) > this.screenRight()); },
	screenTop : function() { return jq(window).scrollTop(); },
	screenBottom : function() { return jq(window).scrollTop() + jq(window).height(); },
	screenRight : function() { return jq(window).width(); },
	
	setup : function() {
		jq('body').append('<div id="pane-tipper"><div id="pane-top"></div><div id="pane-left"></div><div id="pane-body"></div><div id="pane-right"></div></div>');
	}
	
}

jq(document).ready(function(){
	PaneTipper.on();
});









