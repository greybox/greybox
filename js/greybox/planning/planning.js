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

// time related settings
var optHistFrom = '';
var optHistTo = '';
var showHistory = true;
var daysToDisplay = 14;
var maxHour = (daysToDisplay * 24) - 1;
var nextWeekStart = ((daysToDisplay / 2) * 24);

var optEnabled = false;
var feedbackEnabled = false;
var enableAnimation = true;
var showMaintenanceNames = false;
var enableSetupScreenInteraction = false;
var toolSetColours = false;
var staticHistoryEnd = ''; // set this to time static snapshot is taken, or leave blank for current time

///////////////////

var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'];
var months = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec" ];

var RULE_RESIZE = 0;
var RULE_DRAG = 1;
var RULE_INSERT = 2;
var RULE_CHANGE = 3;
var RULE_DELETE = 4;
var OP_OPTIMISE = 5;

var DATA_outputTargetTED = 0;
var DATA_CURRENT = 1;
var DATA_USER = 2;

var IDLE_BORDER_WIDTH = 2;

var WEEK_SCALE_FACTOR = 9; // how much smaller each block is on the week view

var SHIFT_HOURS = 12; // how many hours are in a shift

var VIEW_SHIFT = 'Shift';
var VIEW_WEEK = 'Week';

var VIEW_RUNPLAN = 'runplan';
var VIEW_SETUPS = 'setups';	

var COLOUR_KEY_PRODUCT = 1;
var COLOUR_KEY_STATE = 0;

var EMPTY_RUNPLAN = '{"runplan": []}'; // used when the runplan data cannot be parsed

var MAX_TOOL_HEIGHT = 40;
var MIN_TOOL_HEIGHT = 12;
var MIN_TOOL_FONT_SIZE = 7;

var serverUsername = "localuser";

var productsForSetup = outputRequired;
var selectedWeek;
var currentWeek;

var startHour, startOfWeek, curDay, curDate = 0, curMonth, curYear;
var timePeriod;
var hoursToDisplay = 19;

var handleWidth = 0;
var taskBorder = 1;

var dragAction = 'drag';

var ppiMaxEnergySaved = 0;
var ppiEnergySaved = 0;

var ppioutputRequiredMade = 0;
var ppioutputRequiredMax = 4;

var ppiEnergyUtil = 0;
var ppiMaxEnergyUtil = 0;

var ppiMaxOutput = 0;
var ppiOutput = 0;

var ppiUnUtilIdle = 0;

var products = new Object();
var numTools = 0;
var energy = new Object();
var inventoryHistory = new Object();

// these are multi-dimensional arrays that hold any operations that are performed (one array for each tab);
var opStack = new Array();
var redoStack = new Array();
var redoRuleList = new Array();
var undoLimit = new Array(); // the number of operations that are in the opStack array that can't be undone on new tab	

var toolHeight = 22; // how tall each row of the runplan is (inc borders)
var rDivWidth = 0; // width of the runplan div screen - calculated in initScreenDimensions()
var taskSlice = 0; // get the number of pixels to represent one hour - calculated in initScreenDimensions()

var view = getParameterByName('rpview');
var dates = getParameterByName('dates');
var selectedShift = getParameterByName('ShiftSelected');	

var startOfRunplan;
var endOfWeek;

var uniqueId = 0;
var ruleId = 1;

function getLastUniqueId() {
	return uniqueId;
}

function generateUniqueId() {
	uniqueId++
	return uniqueId;
}	

function getCurrentRuleId() {
	return ruleId;
}

function generateRuleId() {
	return ruleId++;
}	

// this holds the last request of runplan data, used when runplan data does not needed to be updated for performance reasons
var runPlanDataCache;
var setupsRendered = false;

function setDaysToDisplay(days) {
	daysToDisplay = days;
	maxHour = (daysToDisplay * 24) - 1;	
}

