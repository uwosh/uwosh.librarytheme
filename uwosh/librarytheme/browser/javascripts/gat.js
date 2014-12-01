/* 
 * Google Analytic Toolset.
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
 * This is a generic toolset for Google Analytic tracking.  Jquery is 
 * required for this toolset. It can be easily extended, allowing for
 * custom events tracking.  There are three custom DOM events for tracking
 * the basic actions.  There is also a debugMode option, to have data alerted
 * rather than sent to google.  
 */

var GATThread = null;
var GATTestQue = [];
var GATTests = {};
var GATManualTests = [];
var GATTestResponse = {'status':'FAILED' , 'data':'null'};
var GATTestData = {'slow':1000,'fast':500,'speed':0,'passed':0,'failed':0,'disabled':0};
var GAT = {
	
	console_out : false,
	send_data : true,
	
	setPageTracker : function(id) {
		
		window.GATPageTracker = null;
		
	    try {
	    	window.GATPageTracker = window._gat._getTracker(id);
			window.GATPageTracker._trackPageview();
	    } catch(e) { }
	},
	
	track : function(selector, type, category, action, label, value, proceed){
		var origin = this;
        if (type=='click') type = 'mousedown';
		jQuery(selector).bind(type, function(event){
            if (type=='mousedown' && event.which==3) return; // pass on right click
			var p = (typeof proceed == 'function') ? proceed(this,event) : proceed;
			var c = (typeof category == 'function') ? category(this,event) : category;
			var a = (typeof action == 'function') ? action(this,event) : action;
			var l = (typeof label == 'function') ? label(this,event) : label;
			var v = (typeof value == 'function') ? value(this,event) : value;
			if (p == null || p != false) 
				GATTestResponse = origin.trackEvent(c, a, l, v);
		});
	},

	setCustomVar : function(i, n, v, o) {
		var s = null;
		if(this.send_data)
			s = window.GATPageTracker._setCustomVar(this._parseInt(i), n, v, this._parseInt(o));
		return this.handleResponse((s) ? "PASSED":"FAILED" , this._parseInt(i) + ' | ' + n + ' | ' + v + ' | ' + this._parseInt(o));
	},
	
	trackEvent: function(c, a, l, v){
		var s = null;
		if(this.send_data)
			s = window.GATPageTracker._trackEvent(c, a, l, GAT._parseInt(v));
		return this.handleResponse((s) ? "PASSED":"FAILED", c + ' | ' + a + ' | ' + l + ' | ' + v);
	},

	trackPageview : function(data){
		if(this.send_data)
		window.GATPageTracker._trackPageview(data);
		return this.handleResponse("PASSED", data);
	},
	
	handleResponse : function(status, data) {
		this.clearResponse();
		if (!this.send_data) status = "DISABLED";
		if (this.console_out) console.log("STATUS: " + status + "   SENT: " + data);
		return {'status': status, 'data': data };
	},
	
	consoleOut : function(b) {
		this.console_out = b;
	},
	
	sendDataToGoogle : function(b) {
		this.send_data = b;
	},
	
	_parseInt : function(i) {
		i = parseInt(i);
		if (isNaN(i)) i = null;
		return i;
	},
	
	
	//=== TEST CLASSES BELOW =========================================================
	
	test : function(selector, type, group, msg) {
		var origin = this;
		if(!GATTests.hasOwnProperty(group)) 
			GATTests[group] = [];
		jQuery(selector).each(function(i,t){
			GATTests[group].push(
				function() {
                        if(type=='click') type='mousedown';
						jQuery(t).trigger(type);
						if(GATTestResponse.status == "FAILED") GATTestData.failed += 1;
						if(GATTestResponse.status == "PASSED") GATTestData.passed += 1;
						if(GATTestResponse.status == "DISABLED") GATTestData.disabled += 1;
						console.log(GATTestResponse.status + " " + type.toUpperCase() + " >>> " +
									GATTestResponse.data + " >>> INFO: " + msg);
				}
			);
		});
	},
	
	testManually : function(msg) {
		GATManualTests.push(msg);
	},
	
	testBeforeSetup : function() {
		this.clearResponse();
		jQuery('form').submit(function(e){
			return false;
		});
		jQuery('a').click(function(e){
			return false;
		});
		jQuery('select').change(function(e){
			return false;
		});
	},
	
	showTestCases : function() {
		var total = 0;
		console.log("=== TEST CASE GROUPS ===============");
		for (var i in GATTests) {
			total += GATTests[i].length;
			console.log("Group ID: " + i + " , TESTS: " + GATTests[i].length);
		}
		console.log("Total Tests: " + total);
		console.log("=== TEST MANUALLY BELOW ===============");
		for (var i in GATManualTests) 
			console.log("Manually Test: " + GATManualTests[i]);
	},
	
	runTests : function(option,speed) {
		this.testBeforeSetup();
		GATTestQue = [];
		GATTestData.passed = 0;
		GATTestData.failed = 0;
		GATTestData.disabled = 0;
		
		// Speeds
		GATTestData.speed = GATTestData.slow;
		if(speed != null)
			GATTestData.speed = GATTestData.fast;
		
		// Options
		if (option == null)
			for(var i in GATTests) 
				GATTestQue = GATTestQue.concat(GATTests[i]);
		else 
			GATTestQue = GATTestQue.concat(GATTests[option]);
			
		GATTestQue.reverse();
		
		GATThread = setInterval(function(){
			if (GATTestQue.length == 0) {
				clearInterval(GATThread);
				GATThread = null;
				console.log("PASSED: " + GATTestData.passed);
				console.log("FAILED: " + GATTestData.failed);
				console.log("DISABLED: " + GATTestData.disabled);
				console.log("Tests Complete.  Testing has disabled elements, please reload page.");
			}
			else {
				GATTestQue.pop().call();
			}
		}, GATTestData.speed);
		
	},

	stopTests : function() {
		GATTestQue = [];
	},
	
	clearResponse : function() {
		GATTestResponse.data = null;
		GATTestResponse.status = "FAILED";
	}

}