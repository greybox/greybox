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

// for node.js (offline ppi calculation)
if(typeof(module) !== 'undefined') {
	module.exports = {
	  calculateStartOfWeek: calculateStartOfWeek,
	};
}
	
var kapPhpFile = 'kap.php';
var remoteEnabled = false;
	
// list of colours to use for "colour by product"
var productColourArray = ['#F3C300','#875692','#F38400','#A1CAF1','#BE0032','#C2B280','#848482','#008856','#E68FAC','#0067A5','#F99379','#604E97','#F6A600',
		'#B3446C', '#DCD300', '#882D17', '#8DB600', '#654522', '#E25822','#2B3D26'];	

// bullet graph style
var bulletGraphOpts = {
	type: 'bullet',
	width: '110px',
	height: '16px'
};

function getCurrentTime() {
	if(remoteEnabled) {
		return parseInt(syncWebRequest('op=servertime'));
	} else {
		return parseInt(new Date().getTime());
	}
}

function calculateStartOfWeek(timePeriod) {
	var currentTimeAsDate = new Date(getCurrentTime() * 1);
	var startOfWeek;
	
	if(timePeriod == 'Current Week') {
		if(currentTimeAsDate.is().monday())
			startOfWeek = currentTimeAsDate;
		else
			startOfWeek = currentTimeAsDate.previous().monday();
	} else {
		if(currentTimeAsDate.is().monday())
			startOfWeek = currentTimeAsDate.last().monday();	
		else
			startOfWeek = currentTimeAsDate.last().monday().last().monday();	
	}

	startOfWeek.setHours(12);
	startOfWeek.setMinutes(0);
	startOfWeek.setSeconds(0);

	return startOfWeek;
}

// TODO: code improv: convert array to object
function getBulletGraphValues(prodIndex, tabId) {
	if(tabId === undefined)
		tabId = getCurrentTabId();
	
	var prodName = outputRequired.products[prodIndex].product;
	var offset = parseInt(outputRequired.products[prodIndex].offset);
	var upperLimit = parseInt(outputRequired.products[prodIndex].ulimit);
	var lowerLimit = parseInt(outputRequired.products[prodIndex].llimit);
	var meet = parseInt(outputRequired.products[prodIndex].meet);
	var processed = Math.abs(outputRequired.products[prodIndex].processed);
	var target = Math.abs(outputRequired.products[prodIndex].outputTargetTarget);
	
	var predictedOutput = 0;
	var productQuanityTotals = $(tabId).data('predictedOutput');
	if(productQuanityTotals !== undefined && productQuanityTotals[prodName] !== undefined)
		predictedOutput = Math.abs(productQuanityTotals[prodName]);

	var values = new Array(target, processed, predictedOutput, offset, upperLimit, lowerLimit, (predictedOutput + processed), meet);
	return values;
}

