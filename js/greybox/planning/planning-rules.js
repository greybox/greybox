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

var UNDO = 0;
var REDO = 1;
var ORIG_POS = 'origX';
var ORIG_WIDTH = 'origWidth';
var NEW_POS = 'newX';
var NEW_WIDTH = 'newWidth';

function addRulesToDatabase() {
	// add offsets to session table
	$(getCurrentTabId()).find('.productOffset').each(function() {
		var offset = $(this).val();
		var product = $(this).data('prodName');
		syncWebRequest("op=updateoffset&sessionId=" + getSessionId() + "&offset=" + offset + "&product=" + product);
	});
	
	// clear all rules from table
	syncWebRequest("op=delalldc&sessionId=" + getSessionId());
	
	// loop backwards (most recent first) through the operation stack and add/update/delete rules 
	// only the most recent entry for each rule should be added as a DC
	var tabOpStack = opStack[getCurrentTab()];
	var processedRules = new Array();
	for(var i = tabOpStack.length - 1; i >=0; i--) {
		var r = tabOpStack[i];
		if($.inArray(r.id*1, processedRules) == -1) {
			var product = "", lotId = "", state = r.state;
			if(r.state == 'Setup') {
				product = "&Product=" + $(r.block).data('setup');
			} else if(r.state == 'Product') {
				product = "&Product=" + $(r.block).data('product');
				lotId = "&lotId=" + $(r.block).data('lotid');
				state = "Run";
			}
			var url = "op=adddc&Tool=" + r.toolName + "&Num=1&State=" + state + "&Duration=" + (r.duration / 60) + "&WindowFrom=" + r.windowFrom + "&WindowTo=" + r.windowTo + "&Added=" + r.added + "&sessionId=" + getSessionId() + product + lotId + "&dcId=" + r.id + "&type=" + r.op;
			syncWebRequest(url);
			processedRules.push(r.id*1);
		} 
	}
}

// finds what block is at a particular x co-ordinate in a particular runplan entry row
function findBlockPosition(entry, xCoord) {
	var block;
	$(entry).children().each(function() {
		if((xCoord >= $(this).position().left) && (xCoord <= ($(this).position().left + $(this).outerWidth()))) {
			block = this;
		}
	});
	return block;
}	

function enableUndo() {
	$(getCurrentTabId()).find('.runplan-rule-undo').removeClass('toolbarButtonDisabled');
}

function resetRedo() {
	$(getCurrentTabId()).find('.runplan-rule-redo').addClass('toolbarButtonDisabled')
	redoStack[getCurrentTab()] = new Array();					
}

function addOperationToOpList(operation) {
	var tabOpStack = opStack[getCurrentTab()];
	tabOpStack.push(operation);
	opStack[getCurrentTab()] = tabOpStack;	
}

function undoRedoResize(op, action) {
	var x = ORIG_POS, nX = NEW_POS, width = ORIG_WIDTH, nWidth = NEW_WIDTH;
	if(action == REDO) {
		x = NEW_POS; nX = ORIG_POS; width = NEW_WIDTH; nWidth = ORIG_WIDTH;
	}
	// move back each block to the relevant position, and change their widths back
	$(op.block).parent().children().each(function() {
		//if($(this).data(x + op.uniqueId) == undefined) {
		//	$(this).remove();
		//} else 
		{
			$(this).data(nX + op.uniqueId, $(this).position().left); 
			$(this).css({left: $(this).data(x + op.uniqueId)});
			$(this).data(nWidth + op.uniqueId, $(this).outerWidth());
			$(this).outerWidth($(this).data(width + op.uniqueId));
		}
	});		
	cleanIdleAndPowersave($(op.block).parent()); // clean up idle and powersave blocks
}

function undoResize(op) {
	undoRedoResize(op, UNDO);
}

function redoResize(op) {
	undoRedoResize(op, REDO);
}

