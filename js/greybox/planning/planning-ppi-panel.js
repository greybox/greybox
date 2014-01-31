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


// calculate how much time a block takes (in hours). 
// Only takes into consideration the length of the block up to the end of the week
function getTimeBlockTakes(block, viewport) {
	var blockWidth = $(block).outerWidth();
	var blockXPosition = $(block).position().left;
	var runplanEnd;
	var currentWeekEnd = (nextWeekStart) * getPixelsPerHour();
	
	// if its the current week (week lookahead) then end of runplan is the end of the current week
	// otherwise its the end of the runplan
	if(isCurrentWeek() && !isNextWeekSelected(viewport)) {
		runplanEnd = currentWeekEnd;
	} else {
		runplanEnd = $(getCurrentTabId()).find('.runplan-entries').outerWidth();
	}
	
	// if we're on the next week, the x position of start blocks must be clamped to the start of next week
	// in addition, blocks that fall in the current week must be disregarded
	if((isCurrentWeek() && isNextWeekSelected(viewport)) && ((blockXPosition + blockWidth) >= currentWeekEnd)) {
		blockXPosition = currentWeekEnd;
	} else if((isCurrentWeek() && isNextWeekSelected(viewport)) && ((blockXPosition + blockWidth) < currentWeekEnd)) {
		return -1;
	}
	
	// check if block is out of week/partly out of week and adjust width accordingly
	if((blockXPosition + blockWidth) > runplanEnd) {
		blockWidth = runplanEnd - blockXPosition;
	}
	
	return blockWidth / getPixelsPerHour();
}

function getFullTimeBlockTakes(block) {
	return $(block).outerWidth() / getPixelsPerHour();
}

// finds the time the block will start at
function getBlockStartTime(block) {
	return $(block).position().left / getPixelsPerHour();
}

function isBlockOffScreen(block) {
	var blockWidth = $(block).outerWidth();
	var blockXPosition = $(block).position().left;
	var runplanWidth = $(getCurrentTabId()).find('.runplan-entries').outerWidth();	
	return (blockXPosition + blockWidth) > runplanWidth;
}

function isBlockInNextWeek(block) {
	var blockWidth = $(block).outerWidth();
	var blockXPosition = $(block).position().left;
	var runplanWidth = (nextWeekStart) * getPixelsPerHour();
	return (blockXPosition + blockWidth) > runplanWidth;
}	

function blockExtendsWeek(block, viewport) {
	return (isCurrentWeek() && !isNextWeekSelected(viewport)) ? isBlockInNextWeek(block) : isBlockOffScreen(block);
}

function calculatePPIs(tabId) {
	// default to current tab
	if(typeof(tabId) === 'undefined')
		tabId = getCurrentTabId();	
		
	// reset ppi counts
	ppiEnergySaved = 0;
	ppiMaxEnergySaved = 0;
	ppiUnUtilIdle = 0;
	ppiEnergyUtil = 0;
	ppiMaxEnergyUtil = 0;
	ppioutputRequiredMade = 0;
	ppioutputRequiredMax = 0;
	ppiOutput = 0;
	ppiMaxOutput = 0;
	
	var predictedOutputTotal = 0;
	var currentOutputTotal = 0;
	var productQuanityTotals = new Array();
	
	var viewport = $(tabId).find('.runplan-viewport');
	
	$(tabId).find('.runplan-task').each(function() {
		var duration = getTimeBlockTakes(this, viewport);
		if(duration <= 0) {
			return;
		}

		if(!$(this).hasClass('History')) {
			if($(this).hasClass('Product')) {
				if(!blockExtendsWeek(this, viewport)) {
					var quantity = parseInt($(this).data('quantity'));
					var product = $(this).data('product')
					predictedOutputTotal += quantity;
					if(productQuanityTotals[product] == undefined)
						productQuanityTotals[product] = 0;
					productQuanityTotals[product] += quantity;
				} 
			} else if($(this).hasClass('Idle')) {
				ppiUnUtilIdle += duration;
			} else if($(this).hasClass('Powersave')) {
				ppiEnergySaved += (duration * (energy.Idle.energy - energy.PowerSave.energy));
			}
		}
		
		ppiMaxEnergySaved += (energy.Idle.energy * duration);
		ppiMaxEnergyUtil += duration;
	});
	
	// TODO: may need to be smarter about idle being unutilised
	ppiEnergyUtil = ppiMaxEnergyUtil - ppiUnUtilIdle;
	
	//TODO: the following needs to be changed to caclulate previous output from historic data
	ppiMaxOutput += predictedOutputTotal; // add the future output total to the max
	
	// TODO: may be changed to only include items where lower limit > 0
	ppioutputRequiredMax = outputRequired.products.length;
	
	// calculate the existing output for all products 
	var i = 0;
	for(i = 0; i < ppioutputRequiredMax; i++) {
		var prod = outputRequired.products[i].product;
		var outputTargetTarget = parseInt(outputRequired.products[i].outputTargetTarget); 
		var processed = parseInt(outputRequired.products[i].processed);
		var offset = parseInt(outputRequired.products[i].offset);
		
		var predictedOutput = productQuanityTotals[prod];
		
		if(predictedOutput == undefined) 
			predictedOutput = 0;
		
		var needed = outputTargetTarget - (predictedOutput + processed + offset);		
		
		if(outputTargetTarget == 0 || needed <= 0) {
			ppioutputRequiredMade++;
		}
		
		if((isCurrentWeek() && !isNextWeekSelected(viewport)) || !isCurrentWeek()) {
			ppiOutput += processed;
		}
	}
	
	ppiMaxOutput += ppiOutput; // add the existing output to the max
	
	for(var prod in productQuanityTotals) {
		var quantity = productQuanityTotals[prod];
		if(quantity == undefined)
			quantity = 0;
	}
	
	// store the predicted product output totals for this tab
	$(tabId).data('predictedOutput', productQuanityTotals);
	
	updatePPIBars(tabId);
	comparePPIs(tabId);
}
	
