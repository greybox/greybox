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

function getRunPlanWidth() {
	return $(getCurrentTabId()).data('runPlanWidth');
}

function setRunPlanWidth(val) {
	$(getCurrentTabId()).data('runPlanWidth', val);
}

function setRunplanBlockText(tabId) {
	if(tabId === undefined)
		tabId = getCurrentTabId();
	var view = $(tabId).data('view');
	if(view == VIEW_SHIFT)
		showRunplanBlockText(tabId);
	else
		hideRunplanBlockText(tabId)
}

function hideRunplanBlockText(tabId) {
	$(tabId).find('.runplan-entry span').hide();
}

function showRunplanBlockText(tabId) {
	$(tabId).find('.runplan-entry span').show();
}		

function getToolHeight() {
	return $('#runplan-tool-0').height() + parseInt($('#runplan-tool-0').css('border-top-width')) + parseInt($('#runplan-tool-0').css('border-bottom-width'));
}	

function refreshRunplan(runPlanData, tabId, noRemove, op) {
	// default to current tab
	if(typeof(tabId) === 'undefined')
		tabId = getCurrentTabId();
		
	if(!noRemove) {
		$(tabId).find('.runplan-entry').remove();
		$(tabId).find('.runplan-tool').remove()
	} else {
		op.entries = $(tabId).find('.runplan-entry').detach();
		op.tools = $(tabId).find('.runplan-tool').detach();		
	}
	
	renderRunplan(runPlanData, tabId);
	
	if(isTabEditable(tabId))
		initInteraction(tabId);
		
	$(tabId).find('.runplan-ppi-bar-fill').removeClass('runplan-ppi-opt-needed');
	$(tabId).find('.runplan-ppi-value').removeClass('runplan-ppi-text-opt-needed');
		
	calculatePPIs(tabId);	
	renderBulletGraphs(tabId);
	setRunplanBlockText(tabId);
	
	// refresh the history higlight block
	removeHistoryHighlight(tabId);
	renderHistoryHighlight(tabId);
	
	var colourByButton = $(tabId).find('.runplan-colour-by-product');
	if($(colourByButton).hasClass('toolbarActiveButton')) {
		$(colourByButton).click();
	}		
}

// only allow non-idle, non-historic, blocks to be resized and moved
function initInteraction(tabId) {
	$(tabId).find('.runplan-task')
		.not('.Idle,.History,.InProgress')
		.resizable(resizableOpts)
		.draggable(draggableOpts);
		
	var resizableOpts2 = jQuery.extend(true, {}, resizableOpts);
	resizableOpts2.handles = 'e';
	
	$(tabId).find('.InProgress')
		.not('.Idle,.History')
		.resizable(resizableOpts2);
}	

// remove drag/drop from whole tab
function removeInteraction(tabId) {
	$(tabId).find('.ui-draggable').draggable('destroy');
	$(tabId).find('.ui-resizable').resizable('destroy');
	$(tabId).find('.ui-resizable-handle').remove();
	$(tabId).find('.runplan-task').removeClass('ui-draggable ui-resizable');	
}
	
function generateLoadingImage(tabId) {
	var viewPort = $(tabId).find('.runplan-viewport');
	
	var imageTop = $(viewPort).offset().top + Math.min(($(viewPort).height() / 2), (window.innerHeight - $(viewPort).offset().top) / 2);
	var loadingImage = $('<img/>')
		.attr('src', 'img/loading.gif')
		.addClass('loadingImage')
		.css({'position': 'absolute'})
		.css({'zIndex': 2147483647 })
		.css({'top': imageTop, 'left': $(viewPort).offset().left + ($(viewPort).width() / 2)});	
		
	return loadingImage;
}	

function popupNotification(msg) {
	var runplanViewportWidth = $(getCurrentTabId()).find('.runplan-viewport').outerWidth();
	$('#notificationBox')
		.css({left: (runplanViewportWidth / 2), top: 60})
		.text(msg)
		.fadeIn('slow')
		.delay('3000')
		.fadeOut('slow');
}

function showPanCursor() {
	$('*').addClass('pan-cursor');
}

function showPointerCursor() {
	$('*').removeClass('pan-cursor');
}

function enablePan() {
	showPanCursor();
	$('.runplan-task:ui-draggable').css({'opacity': '1.0'}).draggable('disable');
	$('.runplan-task:ui-draggable').removeClass('ui-state-disabled');
	dragAction = 'pan';
}

function disablePan() {
	showPointerCursor();
	$('.runplan-task:ui-draggable').draggable('enable');
	dragAction = 'drag';
}	
	
function getHistoryHighlightEndTime() {
	if(!remoteEnabled && staticHistoryEnd !== undefined && staticHistoryEnd.length > 0)
		return Date.parse(staticHistoryEnd);
	else
		return getCurrentTime();
}		

function getHistoryHoursNum() {
	if(optHistTo.length > 0) {
		return ((new Date(optHistTo).getTime() - new Date(optHistFrom).getTime()) / 1000) / 3600;
	}
	return ((getHistoryHighlightEndTime() - startOfRunplan.clone().getTime()) / 1000) / 3600;
}

function removeHistoryHighlight(tabId) {
	$(tabId).find('.historyHighlight').remove();
}

var historyHighlightHeight = 0;

function renderHistoryHighlight(tabId) {
	if(!showHistory)
		return;
	
	var view = 'runplan';
		
	var historyHours = getHistoryHoursNum();	
	var entries = $(getCurrentTabId()).find('.' + view + '-entries'); // need to grab current tabs history highlight as non selected tab will return 0 height
	var dayHeader = $(tabId).find('.' + view + '-day-header');
	var timeHeader = $(tabId).find('.' + view + '-time-header');
	var viewport = $(tabId).find('.' + view + '-viewport');
	
	historyHighlightHeight = $(entries).height() - ($(dayHeader).outerHeight() + $(timeHeader).outerHeight()) + 45;
		
	var historyHighlight = $('<div/>')
			.addClass('historyHighlight')
			.width(historyHours * getPixelsPerHour())
			.height(historyHighlightHeight)
			.css({left: 0, top: ($(dayHeader).outerHeight() + $(timeHeader).outerHeight() - 45)})
			.show();

	var nextWeekHighlight = $('<div/>')
			.addClass('historyHighlight')
			.width(((maxHour - nextWeekStart) + 1) * getPixelsPerHour())
			.height(historyHighlightHeight)
			.css({left : (nextWeekStart) * getPixelsPerHour(), top: ($(dayHeader).outerHeight() + $(timeHeader).outerHeight() - 45), position: 'absolute'})
			.addClass('nextWeekHighlight')
			.show();
			
	$(viewport).append(historyHighlight);
	$(viewport).append(nextWeekHighlight);
}	

	//todo: remove border-right on last runplan-header-day
	
