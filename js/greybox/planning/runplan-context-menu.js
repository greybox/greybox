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

function displayContextMenu(event) {
	$('#contextMenu').show();
	$('#contextMenu').css({
		top: event.pageY,
		left: event.pageX
	});
	var block = $('#contextMenu').data('task');
	
	// unhide items that may have been hidden previously
	$('#contextMenu-powersave').show();
	$('#contextMenu-idle').show();
	$('#contextMenu-setup').show();
	
	// Change heading/functionality of the context menu depending on what block was clicked
	if($(block).hasClass('Idle') || $(block).hasClass('Powersave')) {
		$('#contextMenuHeader').text("Insert Here");
		$('#contextMenu').data('action', "Insert");
	} else {
		$('#contextMenuHeader').text("Change to");		
		$('#contextMenu').data('action', "Change");			
	}

	if($(block).hasClass('Powersave')) { // dont allow insert or change powersave/idle into powersave
		$('#contextMenu-idle').hide();
		$('#contextMenu-powersave').hide();
	} else if($(block).hasClass('Idle')) { // dont allow insert or change Idle into Idle
		$('#contextMenu-idle').hide();
	} else if($(block).hasClass('Product')) {
		$('#contextMenu-setup').hide();
	}
}

$(document).ready(function() {
	// disable default context menu when clicking
	$('.runplan-task, #contextMenu, #contextMenu-setup-menu').bind('contextmenu', function(e) {
		return false;
	});
	
	// hide all popup menus when anywhere on page is left clicked
	$(document).mousedown(function(event) {
		switch(event.which) {
			case 3: //case 3 indicates right mouse button
				break;
			default:
				$('#contextMenu, #contextMenu-setup-menu').hide();
				// reset opacity of block
				var clickedBlock = $('#contextMenu').data('task');
				if(clickedBlock) {
					$(clickedBlock).css({'opacity': 1.0});
					$(clickedBlock).css({'color': '#666'});
					$(clickedBlock).css({'box-shadow': 0});
				}
		}	
	});
	
	// show context menu on right click over tool state block 	
	$('.runplan-task').live('mousedown', function(event) {
		// hide any meus that are already shown
		$('#contextMenu,#contextMenu-setup-menu').hide();
		
		// if tool state is historic, or a non idle block is in progress then we don't want to show the menu
		if($(this).hasClass('History') || ($(this).hasClass('InProgress') && !$(this).hasClass('Idle')))
			return;
			
		// disable inserting into a Powersave that is a DC
		if($(this).hasClass('Powersave') && $(this).hasClass('dynamicConstraint'))
			return;
			
		// if on a read-only tab, prompt to open edit tab
		if(!isTabEditable()) {
			if(confirm('This view is read-only - do you want to edit this plan?'))
				createEditTab();
			return;
		}
			
		switch(event.which) {
			case 3: // right mouse button
				var clickedBlock = $('#contextMenu').data('task');
				if(clickedBlock) {
					$(clickedBlock).css({'opacity': '1.0'});
					$(clickedBlock).css({'color': '#666'});
					$(clickedBlock).css({'box-shadow': 0});
				}
					
				// save reference to current block and show context menu
				$('#contextMenu').data('task', $(this)); // the div that was clicked is assigned to the jQuery data store for the contextMenu element called 'task'
				$('#contextMenu').data('mouseX', event.pageX); // save the X co-ord of the current mouse position
				displayContextMenu(event);
				break;
		}
	});
	
	$('.contextMenuItem').mousedown(function(event) {
		var action = $('#contextMenu').data('action');
		var targetDiv = $('#contextMenu').data('task');
		
		if(action == 'Change') {
			if($(targetDiv).data('type') == 'Setup') {
				// crosshatch
				$(targetDiv).nextAll().each(function() {
					$(this).addClass('crosshatch');
					$(this).text('');
				});
			}
			$(targetDiv).removeClass('Powersave Idle Setup Product Engineering Down');
			$(targetDiv).addClass($(this).text());
			$(targetDiv).find('span').text($(this).text());
			$(targetDiv).data('prevType' + generateUniqueId(), $(targetDiv).data('type'));
			$(targetDiv).data('type', $(this).text());
			
			applyInteraction(targetDiv);
			
			calculatePPIs();
			var length = ($(targetDiv).outerWidth() / getPixelsPerHour()) * 60;
			addRule(RULE_CHANGE, $(targetDiv).offset().left, targetDiv, length);
		} else if(action == 'Insert') {
			var mx = $('#contextMenu').data('mouseX');
			var hours = 6; 
			// inserting inside an existing block (except setup/product)
			var tx1 = $(targetDiv).offset().left;
			var tx2 = tx1 + $(targetDiv).outerWidth();

			var originalWidth = $(targetDiv).outerWidth();
			var nwidth = hours * getPixelsPerHour();
			//var nleft = parseInt($(targetDiv).css('left')) + $(targetDiv).outerWidth() - (tx2 - mx);
			var viewport = $(getCurrentTabId()).find('.runplan-viewport');
			var nleft = ($(viewport).scrollLeft() + mx) - Math.round(Number($(viewport).offset().left));
		
			$(targetDiv).outerWidth($(targetDiv).outerWidth() - (tx2 - mx) + IDLE_BORDER_WIDTH);
	
			var slot = $('<div/>')
				.addClass($(this).text())
				.addClass('runplan-task')
				.css({'width': (nwidth + 'px')})
				.data('hours', hours)
				.data('index', 0)
				.data('type', $(this).text())
				.height(getToolHeight() - 7)
				.css({'left': nleft + 'px'})
				.css({'top': 0, 'position': 'absolute'});

			$(slot).append('<span>' + $(this).text() + '</span>');	

			applyInteraction(slot);
			$(slot).insertAfter(targetDiv);
			
			// if the block takes up more space than is availabe, push out future blocks
			if((nwidth + nleft) > (($(targetDiv).position().left + originalWidth))) {
				var change = ((nwidth + nleft) - ($(targetDiv).position().left + $(targetDiv).width())) - (tx2 - mx);
				var uniqueId = generateUniqueId();
				$(slot).nextAll().each(function() {
					$(this).data('origX' + uniqueId, $(this).position().left);
					$(this).css({left: ($(this).position().left + change) + 'px'});
				});
			}
			
			// add extra space after new slot, if needed
			if((nwidth + nleft) <= (($(targetDiv).position().left + originalWidth))) {
				var extendedSlot = $(targetDiv).clone();
				$(extendedSlot).removeClass('ui-resizable ui-draggable'); // need to remove these classes in order for juqery ui methods to work correctly
				$(extendedSlot).data('type', $(targetDiv).data('type'));
				$(extendedSlot).data('extended', true);
				$(extendedSlot).css({left: ($(slot).position().left + $(slot).outerWidth()) + 'px', 'opacity': '1.0'});
				$(extendedSlot).outerWidth(originalWidth - ($(slot).outerWidth() + $(targetDiv).outerWidth()));
				if($(extendedSlot).is(':last-child'))
					$(extendedSlot).outerWidth(originalWidth - ($(targetDiv).outerWidth()));
				applyInteraction(extendedSlot);
				$(extendedSlot).insertAfter(slot);
			}
			
			addRule(RULE_INSERT, mx, slot, hours * 60)
			calculatePPIs();
		}
		$('#contextMenu').hide();
	});
	
	$('.contextMenuItem').hover(function(event) {
			$('#contextMenu-setup-menu').hide();
		}, function(event) {
	});
	
	$('#contextMenu-setup').hover(function(event) {
			$('#contextMenu-setup-menu').show();
			var parentOffset = $('#contextMenu').offset()
			$('#contextMenu-setup-menu').offset({
				top: parentOffset.top,
				left: parentOffset.left + 70	
			});
		}, function(event) {
	});
	
	$('.contextMenuItem-setup').mousedown(function(event) {
		var action = $('#contextMenu').data('action');
		var targetDiv = $('#contextMenu').data('task');

		// prevent inserting 'Setup' (i.e. not a product)
		if($(this).text() == 'Setup') {
			return;
		}
		
		if(action == 'Insert') { // insert at point
			var mx = $('#contextMenu').data('mouseX');
			var tx1 = $(targetDiv).offset().left;
			var tx2 = tx1 + $(targetDiv).outerWidth();
			var originalWidth = $(targetDiv).outerWidth();

			var hours = 6;
			var nwidth = hours * getPixelsPerHour();
			//var nleft = parseInt($(targetDiv).css('left')) + $(targetDiv).outerWidth() - (tx2 - mx);
			var viewport = $(getCurrentTabId()).find('.runplan-viewport');
			var nleft = ($(viewport).scrollLeft() + mx) - Math.round(Number($(viewport).offset().left));
			
			$(targetDiv).outerWidth($(targetDiv).outerWidth() - (tx2 - mx) + IDLE_BORDER_WIDTH);
	
			var slot = $('<div/>')
				.addClass('Setup')
				.addClass('runplan-task')
				.css({'width': (nwidth + 'px')})
				.data('hours', nwidth / getPixelsPerHour())
				.data('index', 0)
				.data('setup', $(this).text())
				.data('type', 'Setup')
				.height(getToolHeight() - 2)
				.css({'left': nleft + 'px'})
				.css({'top': 0, 'position': 'absolute'})
				.append('<span>Setup</span>');	
			
			applyInteraction(slot);
			$(slot).insertAfter(targetDiv);	
			
			// if the block takes up more space than is availabe, push out future blocks
			if((nwidth + nleft) > (($(targetDiv).position().left + originalWidth))) {
				var change = ((nwidth + nleft) - ($(targetDiv).position().left + $(targetDiv).width())) - (tx2 - mx);
				var uniqueId = generateUniqueId();
				$(slot).nextAll().each(function() {
					$(this).data('origX' + uniqueId, $(this).position().left);
					$(this).css({left: ($(this).position().left + change) + 'px'});
				});
			}				

			// add extra space after new slot, if needed
			if((nwidth + nleft) <= (($(targetDiv).position().left + originalWidth))) {
				var extendedSlot = $(targetDiv).clone();
				$(extendedSlot).removeClass('ui-resizable ui-draggable'); // need to remove these classes in order for juqery ui methods to work correctly
				$(extendedSlot).data('type', $(targetDiv).data('type'));
				$(extendedSlot).data('extended', true);
				$(extendedSlot).css({left: ($(slot).position().left + $(slot).outerWidth()) + 'px', 'opacity': '1.0'});
				$(extendedSlot).outerWidth(originalWidth - ($(slot).outerWidth() + $(targetDiv).outerWidth()));
				if($(extendedSlot).is(':last-child'))
					$(extendedSlot).outerWidth(originalWidth - ($(targetDiv).outerWidth()));
				applyInteraction(extendedSlot);
				$(extendedSlot).insertAfter(slot);
			}

			// crosshatch
			$(slot).nextAll().each(function() {
				$(this).addClass('crosshatch');
				$(this).text('');
			});
			
			addRule(RULE_INSERT, mx, slot, hours * 60);
			calculatePPIs();
		} else {
			var hours = 6;
			// Change
			$(targetDiv).removeClass('Powersave Idle Setup Product Engineering Down');
			$(targetDiv).addClass('Setup');
			$(targetDiv).find('span').text('Setup');
			$(targetDiv).data('prevType' + generateUniqueId(), $(targetDiv).data('type'));
			$(targetDiv).data('origWidth' + generateUniqueId(), $(targetDiv).outerWidth());
			$(targetDiv).width(hours * getPixelsPerHour());		
			$(targetDiv).data('type', 'Setup');
			$(targetDiv).data('setup', $(this).text());
	
			applyInteraction(targetDiv);
			
			//insert idle
			
			var idleWidth;
			if($(targetDiv).next().length > 0)
				idleWidth = $(targetDiv).next().offset().left - ($(targetDiv).offset().left + $(targetDiv).width())
			else
				idleWidth = $('#runplan-entries').width() - ($(targetDiv).position().left + $(targetDiv).width());
			
			var idlePos = $(targetDiv).position().left + $(targetDiv).width();
			
			var idle = $('<div/>')
				.addClass('Idle')
				.addClass('runplan-task')
				.css({'width': (idleWidth + 'px')})
				.data('hours', idleWidth / getPixelsPerHour())
				.data('index', 0)
				.data('type', 'Idle')
				.height(getToolHeight() - 2)
				.css({'left': idlePos + 'px'})
				.css({'top': 0, 'position': 'absolute'});
				
			$(idle).insertAfter(targetDiv);			
			
			// crosshatch
			$(targetDiv).nextAll().each(function() {
				$(this).addClass('crosshatch');
				$(this).text('');
			});		

			var mx = $('#contextMenu').data('mouseX');
			addRule(RULE_CHANGE, $(targetDiv).offset().left, targetDiv, hours * 60);	
			calculatePPIs();			
		}
		
		// grey out PPIs
		$('.runplan-ppi-bar-fill').addClass('runplan-ppi-opt-needed');
		$('.runplan-ppi-value').addClass('runplan-ppi-text-opt-needed');
		
		$('#contextMenu').hide();
		$('#contextMenu-setup-menu').hide();
	});
	
	$('#contextMenu-setup-menu').mouseleave(function(event) {
		$(this).hide();
	});
});