function onBulletGraphMouseIn(event, showPredictedOutput) {
	if(showPredictedOutput === undefined)
		showPredictedOutput = true;
	
	var tPosX = $(this).offset().left;
	var tPosY = $(this).offset().top;
	$('#sparklinebox').css({
		top: tPosY + $(this).height(), 
		left: tPosX,
		width: $(this).width()
	});		
	
	var prodIndex = $(this).attr('prodId');
	var values = getBulletGraphValues(prodIndex);
	
	$('#sparklinebox').show();
	
	var outputTargetTargetType = "Custom";
	var outputTargetTarget = values[0];
	var ulimit = values[4];
	var llimit = values[5];
	var meet = values[7];
	
	if(outputTargetTarget == ulimit)
		outputTargetTargetType = "Upper Limit";
	if(outputTargetTarget == llimit)
		outputTargetTargetType = "Lower Limit";
	if(outputTargetTarget == meet)
		outputTargetTargetType = "Meet";
		
	var html = '<tr class="sparkline-table-row"><td style="text-align:right;"><div class="sparkline-table-bulletLegend" style="background: #00005E;"/></td><td width="155px">Current Output</td><td class="numberCell">' + values[1] + '</td></tr>' + '<tr><td class="sparkline-table-breakline" colspan="3"></td></tr>';
	
	if(showPredictedOutput)
		html += '<tr class="sparkline-table-row"><td><div class="sparkline-table-bulletLegend" style="background: #7B7BAD;" /></td><td>Predicted Output</td><td class="numberCell">' + values[6] + '</td></tr>' + '<tr><td class="sparkline-table-breakline" colspan="3"></td></tr>';
	
	html +=  '<tr class="sparkline-table-row"><td><div class="sparkline-table-bulletLegend" style="background: #9E9EDD;"/></td><td>Offset</td><td class="numberCell">' + values[3] + '</td></tr>' + 
	'<tr><td class="sparkline-table-breakline" colspan="3"></td></tr>' + 
	'<tr class="sparkline-table-row"><td><div class="sparkline-table-bulletLegend" style="background: #000; width: 2px"/></td><td>Goal (' + outputTargetTargetType + ')</td><td class="numberCell">' + outputTargetTarget + '</td></tr>' + 
	'<tr><td class="sparkline-table-breakline" colspan="3"></td></tr>' + 
	'<tr class="sparkline-table-row"><td></td><td>Predicted delta to goal</td><td class="numberCell">' + ((values[0] - (values[1] + values[2])) - values[3]) + '</td></tr>'	
	
	$('#sparkline-table > tbody:last').append(html);
}

function onBulletGraphMouseOut(event) {
	$('#sparklinebox').hide();
	$('#sparkline-table tr').remove();
}

function calculatePredictedInventory(product, time, time2) {
	var inventoryForProduct = productInventory[product];
	var inventoryTotal = 0;
	for(i in inventoryForProduct) {
		var lot = inventoryForProduct[i];
		if((lot.time * 24) < time) {
			if(time2 !== undefined) {
				if((lot.time * 24) >= time2)
					inventoryTotal += parseInt(lot.quantity);
			} else {
				inventoryTotal += parseInt(lot.quantity);
			}
		}
	}
	return inventoryTotal;
}

if(typeof(document) !== "undefined") {	
	$(document).ready(function() {
		Number.prototype.pad = function (len) {
			return (new Array(len+1).join("0") + this).slice(-len);
		}
		
		$('.topnav-link').click(function(event) {
			var link = $(this).text().toLowerCase().replace(/[^a-z0-9]+/g,'') + '.html';
			window.location = link;
		});
		
		$('.topnav-link').hover(function(event) {
			$(this).addClass('topnav-link-hover');
			document.body.style.cursor = 'pointer';
		}, function(event) {
			$(this).removeClass('topnav-link-hover');
			document.body.style.cursor = 'default';
		});
		
		(function($){
			$.fn.disableSelection = function() {
				return this
						 .attr('unselectable', 'on')
						 .css('user-select', 'none')
						 .on('selectstart', false);
			};
		})(jQuery);	
	});
}
	
function printNavMenu() {
	document.write('<div id="menubar">');
	document.write('	<img class="logoHeader" src="img/GREYBOX_logo.png"/>');
	document.write('	<div id="topNav-plan-but" class="topnav-link">PLANNING</div>');
	document.write('</div>');
}

function getWeekNumber(d) {
    d = new Date(d);
    d.setHours(0,0,0);
    d.setDate(d.getDate() + 4 - (d.getDay()||7));
    var yearStart = new Date(d.getFullYear(),0,1);
    var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7)
    return weekNo;
}

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function createHistoryDateString(date) {
	return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + startHour + ":00:00.000";
}

function getParameterByName(name) {
    var match = RegExp('[?&]' + name + '=([^&]*)')
                    .exec(window.location.search);

    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

var LOG_DEBUG = 4;
var LOG_INFO = 3;
var LOG_WARN = 2;
var LOG_ERROR = 1;
var LOG_OFF = 0;

var logLevel = LOG_INFO;
var logLevelText = ['', 'ERROR', 'WARN', 'INFO', 'DEBUG'];

function log(level, message) {
	if(logLevel >= level && window.console) {
		console.log(logLevelText[level] + ": " + message);
	}
}	