function getTaskX(num, grid) {
	if(num == 0)
		return 0;
		
	var i, x = 0;
	for(i = 0; i < num; i++) 
		x += grid[i];
		
	return x;
}

// disable/enable zoom in/out depending on initial zoom level
function setZoomButtons() {
	if(isWeekView()) {
		$(getCurrentTabId()).find('.runplan-zoomin').attr({src: 'img/zoomin.png'});
		$(getCurrentTabId()).find('.runplan-zoomout').attr({src: 'img/zoomout_disabled.png'});		
	} else {
		$(getCurrentTabId()).find('.runplan-zoomin').attr({src: 'img/zoomin_disabled.png'});	
		$(getCurrentTabId()).find('.runplan-zoomout').attr({src: 'img/zoomout.png'});		
	}
}

function transformRunplanBlocksToArray(timeBaseZero, includeHistory) {
	var runPlanData = new Array();
	var currentTime = getCurrentTime();
	$(getCurrentTabId()).find('.runplan-entry').each(function() {
		
		var toolIdString = getCurrentTab() + '-';
		if(getCurrentTab() == 0)
			toolIdString = '';
			
		var toolId = $(getCurrentTabId()).find('#runplan-' + toolIdString + 'tool-' + $(this).data('nid') + '-table td').text();

		var firstBlock = true;
		var initialTime = 0;
		$(this).find('.runplan-task').each(function() {
			if($(this).hasClass('History') && !includeHistory)
				return;
				
			var time;
			if(firstBlock) {
				time = 0;
				initialTime = $(this).position().left / getPixelsPerHour();
				firstBlock = false;
			} else {
				time = ($(this).position().left / getPixelsPerHour()) - initialTime;
			}
			var nextBlockTime;
			var nextBlock = $(this).next();
			if($(nextBlock).length > 0) {
				nextBlockTime = ($(nextBlock).position().left / getPixelsPerHour()) - initialTime;
			} else {
				nextBlockTime = ($(this).parent().outerWidth() / getPixelsPerHour()) - initialTime;
			}
			var runPlanEntry = new Object();
			runPlanEntry.ToolID = toolId;
			if(!timeBaseZero) {
				runPlanEntry.Time = time * 3600;
				runPlanEntry.Time += (currentTime / 1000);
			} else {
				runPlanEntry.Time = time;
			}
				
			runPlanEntry.Duration = nextBlockTime - time;
			runPlanEntry.State = $(this).data('type');
			if(runPlanEntry.State == 'Product')
				runPlanEntry.State = 'Run';
			runPlanEntry.Setup = $(this).data('setup')
			runPlanEntry.LotID = $(this).data('lotid');
			runPlanEntry.Product = $(this).data('product');
			runPlanEntry.Qty = $(this).data('quantity');
			runPlanEntry.DC = $(this).data('ruleId');
			runPlanEntry.History = $(this).hasClass('History');
			runPlanData.push(runPlanEntry);
		});
	})	
	
	return runPlanData;
}	
	
function isRunplanView() {
	return $(getCurrentTabId()).data('dataView') == VIEW_RUNPLAN;
}

function showRunplanView() {
	$(getCurrentTabId()).find('.runplan-tools').show();
	$(getCurrentTabId()).find('.runplan-viewport').show();
	$(getCurrentTabId()).find('.runplan-timeline').show();
	$(getCurrentTabId()).find('.setups-tools').hide();
	$(getCurrentTabId()).find('.setups-viewport').hide();
	$(getCurrentTabId()).find('.setups-timeline').hide();
	$(getCurrentTabId()).data('dataView', VIEW_RUNPLAN);
	removeHistoryHighlight(getCurrentTabId());
	renderHistoryHighlight(getCurrentTabId());		
}
	
function isShiftView() {
	return $(getCurrentTabId()).data('view') == VIEW_SHIFT;
}

function isWeekView() {
	return !isShiftView();
}

function verticalZoom(zoomIn) {
	var scaleFactor = 1.1;
	var increaseFactor = 1;
	
	if(!zoomIn) { 
		scaleFactor = 1 / scaleFactor;
		increaseFactor = -increaseFactor;
	}
		
	var tabId = getCurrentTabId();
	
	var runplanEntries = $(tabId).find('.runplan-entries');
	var runplanEntry = $(tabId).find('.runplan-entry');
	var runplanViewport = $(tabId).find('.runplan-viewport');
	var runplanToolsContainer =  $(tabId).find('.runplan-tools');
	
	var runplanTools = $(tabId).find('.runplan-tool');
	var runplanTasks = $(tabId).find('.runplan-task');
	var firstTask = runplanTasks[0];
	var firstTool = runplanTools[0];
	var newToolHeight = $(firstTool).outerHeight() * scaleFactor;
	var newTaskHeight = Math.round(($(firstTask).height() + increaseFactor) * scaleFactor);
	
	if(newToolHeight > MAX_TOOL_HEIGHT || newToolHeight < MIN_TOOL_HEIGHT)
		return;
		
	var newToolFontSize = parseInt($(firstTool).find('td').css('font-size')) + increaseFactor;
	if(newToolFontSize < MIN_TOOL_FONT_SIZE)
		newToolFontSize = MIN_TOOL_FONT_SIZE;
		
	var newToolPaddingTop = parseInt($(firstTool).find('td').css('padding-top')) + increaseFactor;
	
	runplanTools.each(function() {
		$(this).outerHeight(newToolHeight);
		$(this).find('td').css({'font-size': newToolFontSize, 'padding-top': newToolPaddingTop});
	});	
	
	runplanEntry.outerHeight(newToolHeight)
	runplanTasks.outerHeight(newTaskHeight).css({'font-size': newToolFontSize});
	
	removeHistoryHighlight(tabId);
	renderHistoryHighlight(tabId);	
}

