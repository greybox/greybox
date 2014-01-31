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

// state functions
function isInEngineering(state) {
	return state == 'Engineering';
}

function isInMaintenance(state) {
	return state == 'Maintenance';
}

function isDown(state) {
	 return state == 'Down';
}

// comments

function submitComment(productDiv) {
	// TODO: submit comment, emulate for now
	var comment = $('#comment-input').val();
	$('#comment-entry').hide();
	if(comment && comment.length > 0) {
		$(productDiv).css({
			'background-image': 'url(img/comment-ind.png)',
			'background-repeat': 'no-repeat'
		});
		$(productDiv).attr('comment', comment);
		$('#' + $('#comment-entry').attr('product')).attr('title', '');
	}
}

 $(document).ready(function() {
	// capture enter & escape key
	$('#comment-entry').keyup(function(event) {
		if(event.keyCode == 13) {
			submitComment($(this).data('product'));
		} 
	});
	
	$(document).keyup(function(event) {
		if(event.keyCode == 27) {
			$('#comment-entry').hide();
		}	
	});
	
	$('#comment-submit').click(function(event) {
		submitComment();
	});
});