// adds existing database rules to the rule list
function addRulesToRuleList() {
	var maxRuleId = 0;
	var currentTab = getCurrentTab();
	for(var i in opStack[currentTab]) {
		var rule = opStack[currentTab][i];
		// we need to set some variables in the rule object that aren't present in the database, or have different names
		if(!$.isEmptyObject(rule)) {
			rule.op = RULE_INSERT;
			rule.added *= 1; // force integer value
			rule.duration *= 60; // stored as hours in db, we use minutes
			rule.start = new Date(rule.windowFrom * 1);
			rule.windowFrom = generateWindowDate(rule.start);
			if(rule.windowTo != undefined) {
				rule.end = new Date(rule.windowTo * 1);
				rule.windowTo = generateWindowDate(rule.end);
			}
			addRuleToRuleList(rule);

			if(rule.id > maxRuleId)
				maxRuleId = rule.id * 1;
		}
	}
	
	// set the ruleId counter to the max of the ruleIds that's been set in the database to avoid duplication of ids for user generated rules
	ruleId = maxRuleId+1;
}

function generateRuleText(rule) {
	var date = new Date(rule.added);
		
	var startDay = rule.start.getDate();
	var startMonth = rule.start.getMonth() + 1;
	var startHour = rule.start.getHours();
	var startMin = rule.start.getMinutes();
	var endHour = '';
	var endMin = '';
	var endDay = '';
	var endMonth = '';
	if(rule.end != undefined) {
		endHour = rule.end.getHours();
		endMin = rule.end.getMinutes();	
		endDay = rule.end.getDate();	
		endMonth = rule.end.getMonth() + 1;	
	}
	
	var opText = 'Inserted';
	var opType = 'at';
	if(rule.op == RULE_DRAG) {
		opText = 'Moved';
		opType = 'to';
	} else if(rule.op == RULE_CHANGE) {
		opText = 'Changed ';
		opType = ' to ' + rule.state;
	} else if(rule.op == RULE_RESIZE) {
		opText = 'Resized';
	}
	
	var colour = '#ffffff';
	
	// todo: add color highlighting for rules that can't be undone
	var state;
	var setup = '';
	if(rule.op == RULE_CHANGE) {
		state = $(rule.block).data('prevType' + rule.uniqueId);
	} else {
		if(rule.state != undefined) {
			state = rule.state;
			//colour = '#efefef';
		} else {
			state = $(rule.block).data('type');
		}
		
		if(state == 'Setup') {
			setup = '(' + rule.product + ') ';
		} else if(state == 'Product') {
			state = 'Lot';
			setup = '(' + rule.product + '[' + rule.lot +']) ';
		}
	}
	
	var ruleText = date.getHours() + ':' + date.getMinutes().pad(2) + ' ' + date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + '<br/>' + rule.toolName + ': ' + opText + ' ' + state + ' ' + setup + opType + ' ' + startDay + '/' + startMonth + ' ' + startHour + ':' + startMin.pad(2);
	if(rule.end != undefined) {
		if(rule.op == RULE_DRAG || rule.op == RULE_RESIZE) {
			//ruleText += ' (ends ';
		} else {
			ruleText += ' to ';
			ruleText += endDay + '/' + endMonth + ' ' + endHour + ':' + endMin.pad(2);
		}
		
		if(rule.op == RULE_DRAG || rule.op == RULE_RESIZE) {
			//ruleText += ')';
		}
	}
	
	ruleText = '<img src="img/rule.png" style="float: left;">' + ruleText;
	
	return ruleText;
}	

function addRuleToRuleList(rule) {	
	var ruleText = generateRuleText(rule);
		
	// attempt to find rule associated with this block in the rule list
	var existingRuleFound = false;
	$('#runplan-' + getCurrentTab() + '-rules-list .runplanRuleListEntry').each(function() {
		 // check if match found - we check if block is undefined as this check will pass otherwise if it's a rule from the database as block and associatedblock will both be undefined
		if((rule.block != undefined) && $($(this).data('associatedBlock'))[0] == $(rule.block)[0]) {
			$(this).html(ruleText); // replace rule text
			$('#runplan-' + getCurrentTab() + '-rules-list').prepend(this); // bump up to top
			existingRuleFound = true;
			return;
		}
	});
		
	if(!existingRuleFound) {
		var newRuleDiv = $('<div/>')
			.attr('id', 'runplan-' + getCurrentTab() + '-rules-rule-' + rule.id) // runplanRuleNo = global var
			//.css({'background': colour})
			.append(ruleText)
			.css({'border-bottom': '1px solid #c0c0c0'})
			.css({'padding': '5px'})
			.addClass('runplanRuleListEntry');
		
		// associate rule list entry with the block & rule id
		$(newRuleDiv).data('associatedBlock', rule.block); // if this is a rule from the database, this won't be set - this is associated later when the runplan is being rendered
		$(newRuleDiv).data('ruleId', rule.id);
	
		$('#runplan-' + getCurrentTab() + '-rules-list').prepend(newRuleDiv);	
	}
}