// returns true if we are looking at the current week and not historic data
function isCurrentWeek() {
	return selectedWeek == currentWeek;
}

// returns true if we're looking at the second week in the current week view
function isNextWeekSelected(viewport) {
	if(isShiftView())
		return $(viewport).scrollLeft() > (nextWeekStart - SHIFT_HOURS) * getPixelsPerHour();
	else
		return $(viewport).scrollLeft() > (nextWeekStart - (SHIFT_HOURS * 6)) * getPixelsPerHour();
}	

function performZoom(zoomIn, scroll) {
	if(scroll === undefined)
		scroll = true;
		
	if(!isRunplanView())
		return;
		
	// check to see if we are already at max zoom
	if((zoomIn && isShiftView()) || !(zoomIn || isShiftView()))
		return;

	var scaleFactor = WEEK_SCALE_FACTOR;
	if(!zoomIn)
		scaleFactor = 1/WEEK_SCALE_FACTOR;
		
	var tabId = getCurrentTabId();
		
	setRunPlanWidth(getRunPlanWidth() * scaleFactor);
	setPixelsPerHour(getPixelsPerHour() * scaleFactor);
	
	if(zoomIn) {
		$(tabId).data('view', VIEW_SHIFT);
	} else {
		$(tabId).data('view', VIEW_WEEK);
	}
	
	var runplanEntries = $(tabId).find('.runplan-entries');
	var runplanEntry = $(tabId).find('.runplan-entry');
	var runplanViewport = $(tabId).find('.runplan-viewport');
	
	$(runplanEntries).width($(runplanEntries).outerWidth() * scaleFactor);
	$(runplanEntry).width($(runplanEntry).outerWidth() * scaleFactor);
	
	if(enableAnimation) {
		$(tabId).find('.runplan-task').each(function() {
			$(this).animate({
			left: (parseInt($(this).css('left'), 10) * scaleFactor),
			width: $(this).outerWidth() * scaleFactor
		}, {duration: 1500, queue: false})});
	} else {
		$(tabId).find('.runplan-task').each(function() {
			$(this).outerWidth($(this).outerWidth() * scaleFactor);
			$(this).css({left: $(this).position().left * scaleFactor});
		});		
	}
	
	removeHistoryHighlight(tabId);
	renderHistoryHighlight(tabId);

	if(zoomIn && scroll) {
		if(enableAnimation)
			$(runplanViewport).animate({scrollLeft: (getHistoryHoursNum() - 4) * getPixelsPerHour()}, {duration: 1500, queue: false});		
		else
			$(runplanViewport).scrollLeft((getHistoryHoursNum() - 4) * getPixelsPerHour());
	} else if(!zoomIn) {
		$(runplanViewport).scrollLeft(0);
	}
	
	renderTimeAndDateHeader();
	
	setZoomButtons();
	setRunplanBlockText();
	
	extendLastBlocksInRunplan();
}	

var prevToolSetId;
var alternateColour = false;
var highlightEntry;

