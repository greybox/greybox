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

// Global variables for tabs
var RUNPLAN_TAB_ID = '#planningScreenTabs';
var RUNPLAN_TAB_ID_PREFIX = '#planningScreen-';
var outputTargetTED_TAB_ID = RUNPLAN_TAB_ID_PREFIX + '0';
var TAB_TYPE_EDIT = 0;
var TAB_TYPE_OPT = 1;
var TAB_TYPE_CURRENT = 2;
var tabCount = 0;

function addNewTab(tabType) {
	tabCount++;
	
	var newTabNumber = tabCount;
	var currentTabId = RUNPLAN_TAB_ID_PREFIX + getCurrentTab();
	var newTabId = RUNPLAN_TAB_ID_PREFIX + newTabNumber;
	var tabTitle = "";
	
	if(tabType == TAB_TYPE_EDIT) {
		tabTitle = 'Edit ' + (tabCount - 1);
	} else if(tabType == TAB_TYPE_OPT) {
		tabTitle =  'Edit ' + (tabCount - 1) + ' Opt';
	} else if(tabType == TAB_TYPE_CURRENT) {
		tabTitle =  'Latest';
	}
	
	$planningTabs.tabs('add', newTabId, tabTitle);
	$(newTabId).addClass('planningScreen');
	
	// copy over data stored in the tab
	$(newTabId).data('view', $(currentTabId).data('view'));
	$(newTabId).data('dataView', $(currentTabId).data('dataView'));
	$(newTabId).data('pixelsPerHour', $(getCurrentTabId()).data('pixelsPerHour'));
	$(newTabId).data('runPlanWidth', $(getCurrentTabId()).data('runPlanWidth'));
	$(newTabId).data('histfrom', $(currentTabId).data('histfrom'));
	$(newTabId).data('histto', $(currentTabId).data('histto'));
	$(newTabId).data('predictedOutput', $(currentTabId).data('predictedOutput'));
	
	// NB: need to remove interaction (if present) before clone or there will be problems reapplying drag/resize behaviour
	if(isTabEditable(currentTabId))
		removeInteraction(currentTabId);
	var newTab = $(currentTabId).clone(true).children();
	// need to reapply interaction to old tab
	if(isTabEditable(currentTabId))
		initInteraction(currentTabId);
	
	$(newTabId).append(newTab);
	//$(newTabId).find('.setupbuttonClass').addClass('toolbarButtonDisabled'); // disable setups button
	
	if(tabType == TAB_TYPE_EDIT) {
		changeIds(newTabId, newTabNumber);
	}
	
	$(newTabId).find('.runplan-rules').attr('id', 'runplan-' + newTabNumber + '-rules');
	$(newTabId).find('.runplan-rules-list').attr('id', 'runplan-' + newTabNumber + '-rules-list');
	$(newTabId).find('.runplan-rule-undo').attr('id', 'runplan-' + newTabNumber + '-rule-undo');
	$(newTabId).find('.runplan-rule-redo').attr('id', 'runplan-' + newTabNumber + '-rule-redo');
	
	$(newTabId).find('.bulletGraph').each(function() {
		$(this).attr('id', $(this).attr('id').replace(/runplan-\d/, 'runplan-' + newTabNumber));
	});
	
	$(newTabId).find('.runplan-output-row').each(function() {
		$(this).attr('id', $(this).attr('id').replace(/runplan-\d/, 'runplan-' + newTabNumber));
	});
	
	// destroy any existing datepickers
	$(newTabId).find('.datepicker').datepicker('destroy');
	$(newTabId).find('.datepicker').removeClass("hasDatepicker").removeAttr('id');
	
	// copy operation stacks
	/*opStack[newTabNumber] = opStack[getCurrentTab()].slice();
	redoStack[newTabNumber] = redoStack[getCurrentTab()].slice();
	redoRuleList[newTabNumber] = redoRuleList[getCurrentTab()].slice();*/
	// fresh operation stacks
	//opStack[newTabNumber] = new Array();
	//redoStack[newTabNumber] = new Array();
	//redoRuleList[newTabNumber] = new Array();
	
	// old operations remain (can't undo old operations, redo history cleared)
	opStack[newTabNumber] = opStack[getCurrentTab()].slice();
	undoLimit[newTabNumber] = opStack[newTabNumber].length;
	redoStack[newTabNumber] = new Array();
	redoRuleList[newTabNumber] = new Array();
	
	$(newTabId).find('.runplan-rule-undo').addClass('toolbarButtonDisabled');
	$(newTabId).find('.runplan-rule-redo').addClass('toolbarButtonDisabled');
	
	// enable relevant buttons on new tab
	$(newTabId).find('.runplan-action-outputTarget').removeClass('toolbarButtonDisabled');
	$(newTabId).find('.runplan-action-cancel').removeClass('toolbarButtonDisabled');
	// only allow opt if optEnabled = true and we're on an edit tab
	if(optEnabled && tabType == TAB_TYPE_EDIT)
		$(newTabId).find('.runplan-action-optimise').removeClass('toolbarButtonDisabled');
	else
		$(newTabId).find('.runplan-action-optimise').addClass('toolbarButtonDisabled');	
	
	// clear PPI colour highlighting
	$(newTabId).find('.runplan-ppi-value').removeClass('runplan-ppi-text-increase runplan-ppi-text-decrease');
	
	if(tabType == TAB_TYPE_EDIT) {
		$(newTabId).data('editable', true);
		initInteraction(newTabId);
	} else {
		$(newTabId).data('editable', false);
	}
	
	var currentScrollPosition = $(currentTabId).find('.runplan-viewport').scrollLeft();
	
	// switch to new tab
	$(RUNPLAN_TAB_ID).tabs("option", "active", -1);

	// scroll over to same position as last tab
	$(newTabId).find('.runplan-viewport').scrollLeft(currentScrollPosition);
	
	// store session id
	$(newTabId).data('sessionId', tabCount);
	
	// add this tab to the compare to drop downs. note we don't add the new tab to the new tab's list
	$('.planningScreen').each(function() {
		var tab = this;
		var thisTabTitle = $('a[href="#' + $(tab).attr('id') + '"]').text();
		// clear existing entries, and add 'none'
		$(tab).find('.runplan-ppi-compare-to').empty();
		$(tab).find('.runplan-ppi-compare-to').append('<option>none</option>');
		// iterate through each tab title
		$(RUNPLAN_TAB_ID + ' li').each(function() {
			if(thisTabTitle != $(this).text()) {
				var tabId = $(this).find('a').attr('href');
				var newOption = $('<option/>').text($(this).text()).data('tab', tabId);
				$(tab).find('.runplan-ppi-compare-to')
					.append(newOption);
			}
		});
	});
	
	// reassociate rule->block mappings to newly created blocks
	associateRulesToBlocks(newTabId);
	
	// enable/disable zoom in/out depending on view
	setZoomButtons();

	renderBulletGraphs();
	
	// enable offset editing (if applicable)
	if(isTabEditable()) {
		$(newTabId).find('.productOffset').each(function() {
			$(this).attr('disabled', false);
		});
	}
		
	return newTabId;
}	

