/* 
 * Universal Analytic Toolset.
 * Copyright 2014, David Hietpas
 
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


// Code Retreiver
if (typeof window.__ga != 'function') {
	(function(i, s, o, g, r, a, m){
		i['GoogleAnalyticsObject'] = r;
		i[r] = i[r] ||
		function(){
			(i[r].q = i[r].q || []).push(arguments)
		}, i[r].l = 1 * new Date();
		a = s.createElement(o), m = s.getElementsByTagName(o)[0];
		a.async = 1;
		a.src = g;
		m.parentNode.insertBefore(a, m)
	})(window, document, 'script', '//www.google-analytics.com/analytics.js', '__ga');
}
	
// Factory for tracker objects
var UniversalAnalyticsTracker = function(tracker, options) {
	
	var obj = {
	
		tracker: '',
		ua_account_test: '',
		ua_account_live: '',
		ua_matchurl_live: '',
		console_out: false,
		send_data: true,
		auto_pageview: true,
		defined_dimensions: {},
		defined_metrics: {},
		send_timeout: 1000,
		
		_test: {
			count: {'success': 0, 'failure': 0},
			groups: {},
			group: null,
			manual: [],
			running: false,
			timer: 1000,
		},
		_thread: null,
		
		init: function(tracker, options){
			
			var self = this;
			for (key in options) 
				this[key] = options[key];
			this.tracker = tracker;
			this.set_tracker();
			if(this.auto_pageview)
				this.pv();
		},
		
		set_tracker: function(){
			if (document.location.href.indexOf(this.ua_matchurl_live) != -1) {
				__ga('create', this.ua_account_live, 'auto', {
					'name': this.tracker
				});
				this.console('Production Account Running');
			}
			else {
				__ga('create', this.ua_account_test, 'auto', {
					'name': this.tracker
				});
				this.console_out = true;
				this.console('Test Account Running');
			}
			
			for (var i in this.defined_dimensions)
				this.set_dimension(i, this.defined_dimensions[i]);
			for (var i in this.defined_metrics)
				this.set_metric(i, this.defined_metrics[i]);
		},
		
		set_dimension: function(dimension, value){
			__ga(this.post('set'), dimension, value);
		},
		
		set_metric: function(metric, value){
			__ga(this.post('set'), metric, value);
		},
		
		post: function(type) {
			return this.tracker + '.' + type;
		},
		
		pv: function(location, redirect, options){
			var self = this;
			self._thread = setTimeout(function(){
				self.tracking_guarantee(location, redirect);
			}, self.send_timeout);
			var o = jQuery(true,{'hitCallback': self.tracking_guarantee(location, redirect, 'pageview')}, options);
			__ga(this.post('send'), 'pageview', location, o);
		},
		
		ev: function(selector, type, category, action, label, value, redirect, proceed){
			var self = this;
			if (type == 'click') {
				type = 'mousedown';
				jQuery(selector).bind('click', function(event){
					if (jQuery(this).is('a') && !jQuery(this).is("[target]")) 
						return false; // HOLD changing current page until track_guarentee is triggered
				});
			}
			
			this._add_test(selector, type);
			jQuery(selector).bind(type, function(event){
				var p = (typeof proceed == 'function') ? proceed(this, event) : proceed;
				var r = (typeof redirect == 'function') ? redirect(this, event) : redirect;
				var c = (typeof category == 'function') ? category(this, event) : category;
				var a = (typeof action == 'function') ? action(this, event) : action;
				var l = (typeof label == 'function') ? label(this, event) : label;
				var v = (typeof value == 'function') ? value(this, event) : value;
				if (jQuery(this).is('a') && jQuery(this).is("[target]"))
					r = false; // If popup, do NOTHING
				if (r == null)
					r = jQuery(this).attr('href'); // If nothing assigned, use <a> anchor
				if (!r)
					r = null; // If false, absolutely do NOTHING
				var data = [c,a,l,v].join(' | ');
				if (p == null || p != false) {
					if (event.which == 1) { // Left click tracking guarantee
						self._thread = setTimeout(function(){
							self.tracking_guarantee(data, r, 'event');
						}, self.send_timeout);
						__ga(self.post('send'), 'event', c, a, l, self.to_int(v), {
							'hitCallback': self.tracking_guarantee(data, r, 'event')
						});
					}
					else // Other events no redirect
 						__ga(self.post('send'), 'event', c, a, l, self.to_int(v),{
							'hitCallback': self.tracking_guarantee(data, null, 'event')
						});
				}
			});
			
		},
		
		tracking_guarantee: function(data, redirect, type) {
			clearTimeout(this._thread);
			this._thread = null;
			if (typeof data === 'undefined')
				data = 'Default Analytics Data';
			if(this.console_out)
				this.console('Sending: ' + data);
			if(redirect != null && !this._test.running) 
				document.location.href = redirect;
			if (this._test.running && type == 'event')
				this._logger();
		},
		
		console: function(msg){
			if(this.console_out)
				if (typeof console === "undefined" || typeof console.log === "undefined") 
					alert(msg); // IE
				else 
					console.log(msg);
		},

		to_int: function(i){
			i = parseInt(i);
			if (isNaN(i)) 
				i = null;
			return i;
		},
		
		// TESTING LOGIC BELOW ========================
		
		_add_test: function(selector,type) {
			var self = this;
			group = this._test.group;
			if (group == null) 
				group = 'default';
			if (!this._test.groups.hasOwnProperty(group))
				this._test.groups[group] = [];
			
			jQuery(selector).each(function(i,element){
				var fn = function() {
					if (type == 'mousedown')
						jQuery(element).trigger({'type': type, 'which': 1});
					else
						jQuery(element).trigger(type);
				}
				self._test.groups[group].push(fn);
			});

		},
		
		manual_test_group: function(text) {
			this._test.manual.push(text);
		},
		
		set_test_group: function(group) {
			this._test.group = group;
		},
		
		show_tests: function() {
			this.console_out = true;
			this.console('Test Groups --------------------------------------------');
			for (i in this._test.groups)
				this.console('    ' + i + " has " + this._test.groups[i].length + " tests. Run tests with yourinstance.test('"+i+"')");
			this.console('Must Manually Test Below --------------------------------------------');
			for (i in this._test.manual)
				this.console('    ' + this._test.manual[i]);
			this.console_out = false;
		},
		
		test: function(group) {
			var self = this;
			if (!this._test.running)
				this._test_before_setup();
			if (group == null)
				group = 'Default';
			group = group
			this.console("TEST SET: " + group + ' --------------------------------------------');
			this._logger(this._test.groups[group].length);
			this.console(group + " Tests: " + this._test.groups[group].length);
			for (var i = 0; i < this._test.groups[group].length; i++) {
				var scope = function(){
					var j = i;
					setTimeout(function(){
						self._test.groups[group][j].call();
					}, self._test.timer * j);
					if (j == self._test.groups[group].length - 1) 
						setTimeout(function(){
							self.console("  Sent: " + self._test.count.success);
							self.console("Errors: " + self._test.count.failure);
						}, self._test.timer * j + 1000);
				}
				scope(); // Saves index reference in local scope, otherwise setTimeout will reference wrong index
			}
		},
		
		test_all: function() {
			for (i in this._test.groups)
				this.test(i);
		},
		
		_logger: function(init) {
			if (init != null) {
				this._test.count.failure = init;
				this._test.count.success = 0;
			}
			else {
				this._test.count.success++;
				this._test.count.failure--;
			}
		},
		
		_test_before_setup: function() {
			this.console_out = true;
			this._test.running = true;
			jQuery('form').submit(function(e){
				e.preventDefault();
				e.stopPropagation();
				return false;
			});
			jQuery('a').click(function(e){
				e.preventDefault();
				e.stopPropagation();
				return false;
			});
			jQuery('select').change(function(e){
				e.preventDefault();
				e.stopPropagation();
				return false;
			});
		},
		
		
	}

	obj.init(tracker, options);
	return obj;
}