// set dimensions of screen
function initScreenDimensions() {
	var wX = window.innerWidth; //$(window).width(); // width of the window
	var wY = window.innerHeight; //$(window).height(); // height of the window
	var toolWidth = 100; // width of the tool portion of the runplan
	var padding = 5 * 2;
	var sideBarWidth = 300;
	if(wX <= 1440)
		sideBarWidth = 250;
	var sidePanelHeadingWidth = sideBarWidth - 9;
	rDivWidth = wX - sideBarWidth - toolWidth - 85; 
	//$('#runplan-tool-header').width((rDivWidth / 3.85) + 'px');
	$('#leftMainPanel').width(rDivWidth + toolWidth + 2);
	//$('#runplan-ppi').width(sideBarWidth);
	//$('#runplan-0-rules').width(sideBarWidth);
	//$('#runplan-tasks').width(sideBarWidth);
	//$('#runplan-history').width(sideBarWidth);
	//$('#runplan-output').width(sideBarWidth);
	//$('.runplan-panel-header').width(sidePanelHeadingWidth);
	$('#runplan-tool-header,#setups-tool-header').width(toolWidth);
	//$('#runplan-day-placeholder').width(toolWidth);
	//$('#runplan-day-header').width(rDivWidth);
	//$('#runplan-time-header').width(rDivWidth);
	$('.timeline').height(toolHeight * 2);
	$('.timeline').width(rDivWidth);
	
	$('#runplan-day-header,.day-header').outerHeight(toolHeight);
	$('#runplan-time-header,.time-header').height(toolHeight);
	
	//$('#runplan-day-header,.day-header').width(2000);
	//$('#runplan-time-header,.time-header').height(2000);		
	
	$('#runplan-tool-header').height(toolHeight * 2);
	$('#setups-tool-header').height(toolHeight * 2);
	
	var topOfRunplan = $('#runplan-tool-header').offset();
	//$('.timeline').offset({top: topOfRunplan.top, left: topOfRunplan.left + toolWidth});
	$('.runplan-timeline').offset({top: topOfRunplan.top, left: topOfRunplan.left + toolWidth});
	//$('.setups-timeline').offset({top: topOfRunplan.top, left: topOfRunplan.left + toolWidth});
	
	$('#setups-tools').width($('#setups-tool-header').width());
	$('#runplan-tools').width($('#runplan-tool-header').width());
	
	var height = 408;
	$('#setups-tools').height(height + 30);
	$('#runplan-tools').height(height + 30);
	$('.viewport').height(height);
	$('.setups-viewport').css({'max-height': height, 'height': 'auto'});
	
	$('#runplan-viewport,.viewport').width(rDivWidth);
	//$('.viewport').offset({top: $('.timeline').offset() - 20, left: topOfRunplan.left + + $('#runplan-tool-header').width()});
	$('.runplan-viewport').offset({top: $('.timeline').offset() - 20, left: 117});
	
	//$('#runplan-viewport,.viewport').height(wY - $('.runplan-viewport').offset().top);
	//$('#runplan-day-container').height($('#runplan-day-left img').height());
	//$('#runplan-day-container,#setups-day-container').width(rDivWidth - 1);
	//$('#runplan-day-right,#setups-day-right').css({left: toolWidth + rDivWidth + 30}); // (+ margin)

	$('.runplan-op-bar').width(rDivWidth + toolWidth - padding);
	$('#runplan-tool-bar').width(rDivWidth + toolWidth - padding);
	
	//$('#runplan-ppi-compare select').width(sidePanelHeadingWidth - $('#runplan-ppi-compare-text').width() - 20)

	if(isWeekView())
		rDivWidth /= WEEK_SCALE_FACTOR;
		
	taskSlice = Math.round(Number(rDivWidth / (hoursToDisplay)));
	
	// position feedback box
	if(feedbackEnabled) {
		var feedbackBoxTop = $('#runplan-' + getCurrentTab() + '-rules').offset();
		var feedbackBoxHeight = $('#runplan-history').offset().top - feedbackBoxTop.top + $('#runplan-history').height();
		$('#runPlan-feedback-box').offset(feedbackBoxTop);
		$('#runPlan-feedback-box').width(sideBarWidth);
		$('#runPlan-feedback-box').height(feedbackBoxHeight + 5);
	} else {
		$('#runPlan-feedback-box').hide();
	}			
}	

function getPixelsPerHour()	{
	return $(getCurrentTabId()).data('pixelsPerHour');
}

function setPixelsPerHour(val) {
	$(getCurrentTabId()).data('pixelsPerHour', val);
}	
	
//////////////////////////////