function associateRulesToBlocks(tabId) { 
	$('#runplan-' + getCurrentTab() + '-rules-list .runplanRuleListEntry').each(function() {
		var ruleId = $(this).data('ruleId');
		var ruleListEntry = this;
		$(tabId).find('.runplan-task').each(function() {
			if($(this).data('ruleId') != undefined) {
				if($(this).data('ruleId') == ruleId) {
					$(ruleListEntry).data('associatedBlock', this);
				}
			}
		});
	});		
}	

function changeIds(tab, tabNumber) {
	$(tab).find('.runplan-entry').each(function() {
		var oldId = $(this).attr('id');
		var number = oldId.substring(oldId.lastIndexOf('-') + 1);
		var newId = 'runplan-' + tabNumber + '-entry-' + number;
		$(this).attr('id', newId);
	});
	
	$(tab).find('.runplan-tool').each(function() {
		var oldId = $(this).attr('id');
		var number = oldId.substring(oldId.lastIndexOf('-') + 1);
		var newId = 'runplan-' + tabNumber + '-tool-' + number;
		$(this).attr('id', newId);
		$(this).find('table').attr('id', 'runplan-' + tabNumber + '-tool-' + number + '-table');
	});	
	
	// make sure all rule ids in the rules list are set to current tba
	// if rules are copied from the previous tab they will have ids associated to the original tab
	// e.g. replace runplan-1-rules-rule1 with runplan-2-rules-rule1
	$(tab).find('.runplanRuleListEntry').each(function() {
		var id = $(this).attr('id');
		var first = id.indexOf('-');
		var second = id.indexOf('-', first + 1);
		var postfix = id.substr(second);
		$(this).attr('id', 'runplan-' + tabNumber + postfix);
	});
}

function getCurrentTab() {
	return extractTabFromTabId(getCurrentTabId());
}

function getCurrentTabId() {
	return '#' + $(RUNPLAN_TAB_ID + ' .ui-tabs-nav .ui-state-active').attr('aria-controls');
}	

function getCurrentTabTitle() {
	return getTabTitle(getCurrentTab());
}

function getTabTitle(tabNumber) {
	return $($(RUNPLAN_TAB_ID + ' li')[tabNumber]).text();
}

function isTabEditable(tabId) {
	// default to current tab
	if(typeof(tabId) === 'undefined')
		tabId = getCurrentTabId();	
	return $(tabId).data('editable');
}

function extractTabFromTabId(tabId) {
	return tabId.match(/(\d)/)[1];
}

function getSessionId(tabId) {
	// default to current tab
	if(typeof(tabId) === 'undefined')
		tabId = getCurrentTabId();	
	if(typeof($(tabId).data('sessionId')) !== 'undefined')
		return $(tabId).data('sessionId');
	return '';
}

function createEditTab() {
	var newTab = addNewTab(TAB_TYPE_EDIT);
	createUserSession($(newTab).data('sessionId'));
}	