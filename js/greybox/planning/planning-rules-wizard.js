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

$(document).ready(function() {
	$('#runPlan-RulesWizard').draggable( {handle:'#runPlan-RulesWizard-handle'});
	$('#runPlan-RulesWizard').hide();
	$('#runplan-rulesWizard-Cancel').click(function() { $('#runPlan-RulesWizard').hide(); });
	
	$('.runplanRuleListEntry').live('click', function(event) {
		$('#runPlan-RulesWizard').css({'z-index': '99999999'});
		$('#runPlan-RulesWizard').show();
		
		// disable delete button on read only tabs
		if(!isTabEditable())
			$('#runplan-rulesWizard-Delete').attr('disabled', true);
		else 
			$('#runplan-rulesWizard-Delete').removeAttr('disabled');

		var tabOpStack = opStack[getCurrentTab()];
		var clicked = event.target;
		Rulesid = clicked.id;
		RulesWizardId = "#" + Rulesid;
		Rulesid = Rulesid.substring(21,23);
		
		var toolName = "";
		var type = "";
		var winTo = "";
		var winFrom = "";
		var Product = "";
		var username = "";
					
		var i = 0;
			for(var i = tabOpStack.length - 1; i >=0; i--) {
				var r = tabOpStack[i];
				if(r.id == Rulesid) {
				
					toolName = r.toolName;
					type = r.state;
					winTo = r.windowTo;
					winFrom = r.windowFrom;
					Product = $(r.block).data('setup');
					username = r.username;
				
			}
		}
		
		var comms = "";
		
		if (type =="Setup")
		{
			comms = "<strong>Set: Tool </strong> " + toolName + "<strong> To: </strong>" + type + "<strong> > </strong>" + Product + "<strong> At:</strong> " + winTo.substring(1,16)
		}
		else
		{
			comms = "<strong>Set: Tool </strong> " + toolName + "<strong> At:</strong> " + winTo.substring(1,16)
		}
		
		var clear="";
		var width = "250"
		$('#runplan-rulesWizard-Tool').text(clear);
		$('#runplan-rulesWizard-Set').text(clear);	
		$('#runplan-rulesWizard-Product').text(clear);	
		$('#runplan-rulesWizard-From').text(clear);
		$('#runplan-rulesWizard-To').text(clear);
		$('#runplan-rulesWizard-Comms').text(clear);	
		$('#RulesOwner').text(clear);
		$('#runplan-rulesWizard-Comms').text(clear);
		$('#RulesEdit').text(clear);
		
		toolName = "<select disabled style=\"width:200px;\"><option value=1>" + toolName + "</option></select>";
		$('#runplan-rulesWizard-Tool')
			.append(
				$('<td/>')
					.html(toolName)
		);
	
		
		$('#RulesOwner').append($('<td/>').html(username));
		$('#RulesEdit').append($('<td/>').html(username));
		
		
		if (type !="Setup")
		{
			var row = document.getElementById("RulesProduct");
			row.style.display = 'none';
		}
		else
		{
		
		var row = document.getElementById("RulesProduct");
		row.style.display = '';
		
		Product = "<select disabled style=\"width:200px;\"><option value=1>" + Product + "</option></select>";
		$('#runplan-rulesWizard-Product')
			.append(
				$('<td/>')
					.html(Product)
					
		);	
		}
		
		
		type = "<select disabled style=\"width:200px;\"><option value=1>" + type + "</option></select>";
		$('#runplan-rulesWizard-Set')
			.append(
				$('<td/>')
					.html(type)
		);	
		
		winFrom = "<select disabled style=\"width:200px;\"><option value=1>"+ winFrom.substring(1,16) + "</option></select>";
		$('#runplan-rulesWizard-From')
			.append(
				$('<td/>')
					.html(winFrom)
		);	
		
		winTo = "<select disabled style=\"width:200px;\"><option value=1>" + winTo.substring(1,16) + "</option></select>";
		$('#runplan-rulesWizard-To')
			.append(
				$('<td/>')
					.html(winTo)
		);	
		
		
		$('#runplan-rulesWizard-Comms')
			.append(
				$('<td/>')
					.html(comms)
		);	
	});

	$('#runplan-rulesWizard-Delete').click(function() {	
		// disable deleting rules on read-only tabs
		if(!isTabEditable())
			return;
		
		// get the block that this rule is associated with and change to idle
		// this = entry in the rule list that was clicked
		//var associatedBlock = $(this).data('associatedBlock');
		
		var associatedBlock = parent.$(RulesWizardId).data('associatedBlock');
		var ruleId = parent.$(RulesWizardId).data('ruleId');
		if(associatedBlock != undefined) {
			removeBlockClasses(associatedBlock);
			$(associatedBlock).addClass('Idle');
			setBlockText(associatedBlock, 'Idle');
			$(associatedBlock).data('prevType' + generateUniqueId(), $(associatedBlock).data('type'));
			$(associatedBlock).data('type', 'Idle');		
			applyInteraction(associatedBlock);
			// add internal state for undo
			addRule(RULE_DELETE, $(associatedBlock).offset().left, associatedBlock, $(associatedBlock).outerWidth());
			// reset DC value associated with block, but store it for undo
			$(associatedBlock).data('oldRuleId', $(associatedBlock).data('ruleId'));	
			$(associatedBlock).data('ruleId', 0);	
		} else {
			// if theres no block associated (if opt engine doesn't supply a mapping) then use a dummy block
			// override the ruleid for the new rule as the proper one will not be in the block. kinda hacky right now
			addRule(RULE_DELETE, 0, $('<div/>'), 0);
			var tabOpStack = opStack[getCurrentTab()];
			var rule = tabOpStack.pop();
			rule.id = ruleId;
			rule.op = RULE_DELETE;
			tabOpStack.push(rule);
			opStack[getCurrentTab()] = tabOpStack;			
		}
		// remove rule from list
		parent.$(RulesWizardId).remove();
		// update PPIs
		calculatePPIs();
		
		$('#runPlan-RulesWizard').hide();
	});	
});