function renderRunplan(runPlanData, tabId) {	
	// default to current tab
	if(typeof(tabId) === 'undefined')
		tabId = getCurrentTabId();
		
	var taskEntry;
	var taskGrid = new Array();
	var j = 0;
	var curTool;
	
	for(i = 0; i < runPlanData.runplan.length; i++) {
		var data = runPlanData.runplan[i];
		
		// code to stop infinite numbers ruining runplan - skip block and print warning
		if(!isFinite(data.time) || data.time == 'INF') {
			popupNotification("Infinity time value detected on tool " + data.toolid + ", check JS console for more information");
			continue;
		}
		
		// skip tasks that extend past our view date
		if(data.time > maxHour) {
			continue;
		}
			
		var length; 
		if(i < runPlanData.runplan.length - 1) {
			var nextTask = runPlanData.runplan[i+1];
			var nextTaskTime = nextTask.time;
			
			// code to stop infinite numbers ruining runplan - we ignore the infinite block and attempt to use the block after instead
			if(!isFinite(nextTaskTime) || nextTaskTime == 'INF') {
				if(i < runPlanData.runplan.length - 2)
					nextTaskTime = runPlanData.runplan[i+2].time;
				else
					nextTaskTime = 0;
			} 
			
			length = (nextTaskTime - data.time);
			if(nextTaskTime == 0)
				length = maxHour - data.time;
		} else {
			length  = maxHour - data.time;
		}
		
		var taskText = data.state;

		var taskClass = data.state;
		var toolTip = taskText;
		if(taskClass == 'Run' || taskClass == 'Product') {
			taskClass = 'Product';
			taskText = 'Product ' + data.setup;
			toolTip = 'Product ' + data.setup + ' (' + data.lotid + ')';
		} else if(showMaintenanceNames && taskClass == 'Maintenance') {
			toolTip = taskText = 'Maintenance ' + data.setup;
		}
		
		var product = data.setup, quantity = parseInt(data.quantity);
		
		if(taskClass == 'Product') {
			if(quantity === undefined || !isNumber(quantity)) {
				quantity = 0;
			}
			
			quantity = parseInt(quantity); // force integer
			
			if(product === undefined || product.length == 0) {
				product = "Unknown";
			}

			if(products[product] == undefined) {
				products[product] = new Object();
				products[product].quantity = 0;
				products[product].output = 0;
			}

			products[product].quantity += quantity;
			products[product].output += quantity;
		}
		
		var taskWidth = Math.round(length * getPixelsPerHour());
		if(taskWidth == 0)
			taskWidth = 1;
		
		//if(data.time == 0) {
		if(data.toolid != curTool) {
			curTool = data.toolid
			var config = "";
			if(data.lotid != undefined)
				config = data.lotid;
			var toolTabString = '';
			if(getCurrentTab() > 0)
				toolTabString = getCurrentTab() + '-';
			var toolDiv = $('<div/>')
				.addClass('runplan-tool')
				.attr('id', 'runplan-' + toolTabString + 'tool-' + i)
				.height(toolHeight)
				.append('<table id="runplan-' + toolTabString + 'tool-' + i + '-table" class="runplan-tool-table"><tr><td style="padding-left: 4px; padding-top:5px;">' + data.toolid + '</td></tr>');
			
			// highlight alternate toolsets
			if(toolSetColours) {
				highlightEntry = false;
				var toolSetId = data.toolid.substring(0, 5);
				if(prevToolSetId === undefined)
					prevToolSetId = toolSetId;
					
				if(alternateColour && toolSetId != prevToolSetId) {
					prevToolSetId = toolSetId;
					alternateColour = false;
					toolDiv.addClass('runplanToolHighlight');
					highlightEntry = true;
				} else if(!alternateColour && toolSetId == prevToolSetId) {
					toolDiv.addClass('runplanToolHighlight');
					highlightEntry = true;
				} else  {
					alternateColour = true;
					prevToolSetId = toolSetId;
				}
			}
			
			$(tabId).find('.runplan-tools').append(toolDiv);
			numTools++;
			
			//$(toolDiv).addClass(taskClass + '-tool');
			
			j = 0;
			
			taskEntry = $('<div/>')
				.addClass('runplan-entry')
				.attr('id', 'runplan-entry-' + i)
				.data('nid', i)
				.height(toolHeight - 6);
				
			if(highlightEntry)
				taskEntry.addClass('runplanEntryHighlight');
		}
		
		var leftPos = 0;
		var previousDiv = $(taskEntry).find('.runplan-task:last-child');
		if($(previousDiv).length > 0) {
			leftPos = $(previousDiv).position().left + $(previousDiv).outerWidth();
		}			
				
		taskGrid[j] = taskWidth;
		var slot = $('<div/>')
			.addClass(taskClass)
			.addClass('runplan-task')
			.css({'width': (taskWidth + 'px')})
			.data('hours', length)
			.data('index', j)
			.data('type', taskClass)
			.data('setup', data.setup)
			.height(toolHeight - 6)
			.css({'left': leftPos})
			.css({'top': 0, 'position': 'absolute'})
			.attr('title', toolTip)
			.append('<span>' + taskText + '</span>');

		if(highlightEntry && taskClass == 'UP')
			slot.addClass('runplanTaskHighlight');	
		
		if(data.running == 'true') {
			$(slot).addClass('InProgress');			
		}
			
		if(taskClass == 'Setup') {
			$(slot).data('setup', data.setup);
		}
		
		if(taskClass == 'Product') {
			$(slot).data('quantity', quantity);
			$(slot).data('product', product);
			$(slot).data('lotid', data.lotid);
		} 
		
		if(data.history == 'true') {
			$(slot).addClass('History');
		} else if(data.dc > 0) { // associate rule
			$(slot).addClass('dynamicConstraint');
			// go through each rule in the rule list and associate rule entry with block
			// and rule id with block
			$('#runplan-' + getCurrentTab() + '-rules-list .runplanRuleListEntry').each(function() {
				if($(this).data('ruleId') == data.dc) {
					$(this).data('associatedBlock', slot);
					$(slot).data('ruleId', data.dc);
				}
			});
		}
					
		taskEntry.append(slot);			
		j++;
			
		if((data.time == 0) || (i == (runPlanData.runplan.length - 1)))	
			$(tabId).find('.runplan-entries').append(taskEntry);
	}
	
	setRunplanBlockText();
	extendLastBlocksInRunplan();
	
	// if the state is carrying on from last historic state, then remove border from ajoining tasks
	$(tabId).find('.InProgress').css({'border-left': '0px'});
}

function extendLastBlocksInRunplan() {
	$(getCurrentTabId()).find('.runplan-entry').each(function() {
		var lastBlock = $(this).find('.runplan-task').last();
		var newWidth = $(this).parent().outerWidth() - $(lastBlock).position().left;
		$(lastBlock).outerWidth(newWidth);
	});
}

function addProductsToSetupMenu() {
	// add products to context menu
	for(var prod in productsForSetup.products) {
		var prodName = productsForSetup.products[prod].product;
		if(prodName.length > 0) {
			$('#contextMenu-setup-menu')
				.append('<tr><td class="contextMenuItem-setup">' + prodName + '</td></tr>');
		}
	}
}	

// enables/disables resize and draggable depending on task type
function applyInteraction(task) {
	// force removal of resize and drag
	$(task).resizable();
	$(task).find('.ui-resizable-handle').remove();
	$(task).resizable('destroy');
	$(task).draggable();
	$(task).draggable('destroy');
	
	if(isResizable($(task).data('type'))) {
		$(task).resizable(resizableOpts);
		$(task).resizable('enable');
	} 
	
	if(isDraggable($(task).data('type'))) {
		$(task).draggable(draggableOpts);
		$(task).draggable('enable');
	}
}	



function createTimeMarker(event, time) {
	event.stopPropagation();
	var time = getTimeBlock(event);
	
	$('#runplan-entry-highlight-line').remove();
	var line = $('<div/>')
		.attr('id', 'runplan-entry-highlight-line')
		.css({opacity: 0.3, background: '#777777', position: 'absolute', 'zIndex': 999999})
		.width(2)
		.height($(time).height())
		.css({left: event.pageX, top: $(time).offset().top})
		.show();	
		
	$('body').append(line);
}

function getTimeBlock(event) {
	var time;
	$('.runplan-time,.runplan-time-even,.runplan-day-shift,.runplan-night-shift').each(function() {
		// find the time that the mouse position corresponds to
		if(event.pageX >= $(this).offset().left && event.pageX <= ($(this).offset().left + $(this).width())) {
			time = this;
		}
	});
	return time;
}

function getTaskOffset(task, i) {
	var curIndex = $(task).data('index');
	var obj;
	$(task).parent().parent().find('.runplan-task').each(function() {
		if($(this).data('index') == curIndex + i) {
			obj = $(this).offset();
		}
	});	
	return obj;
}

var startWidth = 0;
var startPos;
var startLeft;
var prevTask, nextTask;
var maxDivWidth = 9999;

var startPosPrev = 0;

var runplanRuleNo = 0;
var prevPosition, prevwidth;

