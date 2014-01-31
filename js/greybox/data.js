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

/*
	This file contains functions to call out to a web service to accept these requests
	and return valid data. However there is no reference implementation of this web 
	service provided. A detailed description of these calls and their parameters and return
	types is provided with the included Developer Guide. Please refer to that document
	if you wish to implement your own back-end service.
*/

function buildRequestUrl(params) {
	var requestURL = "http://" + remoteHost;
	if(remotePort)
		requestURL += ':' + remotePort;		
	requestURL += "/" + kapPhpFile + "?t=" +  Math.random() + '&' + params;		
	return requestURL;
}

function syncWebRequest(params, data) {
	if(remoteEnabled) {
		var xmlhttp = new XMLHttpRequest();
		var requestUrl = buildRequestUrl(params);

		try {
			if(data != undefined) {
				xmlhttp.open("POST", requestUrl, false);
				xmlhttp.send(data);
			} else {
				xmlhttp.open("GET", requestUrl, false);
				xmlhttp.send();
			}
			return xmlhttp.responseText;
		} catch(e) {
			popupNotification('Error processing AJAX request, check JS console for more info');
			return '';
		}
	}
	return '';
}

function createUserSession(sessionId) {
	syncWebRequest('op=createSession&id=' + sessionId);
}

function destroyUserSession(sessionId) {
	syncWebRequest('op=destroySession&id=' + sessionId);
}	

// get data to populate runplan screen
// useCache reuses the last obtained runplan without fetching from the server
function getRunplanData(useCache, dataType, history) {	
	if(remoteEnabled) {
		if(useCache)
			return runPlanDataCache;		
			
		var xmlhttp = new XMLHttpRequest();
		var url = "http://" + remoteHost;
		if(remotePort)
			url += ':' + remotePort;	
			
		var histfrom = $(getCurrentTabId()).data('histfrom');
		var histto = $(getCurrentTabId()).data('histto');

		if(history === undefined || !history) {
			if(showHistory) {
				if(optHistFrom.length <= 0)
					optHistFrom = createHistoryDateString(histfrom);
				var sessionId = "";
				if(getSessionId() != undefined && dataType == DATA_USER)
					sessionId = "&sessionId=" + getSessionId();
				url += "/" + kapPhpFile + "?fmt=json&op=comb&start=" + optHistFrom + "&t=" +  Math.random() + sessionId;
				if(dataType == DATA_CURRENT)
					url += "&data=current";
				if(optHistTo.length > 0)
					url += "&end=" + optHistTo;
			} else {
				url += "/" + kapPhpFile + "?fmt=json&op=cur&t=" +  Math.random();
			}
		} else {
			url += "/" + kapPhpFile + "?fmt=json&op=hist&histfrom=" + createHistoryDateString(histfrom) + "&histto=" + createHistoryDateString(histto);
		}
			
		xmlhttp.open("GET", url, false);
		xmlhttp.send();
		try {
			runPlanDataCache = JSON.parse(xmlhttp.responseText);
		} catch(e) {
			popupNotification('There was an error reading the runplan data, see JS console for more information.');
			runPlanDataCache = JSON.parse(EMPTY_RUNPLAN);
			log(LOG_ERROR, e);
		}
		return runPlanDataCache;
	} else {
		return staticRunPlanData;
	}
}

function fetchoutputTargetData(week) {
	if(typeof(week) === 'undefined')
		week = 1;
	if(remoteEnabled)
		outputRequired = JSON.parse(syncWebRequest("op=outputRequired&week=" + week));	
}

function fetchHistoricoutputTargetData(date) {
	if(remoteEnabled)
		outputRequired = JSON.parse(syncWebRequest("op=histoutputRequired&date=" + date));	
}

function getAdditionalRunplanData() {
	if(remoteEnabled) {
		fetchoutputTargetData();		

		xmlhttp = new XMLHttpRequest();
		url = "http://" + remoteHost;
		if(remotePort)
			url += ':' + remotePort;		
		url += "/" + kapPhpFile + "?fmt=json&op=energy&t=" +  Math.random();
		xmlhttp.open("GET", url, false);
		xmlhttp.send();
		energy = JSON.parse(xmlhttp.responseText);	

		serverUsername = syncWebRequest("op=userinfo");

		// read existing rules into opStack array
		xmlhttp = new XMLHttpRequest();
		url = "http://" + remoteHost;
		if(remotePort)
			url += ':' + remotePort;		
		url += "/" + kapPhpFile + "?fmt=json&op=listrules&t=" +  Math.random();
		xmlhttp.open("GET", url, false);
		xmlhttp.send();
		var currentTab = getCurrentTab();
		opStack[currentTab] = (JSON.parse(xmlhttp.responseText)).rules;		

		undoLimit[currentTab] = opStack[currentTab].length; // prevent undoing of existing rules
	}
}	