function removeBlockClasses(block) {
	$(block).removeClass('Powersave Idle Setup Product Engineering Maintenance Down ui-draggable ui-resizable dynamicconstraint');
	$(block).css({'background-image': 'none'});
}

function setBlockText(block, text) {
	if(isWeekView())
		$(block).find('span').text('');
	else
		$(block).find('span').text(text);
}	

function generateWindowDate(date) {
	return date.getFullYear() + "-" + (date.getMonth() + 1).pad(2) + '-' + date.getDate() + " " + date.getHours().pad(2) + ":" + date.getMinutes().pad(2) + ":00.0";
}

function addOperation(opType) {
	var opState = new Object();
	opState.op = opType;	
	opState.id = generateRuleId();
	opState.scrollLeft = $($(getCurrentTabId()).find('.runplan-viewport')).scrollLeft();
	
	addOperationToOpList(opState);
	enableUndo();
	resetRedo();	
	return opState;
}

// Calculate the distance in hours from the start of the runplan given a pixel position
function getHoursFromPixelPosition(xPos) {
	var timeHeaderX = $(getCurrentTabId()).find('.runplan-time-header').offset().left; // start of the time header
	return (xPos - timeHeaderX) / getPixelsPerHour(); // hour count since the start of runplan display (startOfWeek)	
}

// length = time of task in minutes
function addRule(ruleType, offset, block, length) {
	// TODO: if this is a move or resize rule, first see if there are any other rules present of the same type, or an insert

	var hours = getHoursFromPixelPosition($(block).offset().left);

	var ruleDateStart = startOfRunplan.clone().addHours(hours);
	
	var ruleDateEnd;
	if(length > 0)
		ruleDateEnd = ruleDateStart.clone().addMinutes(length);	
	
	// find tool associated with this entry
	var entryNum = $(block).parent().data('nid');
	var toolName = $('#runplan-' + getCurrentTab() + '-tool-' + entryNum + '-table td').text();
	
	// highlight block that rule applies to
	$(block).addClass('dynamicConstraint');
	
	var windowFrom = generateWindowDate(ruleDateStart);
	var windowTo = "";
	if(ruleDateEnd != undefined)
		windowTo = generateWindowDate(ruleDateEnd);
	
	var ruleStateHistory = new Object();
	ruleStateHistory.op = ruleType;
	ruleStateHistory.block = block;
	ruleStateHistory.state = $(block).data('type');
	if(ruleStateHistory.state == 'Setup') {
		ruleStateHistory.product = $(block).data('setup');
	} else if(ruleStateHistory.state == 'Product') {
		ruleStateHistory.lot = $(block).data('lotid');
		ruleStateHistory.product = $(block).data('product');
	}
	ruleStateHistory.oldOffset = offset;
	ruleStateHistory.toolName = toolName;
	ruleStateHistory.duration = length;
	// todo refactor - remove windowFrom/windowTo strings and use start and end instead when inserting rule in db
	ruleStateHistory.windowFrom = windowFrom;
	ruleStateHistory.windowTo = windowTo;
	ruleStateHistory.added = new Date().getTime();
	ruleStateHistory.start = ruleDateStart;
	ruleStateHistory.end = ruleDateEnd;
	ruleStateHistory.uniqueId = getLastUniqueId();
	ruleStateHistory.username = serverUsername;
	
	// associate a ruleId with a block, if none already associated, generate one
	var existingRuleId = $(block).data('ruleId');
	if(existingRuleId == undefined) {
		ruleStateHistory.id = generateRuleId();
		$(block).data('ruleId', ruleStateHistory.id);
	} else {
		ruleStateHistory.id = $(block).data('ruleId');
	}
	
	if(ruleType != RULE_DELETE)
		addRuleToRuleList(ruleStateHistory);
		
	// see if any rules on this tool have been pushed out and if so, update times
	updateToolRules($(block).parent(), $(block).offset().left + $(block).width());
	
	addOperationToOpList(ruleStateHistory);
	enableUndo();
	resetRedo();
}

