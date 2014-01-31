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

// set all active button states
function setActiveButtonStates() {
	$('.toolbarActiveButton').each(function() {
		var activeClass = $(this).attr('id') + 'Hover';
		$(this).addClass(activeClass);
	});
}	

function isPanButtonSelected() {
	return $(getCurrentTabId()).find('.runplan-pan').hasClass('toolbarActiveButton');
}

//ColourKey functions

function renderColourKey(colourKeyType) {
	$('#runPlan-colorKey .spacedList').empty();
	if(colourKeyType == COLOUR_KEY_PRODUCT) {
		var i = 0;
		for(prod in products) {
			var colour = productColourArray[i];
			$('#runPlan-colorKey .spacedList').append('<li><span class="runplan-legend" style="background: ' + colour + ';">&nbsp&nbsp&nbsp&nbsp&nbsp</span> ' + prod + '</li>');
			i++;
		}
	} else {
		$('#runPlan-colorKey .spacedList').append("<li>" + 
		"<span class='Product runplan-legend'>&nbsp&nbsp&nbsp&nbsp&nbsp</span> Processing</li>" + 
		"<li>" + 
		"<span class='Idle runplan-legend'>&nbsp&nbsp&nbsp&nbsp&nbsp</span> Idle</li>" + 
		"<li>" + 
		"<span class='Powersave runplan-legend'>&nbsp&nbsp&nbsp&nbsp&nbsp</span> Powersave</li>" + 
		"<li>" + 
		"<span class='Setup runplan-legend'>&nbsp&nbsp&nbsp&nbsp&nbsp</span> Setup</li>" + 
		"<li>" + 
		"<span class='Engineering runplan-legend'>&nbsp&nbsp&nbsp&nbsp&nbsp</span> Engineering</li>" + 
		"<li>" + 
		"<span class='Down runplan-legend'>&nbsp&nbsp&nbsp&nbsp&nbsp</span> Down</li>" + 
		"<li>" + 
		"<span class='Maintenance runplan-legend'>&nbsp&nbsp&nbsp&nbsp&nbsp</span> Maintenance</li>");
	}	
}	
	
 $(document).ready(function() {
	$('.datepicker').hide();
	$('.selectWeekButton').removeClass('toolbarButtonHover');
	
	$('.selectWeekButton').click(function() {
		$(this).removeClass('toolbarButtonHover');
		
		$(this).find('.datepicker').datepicker({
			maxDate: (new Date()).next().friday(),
			onSelect: function(dateText) { 
				$(this).hide();
				selectedDate = $(this).datepicker("getDate").toString();
				var currentSelectedWeek = selectedWeek;
				selectedWeek = getWeekNumber(new Date(selectedDate)); 

				if(selectedWeek > currentWeek || selectedWeek == currentSelectedWeek) {
					return;
				}
					
				var histfrom = new Date(selectedDate).last().monday();
				var histto;
				
				if(isCurrentWeek()) {
					setDaysToDisplay(14);
					histto = new Date(selectedDate).next().monday();
				} else {
					setDaysToDisplay(7);
					histto = new Date(selectedDate).monday();
				}

				$(getCurrentTabId()).data('histfrom', histfrom);
				$(getCurrentTabId()).data('histto', histto);					

				$(getCurrentTabId()).find('.startMonth').text(histfrom.toString("MMM").toUpperCase());
				$(getCurrentTabId()).find('.startDay').text(histfrom.getDate());
				$(getCurrentTabId()).find('.endMonth').text(histto.toString("MMM").toUpperCase());
				$(getCurrentTabId()).find('.endDay').text(histto.getDate());	
				
				$(getCurrentTabId()).find('.workWeekNumber').text(selectedWeek);
				renderTimeAndDateHeader(histfrom);
				
				var wasSetupsView = isSetupsView();
				showRunplanView();				
				
				if(isCurrentWeek())
					fetchoutputTargetData();
				else
					fetchHistoricoutputTargetData(histto.getFullYear() + "-" + (histto.getMonth() + 1) + "-" + histto.getDate());
		
				fetchHistoricInventory(createHistoryDateString(histfrom), daysToDisplay);
					
				refreshRunplan(getRunplanData(false, getCurrentTab() == 0 ? DATA_outputTargetTED : DATA_CURRENT, !isCurrentWeek()));
				$(getCurrentTabId()).find('.runplan-output-row').remove();
				initBulletGraphs();
				renderBulletGraphs();
				removeHistoryHighlight(getCurrentTabId());
				if(isCurrentWeek())
					renderHistoryHighlight(getCurrentTabId());
					
				if(wasSetupsView)
					showSetupsView();	
					
				$(getCurrentTabId()).find('.selectWeekButton').removeClass('toolbarButtonHover');
				$(this).datepicker('destroy');
			}			
		});
	
		$(this).find('.datepicker').show();
	});
	
	$('.toolbarRadioButton').hover(function() {
		if(!$(this).hasClass('toolbarButtonDisabled')) {
			var hoverClass = $(this).attr('id') + 'Hover';
			$(this).addClass(hoverClass);
		}
	}, function() {
		// check to see if button has been clicked, if not, remove hover
		if(!$(this).hasClass('toolbarActiveButton')) {
			var hoverClass = $(this).attr('id') + 'Hover';
			$(this).removeClass(hoverClass);	
		}
	});
	
	$('.toolbarRadioButton').click(function() {
		var groupName = $(this).attr('data-groupName');
		$(getCurrentTabId()).find('.toolbarRadioButton').each(function() {
			if($(this).attr('data-groupName') == groupName) {
				var activeClass = $(this).attr('id') + 'Hover';
				$(this).removeClass(activeClass);
				$(this).removeClass('toolbarActiveButton');
			}
		});
		$(this).addClass('toolbarActiveButton');
		setActiveButtonStates();
	});	
	
	setActiveButtonStates();
	
	$('.toolbarButton').hover(function() {
		if(!$(this).hasClass('toolbarButtonDisabled'))
			$(this).addClass('toolbarButtonHover');
	}, function() {
		$(this).removeClass('toolbarButtonHover');
	});
	
	$('.tallToolbarButton').hover(function(event) {
		if(!$(this).hasClass('toolbarButtonDisabled'))
			$(this).addClass('tallToolbarButtonHover');
	}, function() {
		$(this).removeClass('tallToolbarButtonHover');
	});	
	
	$('.runplan-colour-by-state').click(function (event) {
		$('.runplan-task').css({'background': ''});
		renderColourKey(COLOUR_KEY_STATE);
	});

	$('.runplanbuttonClass').click(function() {
		showRunplanView();
	});

	$('.setupbuttonClass').click(function() {
		if($(this).hasClass('toolbarButtonDisabled'))
			return;
		showSetupsView();
	});
	
	$('.runplan-colour-by-product').click(function (event) {
		var i = 0;
		for(prod in products) {
			var colour = productColourArray[i];
			$(getCurrentTabId()).find('.runplan-task').each(function() {
				if(($(this).hasClass('Product'))) {
					if(($(this).data('setup') == prod))
						$(this).css({'background': colour});
				}
				else {   
					$(this).css({'background': '#E6E6E6'});						
				}
			});
			i++;
		}
		renderColourKey(COLOUR_KEY_PRODUCT);
	});
	
	$('.runplan-pan').click(function() {
		enablePan();
	});
	
	$('.runplan-arrow').click(function() {
		disablePan();
	});	
	
	$('.runplan-rule-redo').click(function(event) {
		redoRule();
	});
	
	$('.runplan-rule-undo').click(function(event) {
		undoRule();
	});
	
	$('.runplan-zoomin').click(function(event) {
		performZoom(true);
	});

	$('.runplan-zoomout').click(function(event) {
		performZoom(false);
	});
	
	$('.runplan-action-edit').click(function() {
		createEditTab();
	});
		
	$('.runplan-action-cancel').click(function(event) {
		event.preventDefault();
		var tabId = RUNPLAN_TAB_ID_PREFIX + getCurrentTab();
		
		// remove from ppi compare drop down
		var tabTitle = getTabTitle(getCurrentTab());
		$('.runplan-ppi-compare-to option').each(function() {
			if($(this).text() == tabTitle)
				$(this).remove();
		});
		
		var panelId = $('.ui-tabs-active').remove();
		
		// only destroy tables if it's an edit window
		if(isTabEditable(tabId))
			destroyUserSession($(tabId).data('sessionId'));
		
		$(tabId).remove();
		$planningTabs.tabs('refresh');
	});
	
	$('.runplan-action-outputTarget').click(function(event) {
		event.preventDefault();
		// write out rules to session DC table
		addRulesToDatabase();
		
		// read runplan and write to database
		var runPlanData = transformRunplanBlocksToArray(false, false);

		// refresh outputTargetted tab
		var loadingImage = generateLoadingImage(getCurrentTabId());
		$(getCurrentTabId()).append(loadingImage);
		syncWebRequest("op=outputTarget&id=" + $(getCurrentTabId()).data('sessionId'), JSON.stringify(runPlanData));
		// update offset values on outputTargetted tab
		var i = 0;
		$(getCurrentTabId()).find('.productOffset').each(function() {
			$(outputTargetTED_TAB_ID + ' .productOffset:eq(' + i + ')').val($(this).val());
			i++;
		});
		// copy rules to outputTargetted tab's rule list
		$(outputTargetTED_TAB_ID + ' .runplanRuleListEntry').remove();
		$(getCurrentTabId()).find('.runplanRuleListEntry').each(function() {
			var rule = $(this).clone(true);
			var id = $(rule).attr('id');
			$(rule).attr('id', id.replace(/runplan-\d/, 'runplan-0'));
			$(outputTargetTED_TAB_ID).find('.runplan-rules-list').append(rule);
		});		
		opStack[0] = opStack[getCurrentTab()];
		refreshRunplan(getRunplanData(false, DATA_outputTargetTED), outputTargetTED_TAB_ID, false);
		$(loadingImage).remove();
		
		// notify user that outputTarget was successful
		popupNotification('Data was successfully outputTargeted');
	});	
	
	$('.runplan-increase-height').click(function(event) {
		verticalZoom(true);
	});
	
	$('.runplan-decrease-height').click(function(event) {
		verticalZoom(false);
	});	
	
	$('#runplan-date-selection').change(function(event) {
		var rpview = getParameterByName('rpview');
		rpview = rpview != undefined ? "&rpview=" + rpview : '';
		
		var date = $('#runplan-date-selection option:selected').text();
		window.location.href = '//' + location.host + location.pathname + "?date=" + date + rpview;
	});
	
	$('#runPlan-colorKey').draggable( {handle:'#runPlan-colorKey-handle'});
	$('#runPlan-colorKey').hide();
	$('#closeButton').click(function() { $('#runPlan-colorKey').hide(); });
	$('#colourKey').click(function() {
		if($('#runPlan-colorKey').is(":visible")) {
			$('#runPlan-colorKey').hide();
		} else {
			var colourByProductButton = $(getCurrentTabId()).find('.runplan-colour-by-product');
			renderColourKey($(colourByProductButton).hasClass('toolbarActiveButton'));
			$('#runPlan-colorKey').show(); 
		}
	});
	
	$('.historyBackButton').click(function() {
		var histfrom = $(getCurrentTabId()).data('histfrom');
		var histto = $(getCurrentTabId()).data('histto');
		histfrom.addDays(-7);
		histto.addDays(-7);
		$(getCurrentTabId()).data('histfrom', histfrom);
		$(getCurrentTabId()).data('histto', histto);		

		$(getCurrentTabId()).find('.startMonth').text(histfrom.toString("MMM").toUpperCase());
		$(getCurrentTabId()).find('.startDay').text(histfrom.getDate());
		$(getCurrentTabId()).find('.endMonth').text(histto.toString("MMM").toUpperCase());
		$(getCurrentTabId()).find('.endDay').text(histto.getDate());	
		
		setDaysToDisplay(7);
		selectedWeek--;
		$(getCurrentTabId()).find('.workWeekNumber').text(selectedWeek);
		renderTimeAndDateHeader(histfrom);
		
		var wasSetupsView = isSetupsView();
		showRunplanView();
		
		fetchHistoricoutputTargetData(histto.getFullYear() + "-" + (histto.getMonth() + 1) + "-" + histto.getDate());
		fetchHistoricInventory(createHistoryDateString(histfrom), daysToDisplay);
		refreshRunplan(getRunplanData(false, DATA_CURRENT, true));
		$(getCurrentTabId()).find('.runplan-output-row').remove();
		initBulletGraphs();
		renderBulletGraphs();
		removeHistoryHighlight(getCurrentTabId());
		
		if(wasSetupsView)
			showSetupsView();	
	});
	
	$('.historyForwardButton').click(function() {
		// do nothing if we're already at the current week
		if(isCurrentWeek())
			return;

		var histfrom = $(getCurrentTabId()).data('histfrom');
		var histto = $(getCurrentTabId()).data('histto');
		histfrom.addDays(7);
		histto.addDays(7);
		$(getCurrentTabId()).data('histfrom', histfrom);
		$(getCurrentTabId()).data('histto', histto);			
		
		$(getCurrentTabId()).find('.startMonth').text(histfrom.toString("MMM").toUpperCase());
		$(getCurrentTabId()).find('.startDay').text(histfrom.getDate());		
			
		// if after clicking forward we're at the current week, set # days to 14
		selectedWeek++;
		$(getCurrentTabId()).find('.workWeekNumber').text(selectedWeek);
		if(isCurrentWeek()) {
			setDaysToDisplay(14);
			$(getCurrentTabId()).find('.endMonth').text(endOfWeek.toString("MMM").toUpperCase());
			$(getCurrentTabId()).find('.endDay').text(endOfWeek.getDate());			
		} else {
			$(getCurrentTabId()).find('.endMonth').text(histto.toString("MMM").toUpperCase());
			$(getCurrentTabId()).find('.endDay').text(histto.getDate());	
		}
		
		var wasSetupsView = isSetupsView();
		showRunplanView();		
		
		if(isCurrentWeek())
			fetchoutputTargetData();
		else
			fetchHistoricoutputTargetData(histto.getFullYear() + "-" + (histto.getMonth() + 1) + "-" + histto.getDate());

		fetchHistoricInventory(createHistoryDateString(histfrom), daysToDisplay);
		
		renderTimeAndDateHeader(histfrom);
		refreshRunplan(getRunplanData(false, getCurrentTab() == 0 ? DATA_outputTargetTED : DATA_CURRENT, !isCurrentWeek()));
		$(getCurrentTabId()).find('.runplan-output-row').remove();
		initBulletGraphs();
		renderBulletGraphs();
		if(!isCurrentWeek())
			removeHistoryHighlight(getCurrentTabId());
		
		if(wasSetupsView)
			showSetupsView();
	});
	
	// Handle disabled toolbar buttons
	$('.toolbarButton').click(function(event) {
		if($(this).hasClass('toolbarButtonDisabled')) {
			event.stopImmediatePropagation();
			return;
		}
	});		
 });