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

var timeHeaderDragging = 0;
var wasAlreadyInPanMode = false;
var startX = 0;
var startScroll = 0;
	
// Code to display runplan headers
function renderTimeAndDateHeader(runplanStartDate) {
	if(runplanStartDate === undefined)
		runplanStartDate = startOfWeek;
	// clear old contents & reset variables
	var tabId = getCurrentTabId();
	var dayHeader = $(tabId).find('.day-header');
	var timeHeader = $(tabId).find('.time-header');
	$(dayHeader).empty();
	$(timeHeader).empty();
	curDay = startOfWeek.getDay();
	curDayHolder = curDate = 0;
	
	if(isShiftView()) { // LM Jan 2013: When user zooms into the runplan report
		var i;
		for(i = startHour; i <= maxHour + startHour; i++) {
			var timeClass = 'runplan-time';
			if(i%2 == 0)
				timeClass = 'runplan-time-even';
				
			var timeText = i % 24 + ':00';
				
			$(timeHeader)
				.append(
					$('<span/>')
						.addClass(timeClass)
						.text(timeText)
						.width(getPixelsPerHour() - 1) //border
			);
			
			var shiftPeriod = "Day";
			if((i % 24) >= 19 || (i % 24) <= 6)
				shiftPeriod = "Night";
			
			if(i == startHour || (i % 24) == 20 || (i % 24) == 7) {
				var shiftHours = SHIFT_HOURS;
				if(i == startHour)
					shiftHours = i < 7 ? 7 - startHour : 19 - startHour;
				if(shiftHours > 0) {
					var formatDate = runplanStartDate.clone();
					formatDate.add(curDate).days();
					
					var dayText = '&nbsp;&nbsp;' + days[curDay % 7];
					dayText += ' ' + months[formatDate.getMonth()] + ' ' + formatDate.getDate();
					dayText	+= ' | ' + shiftPeriod;
					
					if(((maxHour + startHour) - i) < shiftHours) { // if there's under shiftHours left to display, we need to adjust the day header to only be big enough to fit that number
						shiftHours = 1 + (maxHour + startHour) - i;
					}
					
					$(dayHeader)
						.append(
							$('<span/>')
								.addClass('runplan-header-day')
								.html(dayText)
								.width((getPixelsPerHour() * shiftHours) - 1)); // -1 adjusts for the day's own border-right
					
					if(shiftPeriod == "Night") {		
						curDate++;
						curDay++;
					}
				}
			}
		}
	} else {		
		var i;
		for(i = startHour; i <= maxHour + startHour; i++) {		
			var timeClass = 'runplan-day-shift';
			var shiftPeriod = "Day";
			if((i % 24) >= 19 || (i % 24) <= 6) {
				shiftPeriod = "Night";
				timeClass = 'runplan-night-shift';	
			}
			
			if((i % 24) == 19 || (i % 24) == 7) {
				var formatDate = runplanStartDate.clone();
				formatDate.add(curDate).days();

				var dayHours = SHIFT_HOURS * 2; // day last 2 shifts by default
				if(i == startHour && shiftPeriod == "Night") // ...unless we start on a night shift 
					dayHours = SHIFT_HOURS;
				// ...or if runplan ends on day shift
				if(((maxHour + startHour) - i) <= dayHours) { 
					dayHours = SHIFT_HOURS;
				} 
				
				if(curDayHolder == curDate) { // only print new day after night shift
					var dayText = '&nbsp;&nbsp;' + days[curDay % 7] + ' ' + months[formatDate.getMonth()] + ' ' + formatDate.getDate(); 
					$(dayHeader)
						.append(
							$('<div/>')
								.addClass('runplan-header-day')
								.html(dayText)
								.width((getPixelsPerHour() * dayHours) - 1)); // -1 adjusts for the day's own border-right
					curDayHolder++;
				}
								
				// Move onto next day after night shift
				if(shiftPeriod == "Night") {		
					curDate++;
					curDay++;
				}
			}
			
			// Print the shift on the bottom header on runplan
			if((i % SHIFT_HOURS) == 0) { 
				$(timeHeader)
					.append(
						$('<span/>')
							.addClass(timeClass)
							.html(shiftPeriod)
							.width((getPixelsPerHour() * SHIFT_HOURS) - 1)); // -1 for border 
			}
		}
	}
	
	$(tabId).find('.runplan-entries').width($(tabId).find('.runplan-day-header').width());
	$(tabId).find('.setups-entries').width($(tabId).find('.runplan-day-header').width());
	
	applyTimeAndDateHeaderHighlight();

	// pan on time/date headers
	wasAlreadyInPanMode = false;
	startX = 0;
	startScroll = 0;
	
	// apply click segment to zoom functionality
	$('.runplan-header-day,.runplan-day-shift,.runplan-night-shift').click(function(event) {
		// if we're panning, then dont react to click to zoom
		if(wasAlreadyInPanMode) {
			wasAlreadyInPanMode = false;
			return;
		}
		$(document).unbind('mousemove');
		timeHeaderDragging = 0;
		
		if(isWeekView() && isRunplanView()) {
			var xPos = $(this).position().left;
			performZoom(true, false);
			if(enableAnimation) {
				$(getCurrentTabId()).find('.viewport').animate({scrollLeft: xPos * WEEK_SCALE_FACTOR}, {duration: 1500, queue: true});
			} else {
				$(getCurrentTabId()).find('.viewport').scrollLeft(xPos * WEEK_SCALE_FACTOR);
			}
		}
	});
		
	$('.timeline').mousemove(function (event) {
		showPanCursor();
		if (dragAction == 'pan' && timeHeaderDragging === 1) {
			$(this).scrollLeft(startScroll + startX - event.clientX);
			$(this).parent().find('.viewport').scrollLeft(startScroll + startX - event.clientX);
		}
	});	

	$('.timeline').mouseenter(function() {
		timeHeaderDragging = 0;
		wasAlreadyInPanMode = false;			
		showPanCursor();
	});
	
	$('.timeline').mouseleave(function() {
		if(timeHeaderDragging === 1) {
			$(document).unbind('mousemove');
			timeHeaderDragging = 0;
		}
		
		if(!isPanButtonSelected())// && $(this).closest('.viewport').data('clicked') == false)
			disablePan();
	});
	
	$('.timeline').mousedown(function(event) {
		timeHeaderDragging = 0;
		wasAlreadyInPanMode = false;
		startX = event.clientX;
		startScroll = $(this).scrollLeft();
		$(document).mousemove(function(event){
			if(event.clientX != startX) { // some browsers trigger a mouse move on mousedown, this makes sure the mouse has actually moved
				if(timeHeaderDragging !== 1)
					enablePan();
				timeHeaderDragging = 1;
			}
		});
	});
	
	$('.timeline').mouseup(function(event) {
		if(timeHeaderDragging == 1) {
			$(document).unbind('mousemove');
			wasAlreadyInPanMode = true;
			timeHeaderDragging = 0;
		}
	});
}
	
