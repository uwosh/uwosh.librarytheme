var ToolTipper = {
	_overlay_id : '#tool-tipper',
	_message_class : '.tool-tip',
	_target_class : '.tool-tip-target',
	_offset : {'top':22,'bottom':0,'left':-16,'right':0},
	
	init : function() {
		jq(ToolTipper._target_class).hover(
			function(){
				var html = jq(this).find(ToolTipper._message_class).first().html();
				jq(ToolTipper._overlay_id).html(ToolTipper.arrow()).append(html);
				jq(ToolTipper._overlay_id).css({'left': (jq(this).offset().left + ToolTipper._offset.left),
											    'top' : (jq(this).offset().top + ToolTipper._offset.top)});
		        ToolTipper.setClasses(this);
				jq(ToolTipper._overlay_id).stop(true, true).fadeIn(100);
			},
			function(){ jq(ToolTipper._overlay_id).stop(true, true).fadeOut(100); }
		);
	},
	
	setClasses : function(t) {
		jq(ToolTipper._overlay_id).attr('class',''); // remove all old classes
		var classes = jq(t).find(ToolTipper._message_class).attr('class');
		jq(ToolTipper._overlay_id).addClass( classes.replace(ToolTipper._message_class.replace('.',''),'') );
	},
	
	arrow : function() {
		return jq("<img>").attr('src','++resource++uwosh.librarytheme.stylesheets/images/tip-arrow.png');
	}
}

jq(document).ready(function(){
	ToolTipper.init();
});