var resizableOpts = {
		enabled: true,
		handles: 'w,e',
		start: function (event, ui) {
				var nextDiv = $(this).next();
				var prevDiv = $(this).prev();	
				var resizable = true;
				
				$(this).resizable('option', 'maxWidth', null);
								
				if(!resizable) {
					$(this).resizable('option', 'minWidth', ui.size.width);
					$(this).resizable('option', 'maxWidth', ui.size.width);
					return true;
				}
				
				startWidth = $(this).outerWidth();
				startPos = $(this).offset();
				startLeft = parseInt($(this).css('left').replace('px', ''));
				prevTask = getTaskOffset($(this), -1);
				nextTask = getTaskOffset($(this), 1);					
									
				if(prevDiv != undefined) {
					prevDiv.data('origWidth', prevDiv.outerWidth());
					startPosPrev = $(this).prev().offset();
				}
				$(this).data('moved', 0);
				
				prevPosition = ui.position.left
				prevWidth = ui.size.width;
				
				// store x positions and widths before resize
				var uniqueId = generateUniqueId();
				$(this).parent().children().each(function() {
					$(this).data('origX' + uniqueId, $(this).position().left);
					$(this).data('origWidth' + uniqueId, $(this).outerWidth());
				});	
		},
		//containment: '.runplan-entry',
		resize: 
			function (event, ui) {
				var prevDiv = $(this).prev();
				var nextDiv = $(this).next();
				
				if(ui.position.left != ui.originalPosition.left) { //for west resize
					// TODO: use position instead of width
					if(prevDiv.length > 0) { 
						var prevX = $(prevDiv).offset().left; // starting X pos of previous block
						var curX = $(this).offset().left; // X pos of current block
						var width = curX - prevX;

						// prevent resizing smaller than getPixelsPerHour()
						if($(this).outerWidth() <= getPixelsPerHour()) {
							$(this).resizable('option', 'maxWidth', ui.size.width);
						} 
						//TODO: move prevent resize to "start" function to prevent any resizing (otherwise if resized quickly it will still work)
						else if(!$(prevDiv).hasClass('Idle') && !$(prevDiv).hasClass('Powersave')) {
							if(curX <= (prevX + $(prevDiv).outerWidth())) {
								$(this).resizable('option', 'maxWidth', ui.size.width);
							}
						} else { // if preceding block is idle, then squash it
							//TODO: this check should be "if($(prevDiv).outerWidth() - change >= 2)", to check if the idle will be used up premtivly,
							if($(prevDiv).outerWidth() > 0 && !$(prevDiv).hasClass('dynamicConstraint')) {
								$(prevDiv).outerWidth(width);
								if(width < 0) {
									$(this).resizable('option', 'maxWidth', ui.size.width);
								}
							}
							else { // if the idle space is squished, prevent further resizing
								$(this).resizable('option', 'maxWidth', ui.size.width);
							}
						}
					}
				} else {
					// for each block, push out as much as it is being resized
					var changeDelta = ui.size.width - prevWidth; // difference between two resizes
					prevWidth = ui.size.width;						
					
					// Don't use Idle space
					//TODO: remove squashed idle blocks on resize stop and snap to next block
					//TODO: On insert-> dont fill entire block always, fill out to say 3/4 hours, and if needs be, push out blocks ahead
					//TODO: when resizing smaller, don't pull blocks to the left
					var usingIdle = 0;
					
					if(changeDelta < 0) {
						if($(nextDiv).hasClass('Idle')) {
							var left = $(this).position().left + $(this).outerWidth();
							$(nextDiv).css({left: left + 'px'});
							$(nextDiv).outerWidth($(nextDiv).outerWidth() + Math.abs(changeDelta));
						} else {
							var slot = $('<div/>')
								.addClass('Idle')
								.addClass('runplan-task')
								.data('type', 'Idle')
								.css({'width': Math.abs(changeDelta) + 'px'})
								.height(getToolHeight() - 1)
								.css({'left': ($(this).position().left + $(this).outerWidth()) + 'px'})
								.css({'top': 0, 'position': 'absolute'})
								.append('<span>Idle</span>');	
								
								$(slot).insertAfter($(this));	
						}
					} else {						
						$(this).nextAll().each(function() {
							if($(this).hasClass('Idle') || ($(this).hasClass('Powersave') && !$(this).hasClass('dynamicConstraint'))) {
								if($(this).outerWidth() <= 2) {
										usingIdle = 0;
								}
								
								if(!usingIdle) {
									if($(this).outerWidth() > 2) {
										usingIdle = 1;
										var prevWidth = $(this).outerWidth();
										$(this).outerWidth($(this).outerWidth() - changeDelta);
										$(this).css({left: ($(this).position().left + changeDelta) + 'px'});
										if($(this).outerWidth() <= 2) {
											usingIdle = 0;	
											changeDelta -= prevWidth; // need to offset the change delta by what was left of the idle block before it was removed
										}
									}
								}
							} else {
								if(!usingIdle) {
									var offset = $(this).offset();
									offset.left += changeDelta;
									$(this).offset(offset);
								}
							}
						});			
					}
				}
			}, 
		stop: function(event, ui) {
			var prevDiv = $(this).prev();
			//TODO: Need to make sure idle space doesnt overlap any blocks
			//TODO: related: idle space created when resizing west to right doesnt create proper idle space size
			if(ui.position.left != ui.originalPosition.left) { //for west resize
				// note, negative 'change' = increase in size to the left, positive 'change' = reduction in size to right
				var newWidth = $(prevDiv).data('origWidth');
				var change = ui.position.left - ui.originalPosition.left;
				
				// if no resize change dont create rule etc.
				if(change == 0) 
					return;
				
				// sometimes when redrawing blocks while resizing, blocks will overlap, especially on slower computers. This final setting of width will set the widths 
				// snug up against each other once the resizing stops
				if($(prevDiv).length > 0) {
					var prevX = $(prevDiv).offset().left; // starting X pos of previous block
					var curX = $(this).offset().left; // X pos of current block
					//$(prevDiv).outerWidth(curX - prevX); // snap width of previous block to fit the space between the previous and current block
					
					// if we've made the block smaller, insert (or extend) idle block
					if(change > 0) { 
						if($(prevDiv).hasClass('Idle') || $(prevDiv).hasClass('Powersave')) {
							$(prevDiv).outerWidth($(this).position().left - $(prevDiv).position().left);
						} else {
							var slot = $('<div/>')
								.addClass('Idle')
								.addClass('runplan-task')
								.data('type', 'Idle')
								.css({'width': ($(this).position().left - ui.originalPosition.left) + 'px'})
								.data('hours', change / (getPixelsPerHour()))
								.data('index', 0)
								.height(getToolHeight() - 1)
								.css({'left': (ui.originalPosition.left) + 'px'})
								.css({'top': 0, 'position': 'absolute'})
								.append('<span>Idle</span>');	
							//$(slot).resizable(resizableOpts).draggable(draggableOpts);
							$(slot).insertBefore($(this));
						}
					}
				}	
				else if(prevDiv.length == 0) { // create a new idle task to left to fill whitespace
					if($(this).hasClass('Idle') || $(this).hasClass('Powersave')) { // if its idle, just reextend idle
						$(this).css({'left': '0px'});
						$(this).width(ui.originalSize.width);
					} else {
						var slot = $('<div/>')
							.addClass('Idle')
							.addClass('runplan-task')
							.css({'width': (change + 'px')})
							.data('hours', change / (getPixelsPerHour() * 4))
							.data('index', 0)
							.height(getToolHeight() - 1)
							.css({'left': '0px'})
							.css({'top': 0, 'position': 'absolute'})
							.append('<span>Idle</span>');	
						//$(slot).resizable(resizableOpts).draggable(draggableOpts);
						$(slot).insertBefore($(this));
						//var rowindex = $(slot).parent().index() - 2;
						//$('.runplan-tool:eq(' + rowindex +')').css({'background-color': $(slot).css('background-color')});
					}
				}
			} else { // east resize
				var change = ui.size.width - ui.originalSize.width;
				$(this).outerWidth(ui.size.width);
				
				// realign following divs to fill any blank areas
				var adjustment = -1; // we calculate the adjustment later based on the first non idle block after the moved block
				var movedDiv = this;
				$(this).nextAll().each(function() {
					if($(this).hasClass('Idle') && $(this).outerWidth() <= 2) {
						$(this).remove();
					} else {
						if(adjustment == -1)
							adjustment = $(this).position().left - ($(movedDiv).position().left + $(movedDiv).outerWidth());
							
						$(this).css({left: ($(this).position().left - adjustment) + 'px'});
					}
				});
				
				if(change == 0)
					return;					
			}
			
			var offset = 0;
			var length = 0;
			
			// TODO: CORRECT THESE FROM/TO TIMES, SAME WITH DRAG
			
			// for west resize, we make the offset the orig x position, and set the length to the new x position
			if(ui.position.left != ui.originalPosition.left) {
				offset = startPos
				length = $(this).offset().left;
			} else { // otherwise, the x pos = original x offset + original width and length = new x offset + width
				offset = startPos + startWidth;
				length = $(this).offset().left + $(this).outerWidth();
			}
			
			cleanIdleAndPowersave($(this).parent());
			addRule(RULE_RESIZE, startPos.left, this, ($(this).outerWidth() / getPixelsPerHour()) * 60);
			calculatePPIs();
		}
};

