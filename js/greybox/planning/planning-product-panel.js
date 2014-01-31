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

/* Product Output Panel - generates product name, offset, bullet graph on RHS product panel */

function renderBulletGraphs(tabId) {
	// default to current tab
	if(typeof(tabId) === 'undefined')
		tabId = getCurrentTabId();	
		
	for(i = 0; i < outputRequired.products.length; i++) {
		var values = getBulletGraphValues(i);
		var target = values[0];
		var offset = values[3];
		var predicted = values[2];
		var current = values[1];
		$('#runplan-' + extractTabFromTabId(tabId) + '-bullet-graph-' + i).sparkline([target, offset+predicted+current, predicted+current, current], bulletGraphOpts);	
	}
}

function initBulletGraphs() {
	var tabId = getCurrentTabId();
	
	for(count = 0; count < outputRequired.products.length; count++) {
		var prodName = outputRequired.products[count].product;
		var colour = productColourArray[count];
		
		var productPanelTableRow = $('<tr/>')
							.attr('id', 'runplan-' + getCurrentTab() + '-output-row-' + count)
							.attr('prodId', count)
							.addClass('runplan-output-row')
							.append($('<td/>')
									.html("<span style='background:" + colour + "'>&nbsp;&nbsp;</span>&nbsp;" + "<span class='outputProductName'>" + prodName + "</span>"))
							.append($('<td/>')
								.css({'text-align':'right', 'padding-right':'5px'}) 
								.text(outputRequired.products[count].outputTargetTarget))
							.append($('<td/>')
								.css({'text-align':'right'})
								.append($('<span/>')
									.attr('id', 'runplan-' + getCurrentTab() + '-bullet-graph-' + count)
									.addClass('bulletGraph')));
							
		$(tabId).find('.bulletTable').append(productPanelTableRow);
	}
	
	$('.runplan-output-row').hover(onBulletGraphMouseIn, onBulletGraphMouseOut);	
}	