function updatePPIBars(tabId) {
	$(tabId).find('.runplan-ppi-outputRequired-no').text(ppioutputRequiredMade + '/' + ppioutputRequiredMax);
	$(tabId).find('.runplan-ppi-output-no').text(ppiMaxOutput);
	$(tabId).find('.runplan-ppi-energy-saved-no').text(Math.round(ppiEnergySaved));

	if(ppiMaxEnergyUtil == 0)
		ppiMaxEnergyUtil = 1;
	$(tabId).find('.runplan-ppi-energy-util-no').text(((ppiEnergyUtil / ppiMaxEnergyUtil) * 100).toFixed(2));	
}

function extractPpiValues(tab) {
	var outputRequiredMade = parseInt($(tab).find('.runplan-ppi-outputRequired-no').text().split('/')[0]);
	var output = parseInt($(tab).find('.runplan-ppi-output-no').text());
	var energySaved = parseInt($(tab).find('.runplan-ppi-energy-saved-no').text());
	var energyUtil = parseFloat($(tab).find('.runplan-ppi-energy-util-no').text());

	return new Array(outputRequiredMade, '.runplan-ppi-compare-outputRequired', output, '.runplan-ppi-compare-output', energySaved, '.runplan-ppi-compare-esaved', energyUtil, '.runplan-ppi-compare-eutil');
}

function comparePPIs() {
	// if none, clear text
	if($(getCurrentTabId()).find('.runplan-ppi-compare-to option:selected').text() == 'none') {
		$(getCurrentTabId()).find('.runplan-ppi-compare-icon').removeClass('runplan-ppi-increase runplan-ppi-decrease runplan-ppi-equals');
		$(getCurrentTabId()).find('.runplan-ppi-compare-value').text('');
		return;
	}
	
	// extract PPI values from other tab
	var tab = ($(getCurrentTabId()).find('.runplan-ppi-compare-to option:selected')).data('tab'); // get a handle to the tab we're comparing to
	var otherTabPpis = extractPpiValues(tab);
	var thisTabPpis = extractPpiValues(getCurrentTabId());
	
	for(var i = 0; i < otherTabPpis.length; i += 2) {
		$(getCurrentTabId()).find(otherTabPpis[i+1] + '-icon').removeClass('runplan-ppi-increase runplan-ppi-decrease runplan-ppi-equals');
		
		if(otherTabPpis[i] < thisTabPpis[i]) {
			$(getCurrentTabId()).find(otherTabPpis[i+1] + '-icon').addClass('runplan-ppi-increase');
		} else if(otherTabPpis[i] > thisTabPpis[i]) {
			$(getCurrentTabId()).find(otherTabPpis[i+1] + '-icon').addClass('runplan-ppi-decrease');
		} else {
			$(getCurrentTabId()).find(otherTabPpis[i+1] + '-icon').addClass('runplan-ppi-equals');
		}
		
		var difference = thisTabPpis[i] - otherTabPpis[i];
		if(difference != 0) {
			var fixed = parseFloat(difference).toFixed(2);
			if(Math.floor(fixed) == fixed) {
				fixed = Math.floor(fixed);
			}
			$(getCurrentTabId()).find(otherTabPpis[i+1] + '-value').text(fixed);
		}
	}	
}

 $(document).ready(function() {
	$('.runplan-ppi-compare-to').change(function() {
		comparePPIs();
	});
});