// Scan through rules on 'runplanEntry' after 'position' and update their times in the ruleList if modified
function updateToolRules(runplanEntry, position) {
	$(runplanEntry).find('.runplan-task').each(function() {
		var block = this;
		if($(block).offset().left >= position) {
			var ruleId = $(block).data('ruleId');
			if(ruleId !== undefined) {
				var startInHours = getHoursFromPixelPosition($(block).offset().left);
				var newRuleDateStart = startOfRunplan.clone().addHours(startInHours);
				var lengthInHours = $(block).outerWidth() / getPixelsPerHour();
				var newRuleDateEnd = newRuleDateStart.clone().addHours(lengthInHours);
				// update the most recent opStack entry with the new coords
				var tabOpStack = opStack[getCurrentTab()];
				for(var i = tabOpStack.length - 1; i >= 0; i--) {
					var op = tabOpStack[i];
					if(op.id == ruleId) {
						op.windowFrom = generateWindowDate(newRuleDateStart);
						if(op.windowTo !== undefined)
							op.windowTo = generateWindowDate(newRuleDateEnd);
						op.start = newRuleDateStart;
						op.end = newRuleDateEnd;
						
						// find rule in list associated with this rule and update displayed times
						$('#runplan-' + getCurrentTab() + '-rules-list .runplanRuleListEntry').each(function() {
							if($(this).data('ruleId') != undefined) {
								if($(this).data('ruleId') == ruleId) {
									$(this).html(generateRuleText(op));
								}
							}
						});							
						
						break; // we're done here
					}
				}
				opStack[getCurrentTab()] = tabOpStack;	
			}
		}
	});
}



