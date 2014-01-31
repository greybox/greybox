/*---------------------------------------------------------------------------------------------------
   Copyright (c) 2013 Intel Performance Learning Solutions Ltd, Intel Corporation.

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
---------------------------------------------------------------------------------------------------*/

 $(document).ready(function() {
	var defaultTextCleared = false;
	
	$('#runPlan-feedback-submit').click(function(e) {
		if(remoteEnabled) {
			var xmlhttp = new XMLHttpRequest();
			url = "http://" + remoteHost;
			if(remotePort)
				url += ':' + remotePort;		
			url += "/" + kapPhpFile + "?op=feedback&content=" + $('#runPlan-feedback-text').val() + "&name=" + $('#runPlan-feedback-name').val() + "&t=" +  Math.random();	
			xmlhttp.open("GET", url, false);
			xmlhttp.send();				
		}
		
		$('#runPlan-feedback-text').val('Thanks for your feedback. Add any additional feedback here.');
		defaultTextCleared = false;
	});
	
	//clear text on click
	$('#runPlan-feedback-text').focus(function(e) {
		if(!defaultTextCleared) {
			$('#runPlan-feedback-text').val('');
			defaultTextCleared = true;
		}
	});
});