function createIdleBlock(width, x) {
	var slot = $('<div/>')
		.addClass('Idle')
		.addClass('runplan-task')
		.data('type', 'Idle')
		.css({'width': width + 'px'})
		.height(getToolHeight() - 1)
		.css({'left': x + 'px'})
		.css({'top': 0, 'position': 'absolute'})
		.append('<span>Idle</span>');	

	return slot;
}	

// determines if a block is resizable
function isResizable(blockType) {
	return !(blockType.toLowerCase() == 'idle');
}

// determines if a block is draggable
function isDraggable(blockType) {
	return !(blockType.toLowerCase() == 'idle');
}	

// searches for adjoining blocks of the same type that makes sense to join together
function joinBlocks(runplanEntry) {
	$(runplanEntry).children().each(function() {
		if(!$(this).hasClass('History')) {
			if($(this).hasClass('Down') || $(this).hasClass('Idle') || $(this).hasClass('Powersave') || $(this).hasClass('Maintenance') || $(this).hasClass('Engineering')) {
				if($(this).data('type') == $(this).next().data('type') && !$(this).hasClass('dynamicConstraint')) {
					$(this).outerWidth($(this).outerWidth() + $(this).next().outerWidth())
					$(this).next().remove();
				}
			}
		}
	});
}

// expands idle & powersave space to fill gaps and removes zero sized idle/powersave 
function cleanIdleAndPowersave(runplanEntry) {
	joinBlocks(runplanEntry);
	
	$(runplanEntry).children().each(function() {
		if(!$(this).hasClass('History')) {
			var nextBlock = $(this).next();
			var prevBlock = $(this).prev();
			var x = $(this).position().left;
			// if we have an idle or powersave block, make sure its snug between non idle/powersave blocks
			if($(this).hasClass('Idle') || $(this).hasClass('Powersave')) {
				// remove any idle blocks that are just border or thinner
				if($(this).outerWidth() <= IDLE_BORDER_WIDTH) {
					$(this).remove();
					return;
				}
				// modify block size to fit next block
				var nextX, prevX;
				if($(nextBlock).length > 0) {
					nextX = $(nextBlock).position().left;
				} else {
					nextX = $(this).closest('.runplan-entries').outerWidth();
					
				}
				$(this).outerWidth(nextX - x);
				// modify block size to fit previous block
				if($(prevBlock).length > 0) {
					prevX = $(prevBlock).position().left + $(prevBlock).outerWidth();
				} else {
					prevX = 0;
				}
				$(this).css({'left': prevX});
			} else {
				// create an idle block to fill in the space
				var nextX;
				if($(nextBlock).length > 0) {
					nextX = $(nextBlock).position().left;
				} else {
					nextX = $(this).closest('.runplan-entries').outerWidth();
				}
				
				var rightPos = x + $(this).outerWidth();
				if(rightPos + 1 < nextX) {
					var idle = createIdleBlock(nextX - rightPos, rightPos);
					$(idle).insertAfter($(this));
				}
			}
		}
	});
	
	joinBlocks(runplanEntry);
}