function undoRule() {
	if(opStack[getCurrentTab()] && opStack[getCurrentTab()].length > 0 && opStack[getCurrentTab()].length > undoLimit[getCurrentTab()]) {
		var op = opStack[getCurrentTab()].pop(); // grab the last operation
		redoRuleList[getCurrentTab()].push($('#runplan-' + getCurrentTab() + '-rules-list div:eq(0)')); // store the contents of the rule in the redo rules list
		
		$('#runplan-' + getCurrentTab() + '-rule-redo').removeClass('toolbarButtonDisabled'); // enable the redo button
		
		if(op.op == RULE_RESIZE) { 
			undoResize(op);
		} else if(op.op == RULE_DRAG) {
			// move back each block to their original position
			$(op.block).parent().children().each(function() {
				$(this).data('newX' + op.uniqueId, $(this).position().left); // store the new positions for redo
				$(this).data('newWidth' + op.uniqueId, $(this).outerWidth()); 
				if($(this).data('origX' + op.uniqueId) == undefined)
					$(this).remove();
				else
					$(this).css({left: $(this).data('origX' + op.uniqueId)});
			});				
			cleanIdleAndPowersave($(op.block).parent()); // clean up idle and powersave blocks
		} else if(op.op == RULE_INSERT) {
			// move back each block that was pushed out after the insert
			$(op.block).nextAll().each(function() {
				$(this).data('newX' + op.uniqueId, $(this).position().left);
				$(this).css({left: $(this).data('origX' + op.uniqueId)});
			});
			if($(op.block).data('type') == 'Setup') {
				$(op.block).nextAll().each(function() {
					//todo: need to make sure that if crosshatching was there before change that this isnt removed
					$(this).removeClass('crosshatch'); 					
					$('.runplan-ppi-bar-fill').removeClass('runplan-ppi-opt-needed');
					$('.runplan-ppi-value').removeClass('runplan-ppi-text-opt-needed');								
				});
			}
			var runplanEntry = $(op.block).parent();
			// store some variables to allow redo
			op.entry = runplanEntry;
			op.left = $(op.block).position().left;
			var next = $(op.block).next();
			// If the insert created an additional powersave, we remove it here and store it for redo
			if($(next).length > 0 && $(next).data('type') == 'Powersave' && $(next).data('extended') == true) {
				op.nextBlock = $(op.block).next().detach();
			}
			op.removedBlock = $(op.block).detach(); // remove inserted block, detach() cos we use it later in a redo
			cleanIdleAndPowersave(runplanEntry);
		} else if(op.op == RULE_CHANGE || op.op == RULE_DELETE) {
			var prevType = $(op.block).data('prevType' + op.uniqueId);
			$(op.block).data('prevType' + op.uniqueId, $(op.block).data('type'));
			$(op.block).data('type', prevType);
			
			if($(op.block).data('prevType' + op.uniqueId) == 'Setup') {
				$(op.block).nextAll().each(function() {
					//todo: need to make sure that if crosshatching was there before change that this isnt removed
					$(this).removeClass('crosshatch'); 
					$('.runplan-ppi-bar-fill').removeClass('runplan-ppi-opt-needed');
					$('.runplan-ppi-value').removeClass('runplan-ppi-text-opt-needed');						
				});
				if($(op.block).outerWidth() < $(op.block).data('origWidth' + op.uniqueId)) { // idle block inserted
					var origWidth = $(op.block).data('origWidth' + op.uniqueId);
					$(op.block).data('origWidth' + op.uniqueId, $(op.block).outerWidth());
					$(op.block).outerWidth(origWidth);
					var nextBlock = $(op.block).next();
					if($(nextBlock).length > 0 && $(nextBlock).hasClass('Idle'))
						$(nextBlock).remove();
				}
			}
			applyInteraction(op.block);
	
			$(op.block).removeClass('Powersave Idle Setup Product Engineering Down');
			$(op.block).addClass($(op.block).data('type'));
			$(op.block).find('span').text($(op.block).data('type'));	
			
			// if we're undoing a delete, re-associate rule id
			if(op.op == RULE_DELETE && $(op.block).data('oldRuleId') != undefined) {
				$(op.block).data('ruleId', $(op.block).data('oldRuleId'));
				$(op.block).data('oldRuleId', undefined);
				$(op.block).addClass('dynamicConstraint');
			}

			cleanIdleAndPowersave($(op.block).parent()); // clean up idle and powersave blocks				
		} 
		
		// push operation onto the redo stack
		redoStack[getCurrentTab()].push(op); 			
		
		if(op.op == OP_OPTIMISE) {
			var prevTools = $(getCurrentTabId()).find('.runplan-tool').detach();
			var prevEntries = $(getCurrentTabId()).find('.runplan-entry').detach();
			var tools = op.tools;
			var entries = op.entries;
			$(getCurrentTabId()).find('.runplan-tools').append(tools);
			$(getCurrentTabId()).find('.runplan-entries').append(entries);
			$($(getCurrentTabId()).find('.runplan-viewport')).scrollLeft(op.scrollLeft);
			op.tools = prevTools;
			op.entries = prevEntries;
			//associateRulesToBlocks(getCurrentTabId());
		} else {
			// update rule list - search the opStack (backwards - i.e. most recent rule first) for the next rule relating to the rule that was undoed
			// if there is one, replace the associated rule list entry with that rule, otherwise remove from list if no match found
			var ruleFound = false;
			for(var i = opStack[getCurrentTab()].length - 1; i >= 0; i--) {
				var nextRule = opStack[getCurrentTab()][i];
				if(nextRule.id == op.id) {
					addRuleToRuleList(nextRule);
					ruleFound = true;
					break;
				}
			} 
			if(!ruleFound) {
				var entry = $('#runplan-' + getCurrentTab() + '-rules-list div:eq(0)'); // most recent operation is always top entry of rule list
				var block = $(entry).data('associatedBlock');
				$(block).removeClass('dynamicConstraint');
				$(entry).remove(); 
			}
		}
	} 
	
	if(opStack[getCurrentTab()] && (opStack[getCurrentTab()].length == 0 || opStack[getCurrentTab()].length <= undoLimit[getCurrentTab()])) {
		$(this).attr('disabled', '');
		$('#runplan-' + getCurrentTab() + '-rule-undo').addClass('toolbarButtonDisabled');
	}
	
	calculatePPIs();
};