$(document).ready(function() {
    
    //SET COLOUR OF TOP NAVIGATION DASHBOARD BUTTON
    $("#topNav-plan-but").addClass("topnav-selected");
    
	timePeriod = getParameterByName('date');
	if(timePeriod == undefined)
		timePeriod = 'Current Week';
	
	startOfWeek = calculateStartOfWeek(timePeriod);
	
	if(optHistFrom.length > 0) {
		startOfWeek = new Date(optHistFrom);
	}	
	
	startHour = startOfWeek.getHours();
	curDay = startOfWeek.getDay();
	curDayHolder = startOfWeek.getDay(); // LM: Holds the current day of the week to evaluate against curDay which holds shift pattern
	curMonth = startOfWeek.getMonth();
	curYear = startOfWeek.getFullYear();	
	
	selectedWeek = getWeekNumber(startOfWeek.clone());
	currentWeek = getWeekNumber(new Date(getCurrentTime()));
	
	opStack[0] = new Array();
	redoStack[0] = new Array();
	redoRuleList[0] = new Array();
	undoLimit[0] = 0;	
	
	// set up dummy energy object for local operation
	energy.Idle = new Object();
	energy.Idle.energy = 1;
	energy.PowerSave = new Object();
	energy.PowerSave.energy = 0;
	
	startOfRunplan = startOfWeek.clone();
	endOfWeek = startOfRunplan.clone().addDays(14);
	
	// TABS
	$planningTabs = $(RUNPLAN_TAB_ID).tabs(); // apply query-ui tabs
	
	// remove some default jquery ui styling, otherwise there are undesirable font changes etc.
	$(RUNPLAN_TAB_ID).removeClass('ui-widget');
	
	// set Week view by default, and store it in tab data store
	if(view == null)
		view = VIEW_WEEK;
	$(getCurrentTabId()).data('view', view);
	$(getCurrentTabId()).data('dataView', VIEW_RUNPLAN);
	
	$(getCurrentTabId()).data('histfrom', startOfRunplan.clone());
	$(getCurrentTabId()).data('histto', startOfRunplan.clone().addDays(7));

	
	// DEFAULT RUNPLAN INIT FUNCTION CALLS - CURRENTLY ORDER & POSITION IN CODE IMPORTANT 
	// ***********************
		
	initScreenDimensions();

	// store taskSlice & rDivWidth into tab as these can change per tab via zoomin/zoomout
	// these are initially calculated in initScreenDimensions so needs to be after that function call
	$(getCurrentTabId()).data('pixelsPerHour', taskSlice);
	$(getCurrentTabId()).data('runPlanWidth', rDivWidth);
	
	getAdditionalRunplanData();
	renderTimeAndDateHeader();
	addRulesToRuleList();
	renderRunplan(getRunplanData(false, DATA_outputTargetTED));
	addProductsToSetupMenu();
	calculatePPIs();	
	renderHistoryHighlight(getCurrentTabId());
	
	$(getCurrentTabId()).find('.workWeekNumber').text(selectedWeek);

	// disable/enable zoom in/out depending on view
	setZoomButtons();
	
	// hide/show block text depending on view
	setRunplanBlockText();
			
	$('body').disableSelection();
	
	// hide the setups screen by default
	$('.setups-tools').hide();
	$('.setups-viewport').hide();
	$('.setups-timeline').hide();	
	
	// disable undo and redo
	$('#runplan-rule-redo').addClass('toolbarButtonDisabled');
	$('#runplan-rule-undo').addClass('toolbarButtonDisabled');
			
	$(window).unload(function() {
		syncWebRequest('op=destroyAllUserSessions');
	});
	
	initBulletGraphs();
	renderBulletGraphs();
	
	// set default dates
	$(getCurrentTabId()).find('.startMonth').text(startOfWeek.toString("MMM").toUpperCase());
	$(getCurrentTabId()).find('.startDay').text(startOfWeek.getDate());
	$(getCurrentTabId()).find('.endMonth').text(endOfWeek.toString("MMM").toUpperCase());
	$(getCurrentTabId()).find('.endDay').text(endOfWeek.getDate());	
	
	// add current tab
	var tabId = addNewTab(TAB_TYPE_CURRENT);
	refreshRunplan(getRunplanData(false, DATA_CURRENT), tabId);
	changeIds(tabId, extractTabFromTabId(tabId));
	$(tabId).find('.runplan-action-edit').removeClass('toolbarButtonDisabled');
	$(tabId).find('.runplan-action-outputTarget').removeClass('toolbarButtonDisabled');
	$(tabId).find('.runplan-action-optimise').removeClass('toolbarButtonDisabled');
	$(tabId).find('.runplan-action-cancel').addClass('toolbarButtonDisabled');
	$(RUNPLAN_TAB_ID).tabs("option", "active", 0); // switch back to outputTargetted
});
