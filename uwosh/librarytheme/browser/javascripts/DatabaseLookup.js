DatabaseLookup = {
	request : null,
	
	getById : function(id, callback){
		if (this.request != null)
			this.abort();
		this.request = jq.get(SiteUtil.getRootURL() + '/ws/getDatabaseInformation?alt=json&id=' + id, function(data){
			callback(data);
		});
	},
	
	abort : function() {
		try {
			if (this.request != null)
				this.request.abort();
			this.request == null;
		} catch(e) {}
	}
}

// Plugin Structure to PaneTipper Overrides, must load after PaneTipper.js
PaneTipper.structure = function(e, callback){
	try {
		var id = jq(e).attr('data-id');
		var proxy = 'http://www.remote.uwosh.edu/login?url=';
		var create_icon = function(src,alt,title,url) {
			var d = jq('<div>').addClass('pane-icon library_text_vmiddle');
			var img = jq('<div>').append(jq('<img>').attr({'alt':alt,'src':SiteUtil.getRootURL() + '/' + src}));
			var info = jq('<span>').html(title);
			if(url!=null)
				info = jq('<a>').addClass('gat_database_tutorial library_link').attr('href',url).html(title);
			jq(d).append(img).append(info);
			return d;
		}
		
		DatabaseLookup.getById(id, function(data){
			var container = jq('<div>');
			
			// Title
			var div = jq('<div>').addClass('pane-tip-heading gat_database_heading').append(jq('<a>').attr('href', proxy + data.databases[0].url).html(data.databases[0].title));
			jq(container).append(div);
			
			//Description
			div = jq('<div>').html(data.databases[0].db_description);
			jq(container).append(div);
			
			// Tutorials
			if (data.databases[0].tutorial_url != '' || data.databases[0].gots_url != '') {
				if (data.databases[0].tutorial_url != '') 
					jq(container).append(create_icon('++resource++uwosh.libraryguides.images/tutorial.png', 'Tutorial', 'Watch Video Tutorial', data.databases[0].tutorial_url));
				if (data.databases[0].gots_url != '') 
					jq(container).append(create_icon('++resource++uwosh.libraryguides.images/tutorial.png', 'Tutorial', 'Guided Tutorial', data.databases[0].gots_url));
			}
			
			// Full Text
			if (data.databases[0].is_some_full_text == 1) 
				jq(container).append(create_icon('++resource++uwosh.librarytheme.images/ft.gif', 'Full Text Available', 'Full Text Available'));
			
			// Resource Types
			if (data.databases[0].section == 1) 
				jq(container).append(create_icon('++resource++uwosh.librarytheme.images/background_info.png', 'Reference and Background Resources', 'Reference and Background Resources'));
			else if (data.databases[0].section == 2) 
				jq(container).append(create_icon('++resource++uwosh.librarytheme.images/books.png', 'Book Resources', 'Book Resources'));
			else if (data.databases[0].section == 3) 
				jq(container).append(create_icon('++resource++uwosh.librarytheme.images/journals.png', 'Journal, Magazine and Newspaper Resources', 'Journal, Magazine and Newspaper Resources'));
			else if (data.databases[0].section == 4) 
				jq(container).append(create_icon('++resource++uwosh.librarytheme.images/primary_source.png', 'Primary Source Resources', 'Primary Source Resources'));
			else if (data.databases[0].section >= 5) 
				jq(container).append(create_icon('++resource++uwosh.librarytheme.images/ft.gif', 'Resources', 'Resources'));
			
			// Warning Messages Types
			if (data.databases[0].warning_message != '') {
				var d = jq('<div>').addClass('pane-tip-warning');
				var l = jq('<label>').css('color', 'darkred').append(jq('<img>').attr({
					'alt': 'Notice',
					'src': SiteUtil.getRootURL() + '/++resource++uwosh.libraryguides.images/warning.png'
				})).append(' Notice');
				jq(d).append(l).append(jq('<div>').html(data.databases[0].warning_message));
				jq(container).append(d);
			}
			if (data.databases[0].trial_message != '') {
				var d = jq('<div>').addClass('pane-tip-trial');
				var l = jq('<label>').css('color', '#006600').append(jq('<img>').attr({
					'alt': 'Trial Period',
					'src': SiteUtil.getRootURL() + '/++resource++uwosh.libraryguides.images/trial.png'
				})).append(' Trial Period');
				jq(d).append(l).append(jq('<div>').html(data.databases[0].trial_message));
				jq(container).append(d);
			}
			
			// Return HTML Structure
			callback(jq(container).html());
		});
			
	}
	catch(e) {
		callback();
	}
		
	
}
