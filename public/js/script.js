$(function() {
	hoverOver('.client', 'btn-success', 'A client');
	hoverOver('.servant', 'btn-danger', 'A servant');

  // Hovering over the 'chosen' button and making it x
  function hoverOver(button, origClr, btnText) {
  	$(button).hover(function() {
		if ($(this).hasClass('chosen')) {
  		$(this)
				.html('&Cross;')
			.addBack()
				.css({
  			'font-size': '20px',
  			'padding': '3px'
			})
			.addBack()
				.removeClass(origClr)
			.addBack()
				.addClass('btn-secondary');
		}
  	}, function() {
		$(this)
			.html(btnText)
		.addBack()
			.css({
				'font-size': '1rem',
				'padding': '6px 12px'
			})
		.addBack()
			.removeClass('btn-secondary')
		.addBack()
			.addClass(origClr);
  	});
	}
});

// Clicking 'A client' button
$('.client').click(function(){
	whoClicked('.client', function() {
		$('#client-panel').slideDown(1000);
	}, function(next) {
		if (committed)
			sendOrders('DELETE');
		next();
	});
});

// Clicking 'A servant' button
$('.servant').click(function(){
	whoClicked('.servant', function() {
		$('#servant-panel').slideDown(1000);
	}, function(next) {
		$.post('/servant/logout', { "id": sessionID});
		next();
	});
});

// Used in clicking 'A client' and 'A servant' buttons
function whoClicked(thisBut, doAfterButAnim, doBeforeRefreshing) {
	let oppBut;
	if (thisBut === '.client') oppBut = '.servant';
	else if (thisBut === '.servant') oppBut = '.client';

	if (!$(thisBut).hasClass('chosen')) {
		$(oppBut).animate({
			width: 0,
			padding: 0,
			margin: 0,
			border: 0
		}, 1000, function(){
		$(oppBut).css({
			'display': 'none'
		});
		$(thisBut)
			.css({
				'border-radius': '.25rem'
			})
		.addBack()
			.toggleClass("chosen");

		if (doAfterButAnim && typeof(doAfterButAnim) === "function")
			doAfterButAnim();
		});
	} else {
		if (confirm("Are you sure you want to return back discarding all the changes?")) {
			if (doBeforeRefreshing && typeof(doBeforeRefreshing) === 'function') {
				doBeforeRefreshing(() => {
					location.reload(); // refresh the page (callback)
				});
			} else location.reload(); // refresh the page
		}
	}
}

let notifying = false;
function notify(clr, text) {
	// Get rid of the current color
	$('#notifier')
		.removeClass('alert-success')
	.addBack()
		.removeClass('alert-danger');
	// Add the needed color
	if (clr == 'red')
		$('#notifier').addClass('alert-danger');
	else if (clr == 'green')
		$('#notifier').addClass('alert-success');
	// Change the text
	$('#notifier').text(text);
	// Animate
	if (!notifying){
		notifying = true;
		$('#notifier').slideDown(500, () => {
			$('#notifier').delay(5000).slideUp(500, () => notifying = false);
		});
	}
}