function redoRule() {
	if(redoStack[getCurrentTab()] && redoStack[getCurrentTab()].length > 0) {
		var op = redoStack[getCurrentTab()].pop();
		opStack[getCurrentTab()].push(op);
		$('#runplan-' + getCurrentTab() + '-rule-undo').removeClass('toolbarButtonDisabled');
		$('#runplan-' + getCurrentTab() + '-rules-list').prepend(redoRuleList[getCurrentTab()].pop());
		if(op.op == RULE_RESIZE) {
			redoResize(op);
		} else if(op.op == RULE_DRAG) {
			$(op.block).parent().children().each(function() {
				if($(this).data('newX' + op.uniqueId) == undefined)
					$(this).remove();
				else {
					$(this).data('origX' + op.uniqueId, $(this).position().left);
					$(this).css({left: $(this).data('newX' + op.uniqueId)});
					$(this).outerWidth($(this).data('newWidth' + op.uniqueId));
				}
			});				
			cleanIdleAndPowersave($(op.block).parent()); // clean up idle and powersave blocks			
		} else if(op.op == RULE_CHANGE || op.op == RULE_DELETE) {
			var prevType = $(op.block).data('prevType' + op.uniqueId);
			$(op.block).data('prevType' + op.uniqueId, $(op.block).data('type'));
			$(op.block).data('type', prevType);
			
			if($(op.block).data('type') == 'Setup') {
				var origWidth = $(op.block).data('origWidth' + op.uniqueId);
				$(op.block).data('origWidth' + op.uniqueId, $(op.block).outerWidth());
				$(op.block).outerWidth(origWidth);
				
				cleanIdleAndPowersave($(op.block).parent());
				
				$(op.block).nextAll().each(function() {
					$(this).addClass('crosshatch'); 
					$('.runplan-ppi-bar-fill').addClass('runplan-ppi-opt-needed');
					$('.runplan-ppi-value').addClass('runplan-ppi-text-opt-needed');
				});					
			}				
			
			applyInteraction(op.block);
	
			$(op.block).removeClass('Powersave Idle Maintenance Setup Product Engineering Down');
			$(op.block).addClass($(op.block).data('type'));
			$(op.block).find('span').text($(op.block).data('type'));

			// if we're redoing a delete, delete entry from rule list
			if(op.op == RULE_DELETE) {
				$('#runplan-' + getCurrentTab() + '-rules-list div:eq(0)').remove();
				
				// if we're redoing a delete, un-associate rule id and save it
				if($(op.block).data('ruleId') != undefined) {
					$(op.block).data('oldRuleId', $(op.block).data('ruleId'));
					$(op.block).data('ruleId', 0);
					$(op.block).removeClass('dynamicConstraint');
				}
			} else { // dont join blocks when redoing delete
				cleanIdleAndPowersave($(op.block).parent());
			}
		} else if(op.op == RULE_INSERT) {
			// find out correct block to insert into as the previous block might have been removed by an undo	
			var previousBlock = findBlockPosition(op.entry, op.left);
			$(op.removedBlock).insertAfter(previousBlock);
			
			var runplanEntry = op.entry;

			$(op.removedBlock).nextAll().each(function() {
				$(this).data('origX' + op.uniqueId, $(this).css('left'));
				$(this).css({left: $(this).data('newX' + op.uniqueId)}); // newX set in undo
			});
			
			// we need to put back in the block of powersave that was created after the insert (if present) 
			// idle will be put back in automatically by the cleanIdleAndPowersave function
			if($(op.nextBlock).length > 0 && $(op.nextBlock).data('type') == 'Powersave') {
				applyInteraction(op.nextBlock);				
				$(op.nextBlock).insertAfter($(op.removedBlock));
			}

			if($(op.removedBlock).data('type') == 'Setup') {
				$(op.removedBlock).nextAll().each(function() {
					$(this).addClass('crosshatch'); 
				});
				$('.runplan-ppi-bar-fill').addClass('runplan-ppi-opt-needed');
				$('.runplan-ppi-value').addClass('runplan-ppi-text-opt-needed');						
			}
			
			cleanIdleAndPowersave(runplanEntry);				
		} else if(op.op == OP_OPTIMISE) {
			var prevTools = $(getCurrentTabId()).find('.runplan-tool').detach();
			var prevEntries = $(getCurrentTabId()).find('.runplan-entry').detach();
			var tools = op.tools;
			var entries = op.entries;
			$(getCurrentTabId()).find('.runplan-tools').append(tools);
			$(getCurrentTabId()).find('.runplan-entries').append(entries);
			$($(getCurrentTabId()).find('.runplan-viewport')).scrollLeft(op.scrollLeft);
			op.tools = prevTools;
			op.entries = prevEntries;
			//associateRulesToBlocks(getCurrentTabId());
		} 	
	}
	
	if(redoStack[getCurrentTab()] && redoStack[getCurrentTab()].length == 0) {
		$('#runplan-' + getCurrentTab() + '-rule-redo').addClass('toolbarButtonDisabled')
	}
	
	calculatePPIs();
};