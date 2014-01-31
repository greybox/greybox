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
	$('.productConfigButton').click(function() {
		var configScreen = $('.runPlanProductConfiguration');
		
		var tbody = $(configScreen).find('tbody');
		$(tbody).empty();
		
		for(var count = 0; count < outputRequired.products.length; count++) {
			var prodName = outputRequired.products[count].product;
			var outputTargetTarget = outputRequired.products[count].outputTargetTarget;
			var outputTargetTargetType = outputRequired.products[count].targetType;
			var ulimit = outputRequired.products[count].ulimit;
			var llimit = outputRequired.products[count].llimit;
			var meet = outputRequired.products[count].meet;
			var offset = outputRequired.products[count].offset;
			
			var newTableRow = '<tr>' +
				'<td style="text-align:left;">' + prodName + '</td>' +
				'<td style="text-align:center;"><input type="radio" class="productConfigTargetType" data-product-index="' + count + '" name="outputTargetTargetType-' + prodName + '" value="llimit"></input></td>' + 
				'<td style="text-align:center;"><input type="radio" class="productConfigTargetType" data-product-index="' + count + '" name="outputTargetTargetType-' + prodName + '" value="meet"></input></td>' + 
				'<td style="text-align:center;"><input type="radio" class="productConfigTargetType" data-product-index="' + count + '" name="outputTargetTargetType-' + prodName + '" value="ulimit"></input></td>' +
				'<td style="text-align:right;"><input type="number" class="productConfigoutputTargetTarget" data-product-index="' + count + '" style="width: 50px; text-align:right;" name="outputTargetTarget-' + prodName + '" value="' + outputTargetTarget + '"></input></td>' +
				'<td style="text-align:right;"><input type="number" class="productConfigOffset" data-product-index="' + count + '" style="width: 50px; text-align:right;" name="offset-' + prodName + '" value="' + offset + '"></input></td>' +				
				'</tr>';
			$(tbody).append(newTableRow);
			
			// select the appropriate target type (if custom value none will be selected)
			if(outputTargetTargetType.toLowerCase() == 'ulimit')
				$(configScreen).find("input[name='outputTargetTargetType-" + prodName + "'][value=ulimit]").attr('checked', 'checked');
			else if(outputTargetTargetType.toLowerCase() == 'llimit')
				$(configScreen).find("input[name='outputTargetTargetType-" + prodName + "'][value=llimit]").attr('checked', 'checked');
			else if(outputTargetTargetType.toLowerCase() == 'meet')
				$(configScreen).find("input[name='outputTargetTargetType-" + prodName + "'][value=meet]").attr('checked', 'checked');
		}
		
		$(configScreen).show();
	});
	
	$('.productConfigTargetType').live('click', function() {
		var prodIndex = $(this).attr('data-product-index');
		var outputTargetTarget = outputRequired.products[prodIndex].outputTargetTarget;
		var ulimit = outputRequired.products[prodIndex].ulimit;
		var llimit = outputRequired.products[prodIndex].llimit;
		var meet = outputRequired.products[prodIndex].meet;	
		
		if($(this).val() == 'llimit')
			outputTargetTarget = llimit;
		else if($(this).val() == 'ulimit')
			outputTargetTarget = ulimit;
		else if($(this).val() == 'meet')
			outputTargetTarget = meet;			
			
		$(this).closest('tr').find(".productConfigoutputTargetTarget[data-product-index='" + prodIndex + "']").val(outputTargetTarget);
	});
	
	$('.runPlanProductConfigurationApply').click(function() {
		for(var count = 0; count < outputRequired.products.length; count++) {
			var prodName = outputRequired.products[count].product;
			var ulimit = outputRequired.products[count].ulimit;
			var llimit = outputRequired.products[count].llimit;
			var meet = outputRequired.products[count].meet;			
			
			var outputTargetTarget = $(this).closest('div').find(".productConfigoutputTargetTarget[data-product-index='" + count + "']").val();
			if(outputTargetTarget == ulimit) outputTargetTargetType = 'ulimit';
			else if(outputTargetTarget == llimit) outputTargetTargetType = 'llimit';
			else if(outputTargetTarget == meet) outputTargetTargetType = 'meet';
			else outputTargetTargetType = 'Custom';
			var offset =  $(this).closest('div').find(".productConfigOffset[data-product-index='" + count + "']").val();
			
			outputRequired.products[count].outputTargetTarget = outputTargetTarget;
			outputRequired.products[count].targetType = outputTargetTargetType;
			outputRequired.products[count].offset = offset;
			
			syncWebRequest("op=updateoffset&sessionId=" + getSessionId() + "&product=" + prodName + "&outputTargetTarget=" + outputTargetTarget + "&outputTargetTargetType=" + outputTargetTargetType + "&offset=" + offset);
		}

		calculatePPIs();
		$(getCurrentTabId()).find('.runplan-output-row').remove();
		initBulletGraphs();
		renderBulletGraphs();
		
		$('.runPlanProductConfiguration').hide();
	});	
	
	$('.runPlanProductConfiguration').draggable({handle: '.runPlanProductConfigurationHeader'});
	
	$('.runPlanProductConfigurationCancel').click(function() {
		$('.runPlanProductConfiguration').hide();
	});
	
	$(document).keyup(function(e) {
		if(e.keyCode == 16)
			disablePan();
		else if (e.keyCode == 13) { // enter
			if($('.runPlanProductConfiguration').is(":visible"))
				$('.runPlanProductConfigurationApply').click();
		} else if (e.keyCode == 27) { // escape
			if($('.runPlanProductConfiguration').is(":visible"))
				$('.runPlanProductConfigurationCancel').click();
		}
	});
});