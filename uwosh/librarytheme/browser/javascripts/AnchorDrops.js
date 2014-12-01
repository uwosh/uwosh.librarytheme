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
 * 
 */


jQuery('document').ready(function(){
	AnchorDrops.init();
});


var AnchorDrops = {
	
	_click : true,
	_root_element : 'anchor-drops',
	_context : null,
	
	init : function() {
		
		if (!AnchorDrops.mobiledetection()) {
			AnchorDrops._mobile_handler(false);
			if (AnchorDrops._click) 
				AnchorDrops._click_handler();
			AnchorDrops._outside_menu_handler();
		}
		else {
			
		}
	},
	
	_mobile_handler : function(is) {
		if (is) {
			// egh...
		}
		else {
			jQuery('.anchor-drops-label a').each(function(i,t){
				var span = jQuery(document.createElement('span')).html(jQuery(t).html());
				jQuery(t).replaceWith(span);
			});
		}
	},

	_click_handler : function() {
		jQuery('.anchor-drops-label').click(function(e){
			if (AnchorDrops._context != null)
				if(jQuery(AnchorDrops._context).has(e.target).length == 0)
					AnchorDrops._close();
			AnchorDrops._set_context(jQuery(e.target));
			AnchorDrops.toggle();
		});
	},
	
	_outside_menu_handler : function() {
		jQuery('body').click(function(e){
			AnchorDrops._set_context(jQuery(e.target));
			if (jQuery('.anchor-drops').has(jQuery(e.target)).length == 0) {
				AnchorDrops._reset();
			}
		});
	},	
	
	_reset : function () {
		AnchorDrops._context = null;
		jQuery('.anchor-drops-options').css('display','none');
		jQuery('.anchor-drops-options').removeClass('anchor-drops-active');
		var ele = jQuery('.anchor-drops-arrow-active');
		ele.addClass('anchor-drops-arrow');
		ele.removeClass('anchor-drops-arrow-active');
	},
	
	_close : function(){
		if (AnchorDrops._context == null) return;
		jQuery(AnchorDrops.get('.anchor-drops-options')).css('display','none');
		jQuery(AnchorDrops.get('.anchor-drops-options')).removeClass('anchor-drops-active');
		var ele = jQuery(AnchorDrops.get('.anchor-drops-arrow-active'));
		ele.addClass('anchor-drops-arrow');
		ele.removeClass('anchor-drops-arrow-active');
	},
	
	_open : function(){
		if (AnchorDrops._context == null) return;
		jQuery(AnchorDrops.get('.anchor-drops-options')).css('display','block');
		jQuery(AnchorDrops.get('.anchor-drops-options')).addClass('anchor-drops-active');
		var ele = jQuery(AnchorDrops.get('.anchor-drops-arrow'));
		ele.addClass('anchor-drops-arrow-active');
		ele.removeClass('anchor-drops-arrow');
	},
	
	get : function(selector) {
		return jQuery(AnchorDrops._context).find(selector);
	},
	
	_set_context : function(t) {
		if (jQuery(t).hasClass(AnchorDrops._root_element)) {
			AnchorDrops._context = jQuery(t);
			return; // halt
		}
		if (jQuery(t).is('body')) return; // safe guard...
		AnchorDrops._set_context(jQuery(t).parent());
	},
	
	toggle : function() {
		if (AnchorDrops.get('.anchor-drops-options').hasClass('anchor-drops-active')) 
			AnchorDrops._close();
		else 
			AnchorDrops._open();
		
	},	

	
	// TEMP Solution...
	mobiledetection : function() {
		var a = navigator.userAgent||navigator.vendor||window.opera; // get user-agent
		check = /android.+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|playbook|silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(di|rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4));
		
		return check;
	}


	
}