var draggableOpts = {
		//containment: '#runplan-viewport',
		enabled: true,
		zIndex: 5,
		axis: 'x',
		start: function() {
			$('.runplan-entry').css({'z-index': '99'});
			$(this).css({'z-index': '100'});
			//$(this).hide();
			$(this).data('startpos', $(this).offset());
			var uniqueId = generateUniqueId();
			$(this).parent().children().each(function() {
				$(this).data('origX' + uniqueId, $(this).position().left);
			});
			$(this).prev().data('origWidth', $(this).prev().outerWidth());
		},
		helper: 'original',
		drag: function(event, ui) {
			var prev = $(this).prev();
			var next = $(this).next();
			var x = ui.offset.left - $(this).offset().left;
			//if(x < 0 && $(this).prev().outerWidth() < getPixelsPerHour()) {
			if(x < 0 && !(prev && ($(prev).hasClass('Idle') || $(prev).hasClass('Powersave')))) { // prevent sooner in time unless idle or powersave
				return false;
			} else if($(this).hasClass('Idle')) { // prevent moving idle
				return false;
			} else {					
				// if we're moving this back, we need to stop the drag once it uses up all the idle/powersave space
				if(x < 0) {
					var prevPrev = $(prev).prev(); // block before the idle or powersave
					if($(prevPrev).length > 0) {
						//TODO: the following check should be: "((this).offset().left + x) <=" for maximum smoothness, at the moment the stop
						// method rearranges the blocks if it's dragged to far which is noticable
						if($(this).offset().left <= ($(prevPrev).offset().left + $(prevPrev).outerWidth())) {
							//force the rightmost position (otherwise block may be dragged way past)
							$(this).offset({left: ($(prevPrev).offset().left + $(prevPrev).outerWidth()), top: $(this).offset().top});
							return false;
						} else {
							// if next block is idle, extend that as its being dragged
							if($(next).length > 0 && ($(next).hasClass('Idle') || $(next).hasClass('Powersave'))) {
								var pos = $(next).position();
								pos.left += x; // x = negative
								$(next).css({left: pos.left + 'px'});
								$(next).outerWidth($(next).outerWidth() - x);
								$(next).data('collapsed', false)
							} else { // insert idle block
								var rightPos = ($(this).position().left + $(this).outerWidth());
								var width;
								if($(next).length > 0)
									width = $(next).position().left - rightPos;
								else
									width = $('#runplan-entries').outerWidth();
								
								var slot = $('<div/>')
									.addClass('Idle')
									.addClass('runplan-task')
									.data('type', 'Idle')
									.css({'width': (width - x) + 'px'})
									.height(getToolHeight() - 1)
									.css({'left': ($(this).position().left + $(this).outerWidth() + x)+ 'px'})
									.css({'top': 0, 'position': 'absolute'})
									.append('<span>Idle</span>');	
									
									$(slot).insertAfter($(this));									
							}
							// if the previous block is idle, we need to reduce it's size as its being dragged west
							if($(prev).length > 0 && ($(prev).hasClass('Idle') || $(prev).hasClass('Powersave'))) {
								$(prev).outerWidth($(prev).outerWidth() + x);
							}								
						}
					}
				}
				
				// push blocks out in time, but don't drag them all closer in time
				// need to eat up idle time where available but no other block type
				if(x > 0) {
					// extend idle block thasts to the left to the right while being dragged
					if($(prev).length > 0 && ($(prev).hasClass('Idle') || $(prev).hasClass('Powersave'))) {
						$(prev).outerWidth($(prev).outerWidth() + x);
					}					
					
					var i = 0;
					var idleToUse = -1;
					$(this).nextAll().each(function() {
						if($(this).hasClass('Idle') || $(this).hasClass('Powersave')) {
							// TODO: remove idle blocks on drag stop
							if($(this).outerWidth() <= 2) {		
								if(idleToUse == -1) {
									var pos = $(this).offset();
									pos.left += x;
									$(this).offset(pos);
								} 								
								return;
							}
								
							if($(this).outerWidth() > 2) {
								if(idleToUse == -1) {
									var pos = $(this).position().left;
									var idleWidth = $(this).outerWidth() - 1;
									$(this).css({left: pos + x});
									$(this).outerWidth(Math.max(0, $(this).outerWidth() - x));
									if($(this).outerWidth() > 2) {
										idleToUse = i;
									} else {
										//$(this).data('collapsed', true);
										// need to now subtract the difference between the change and the used up idle width
										x -= idleWidth;
									}
								}
							} else {
								idleToUse = -1;
								//$(this).data('collapsed', true);
							}
						} else {
							//TODO: if we go forward, and then go back, we need to fill the forward space with idle
							if(idleToUse == -1) {
								var pos = $(this).offset();
								pos.left += x;
								$(this).offset(pos);
							} 
						}
						i++;
					});
				}
			}
		}, 
		stop: function(event, ui) {

			var prevDiv = $(this).prev();
			var x = Math.round($(this).offset().left - $(this).data('startpos').left);

			if(x == 0)
				return;
				
			// remove any idle space that was completely squashed in
			//TODO: extend this to whole row
			$(this).next().each(function() {
				if(($(this).hasClass('Idle') || $(this).hasClass('Powersave')) && $(this).outerWidth() <= 2)
					$(this).remove();
			});
			

			//TODO: after every operation (drag and resize), ensure that idle space fits snugly between blocks, and doesnt under/overlap any blocks to the left or right
			
			//TODO: when dragging to the left, when it snaps to stop, blocks to the right might overlap the dragged block, need to ensure these are repositioned correctly
			
			//TODO: any idle space thats > width of 1 should have collapsed set to false
			//TODO: redo to use width instead of collapsed attribute
			
			//TODO: need to keep track of the size of the block, and push out blocks if it is being overlapped when the drag operation is finished
			
			//TODO: if the block is dragged forward and back, we might need to insert an idle block to both the left and right
				
			if($(prevDiv).length == 0) { // create a new idle task to left to fill whitespace
				if($(this).hasClass('Idle') || $(this).hasClass('Powersave')) { // if its idle, just reextend idle
					$(this).css({'left': '0px'});
					$(this).width($(this).width() + x);
				} else {
					var slot = $('<div/>')
						.addClass('Idle')
						.addClass('runplan-task')
						.css({'width': (x + 'px')})
						.data('hours', x / (getPixelsPerHour() * 4))
						.data('index', 0)
						.data('type', 'Idle')
						.height(getToolHeight() - 1)
						.css({'left': '0px'})
						.css({'top': 0, 'position': 'absolute'})
						.append('<span>Idle</span>');	
					//$(slot).resizable(resizableOpts).draggable(draggableOpts);
					$(slot).insertBefore($(this));
				}
			} else if(x > 0) {
				if($(prevDiv).hasClass('Idle') || $(prevDiv).hasClass('Powersave')) { // if prev div is idle, extend
					//$(prevDiv).width($(prevDiv).width() + x);
				} else {				
					var leftPos = ($(prevDiv).position().left + $(prevDiv).outerWidth());
					var width = $(this).position().left - leftPos;					

					var slot = $('<div/>')
						.addClass('Idle')
						.addClass('runplan-task')
						.css({'width': (width + 'px')})
						.data('hours', x / (getPixelsPerHour()))
						.data('index', 0)
						.data('type', 'Idle')
						.height(getToolHeight() - 1)
						.css({'left': ($(prevDiv).position().left + $(prevDiv).outerWidth())+ 'px'})
						.css({'top': 0, 'position': 'absolute'})
						.append('<span>Idle</span>');	
						
					//$(slot).resizable(resizableOpts).draggable(draggableOpts);
					$(slot).insertBefore($(this));				
				}
				/*
				var prevX = $(this).prev().offset().left + $(this).prev().outerWidth();
				var x = $(this).offset().left - prevX;
				$(this).prev().outerWidth($(this).prev().outerWidth() + x);
				*/
			} else if(x < 0) {
				var nextDiv = $(this).next();
				if($(nextDiv).length > 0 && ($(nextDiv).hasClass('Idle') || $(nextDiv).hasClass('Powersave'))) {
					//var pos = $(nextDiv).position().left;
					//var width = $(nextDiv).outerWidth();
					//$(nextDiv).css({left: pos + x, width: width + Math.abs(x)});
					var rightPos = ($(this).position().left + $(this).outerWidth());
					var nextBlockPosition = 0;
					if($(nextDiv).next().length > 0) 
						nextBlockPosition = $(nextDiv).next().position().left;
					else // width is end of runplan
						nextBlockPosition = $('#runplan-entries').outerWidth();
					var width = nextBlockPosition - rightPos;		
					$(nextDiv).css({left: rightPos + 'px', width: width + 'px'});
				} else {
					// calculate distance between this and next block
					//TODO: fix for case when next block is last block on runplan
					var rightPos = ($(this).position().left + $(this).outerWidth());
					var width = $(nextDiv).position().left - rightPos;
					
					var slot = $('<div/>')
						.addClass('Idle')
						.addClass('runplan-task')
						.css({'width': width + 'px'})
						.data('hours', x / (getPixelsPerHour()))
						.data('index', 0)
						.data('type', 'Idle')
						.height(getToolHeight() - 1)
						.css({'left': ($(this).position().left + $(this).outerWidth())+ 'px'})
						.css({'top': 0, 'position': 'absolute'})
						.append('<span>Idle</span>');	
						
					//$(slot).resizable(resizableOpts).draggable(draggableOpts);
					$(slot).insertAfter($(this));		
				}
			}
			
			cleanIdleAndPowersave($(this).parent());
			addRule(RULE_DRAG, $(this).data('startpos').left, this, ($(this).outerWidth() / getPixelsPerHour()) * 60);
			calculatePPIs();
		},
		scroll: false
};
	
 $(document).ready(function() {
	var lastSelectedWeek = selectedWeek;	
	
	// handle scrolling into next week (and back into current week)
	$('.runplan-viewport').scroll(function(event) {
		if(isCurrentWeek()) {
			if(isNextWeekSelected(this) && lastSelectedWeek == selectedWeek) {
				$(getCurrentTabId()).find('.workWeekNumber').text(selectedWeek + 1);
				lastSelectedWeek = selectedWeek + 1;
				fetchoutputTargetData(2);
				calculatePPIs();
				renderBulletGraphs();
			} else if(!isNextWeekSelected(this) && (lastSelectedWeek == selectedWeek + 1)){
				$(getCurrentTabId()).find('.workWeekNumber').text(selectedWeek);
				lastSelectedWeek = selectedWeek;
				fetchoutputTargetData(1);
				calculatePPIs();
				renderBulletGraphs();
			}
		}
	});		
	
	//rollover for resize handles on resizeable task blocks
	$('.ui-resizable-w,.ui-resizable-e').live('mouseenter mouseleave', function(event) {
		if(event.type == 'mouseenter') {
			$(this).css('opacity', 1.0);
		} else {
			$(this).css('opacity', 0.55);
		}
	});
		
	$('.runplan-entry').droppable({
		'tolerence' : 'fit'
	});	
	
	$(document).keydown(function(e) {
		if(e.keyCode == 16) {
			enablePan();
		}
	});
	
	$('.viewport,day-header').mousedown(function (event) {
		if(dragAction == 'pan') {
			$(this)
				.data('clicked', true)
				.data('x', event.clientX)
				.data('scrollLeft', this.scrollLeft);
				return false;
		}
	});
	
	$('.viewport').mouseup(function (event) {
		$(this).data('clicked', false);
		if(!isPanButtonSelected())
			disablePan();		
	});	
	
	$('.viewport').mousemove(function (event) {
		if (dragAction == 'pan' && $(this).data('clicked') == true) {
			this.scrollLeft = $(this).data('scrollLeft') + $(this).data('x') - event.clientX;
		}
	});	

	$('.viewport').mouseenter(function (event) {
		if(isPanButtonSelected())
			enablePan();
	});	
	
	$('.viewport').mouseleave(function (event) {
		$(this).data('clicked', false);
		if(!isPanButtonSelected())
			disablePan();
	});	
	
	$('.viewport').scroll(function (event) {
		$(this).parent().find('.timeline').scrollLeft($(this).scrollLeft());
		$(this).parent().find('.runplan-tools').scrollTop($(this).scrollTop());
		$(this).parent().find('.setups-tools').scrollTop($(this).scrollTop());		
	});	
});