function applyTimeAndDateHeaderHighlight() {
	$('.runplan-time-even,.runplan-time,.runplan-header-day,.runplan-day-shift,.runplan-night-shift').mouseenter(function(event) {
		$('#runplan-time-highlight').remove();
		var width = $(this).width();
		var viewPort;
		var runPlanEntries;
		
		if(isRunplanView()) {
			viewPort = $(getCurrentTabId()).find('.runplan-viewport');
			runPlanEntries = $(getCurrentTabId()).find('.runplan-entries');	
		} else {
			viewPort = $(getCurrentTabId()).find('.setups-viewport');
			runPlanEntries = $(getCurrentTabId()).find('.setups-entries');	
		}

		// prevent it from going offscreen
		var runplanEntriesEnd = $(viewPort).offset().left + $(viewPort).width();
		var highlightEnd = $(this).offset().left + width;
		var highlightStart = $(this).offset().left;
		
		if(runplanEntriesEnd < highlightEnd) {
			width -= (highlightEnd - runplanEntriesEnd) - 1;
		} 

		var offset = $(this).offset().left;
		if(highlightStart < $(viewPort).offset().left) {
			offset = $(viewPort).offset().left;
			width = width - ($(viewPort).offset().left - $(this).offset().left);
		}
		
		var highlight = $('<div/>')
				.attr('id', 'runplan-time-highlight')
				.css({opacity: 0.3, background: '#777777', position: 'absolute', 'zIndex': 999999})
				.width(width)
				.height($(viewPort).height() + $(viewPort).offset().top - $(this).offset().top)
				.css({left: offset, top: $(this).offset().top})
				.css({'pointer-events': 'none'})
				.bind('mouseleave', function() { $(this).remove(); })
				.show();
		$('body').append(highlight);
	});

	$('.runplan-time-even,.runplan-time,.runplan-header-day,.runplan-day-shift,.runplan-night-shift').mouseleave(function(event) {
		$('#runplan-time-highlight').remove();
	});
}	