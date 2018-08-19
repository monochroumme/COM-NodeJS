let ordersAmount = 0;
let orderID = -1;
let committed = false;
let name;

$(function() {
    // Clicking the cart popover
    $('.btn-cart').popover({
        html: true,
        'content': () => { return $('#cart-content').html(); }
	});

    // Clicking 'Add to Cart' Button
    $('.add-to-cart').click(function() {
        // increase how many orders we have and the orderID
        ordersAmount++;
        orderID++;
        // get the coffee type
        let coffeeType = $(this).attr('data-coffeetype');
        // add the coffee to the cart-order-list
        $('.cart-order-list').append(
        '<li class="list-group-item cart-order" order-id=' + orderID + '>' +
            coffeeType +
            '<button type="button" class="btn btn-danger delete-order"><img src="icons/trash.png" width="14px" height="14px"></button>' +
        '</li>');
        // if now we have 1 order, then show the order button and hide the No Orders text
        if (ordersAmount === 1) {
            $('.no-orders').hide();
            $('.order').show();
        }
        // if we've already committed the orders before and there isn't the edit button already, then change the order button to edit button
        if (!$('.edit').length && committed) swapButtons("Commit the changes", 'btn-success', 'btn-primary', 'order', 'edit');
        $('.edit').prop('disabled', false);
    });

    // Clicking the trash can button
    $(document).on('click', '.delete-order', function() {
        // delete it both from popover-body cart-order-list by using the specific id number of the parent of the clicked button
        $('[order-id=' + $(this).parent().attr('order-id') + ']').remove();
        ordersAmount--;

        if (ordersAmount === 0) {
            // if there's Edit button, then make it the order button
            if ($('.edit').length)
                swapButtons("Order", 'btn-primary', 'btn-success', 'edit', 'order');
            // enable the order button
            $('.order').prop('disabled', false);
            // hide the order button
            $('.order').hide();
            // add No Orders text
            $(".no-orders").show();
            // we have no longer committed the changes
            committed = false;
            orderID = -1;
            // TODO tell the server that this client has deleted all the orders

        } else if ($('.order').length && committed) {
            swapButtons("Commit the changes", 'btn-success', 'btn-primary', 'order', 'edit');
        }

        // enable the edit button
        $('.edit').prop('disabled', false);
    });

    // Clicking the order button (in the cart)
    $(document).on('click', '.order', function() {
        // TODO send the list to the server
        if (ordersAmount > 0) {
            jQuery.post('/orders', getOrdersSendRequest());
        }
        // disable the order button
        $('.order').prop('disabled', true);
        // we've committed TODO make it in success
        committed = true;
    });

    // Clicking the edit button (in the cart)
    $(document).on('click', '.edit', function() {
        // TODO send the new list to the server
        if (ordersAmount > 0) {
            
        }
        // disable the edit button
        $('.edit').prop('disabled', true);
    });
});

function swapButtons(textToChange, clr1, clr2, class1, class2) {
    // change the text
    $('.' + class1).text(textToChange);
    // change the color
    $('.' + class1).removeClass(clr1);
    $('.' + class1).addClass(clr2);
    // remove the original class and adding the new class
    $('.' + class1).addClass(class2);
    $('.' + class2).removeClass(class1);
}

function getOrdersSendRequest() {
    let orders = [];
    let lis = $("#cart-content li");

    for (let i = 0; i < lis.length; i++)
        orders[i] = lis[i].innerText;

    return JSON.stringify({
        name: name,
        orders: orders
    });
}

// Clicking tick/edit button (My name is)
$('.apply-name').click(function() {
	if (!$(this).hasClass('edit-name')) { // tick
        let inputValue = $('.input-name').val();
		if (inputValue.length < 2) { // The smallest name I know has 2 letters, so...
			return alert("Minimum 2 letters");
		} else {
			// disable the input panel
			$('.input-name').prop('disabled', true);
			// make check button the edit button and change it's colour to gray
			$(this).removeClass('apply-name');
			$(this).addClass('edit-name');
			$(this).removeClass('btn-success');
			$(this).addClass('btn-secondary');
            $(this).html('Edit');
            name = inputValue;
		}
	} else if (confirm("Are you sure you want to edit your name?")) { // edit
		// enable the input panel
		$('.input-name').prop('disabled', false);
		// make edit button the check button and change it's colour to green
		$(this).removeClass('edit-name');
		$(this).addClass('apply-name');
		$(this).removeClass('btn-secondary');
		$(this).addClass('btn-success');
        $(this).html('&check;');
        
        // TODO tell the server to change the name of the client with these orders (NEED BACKEND)

    }

	// show the menu if not shown already
	if ($('.menu').is(':hidden')) {
		$('.menu').slideDown(300, function() { // callback
			$('.card-img-top').slideDown(200);
		});
	}
});

// Clicking Enter while focused on writing the name
$('.input-name').keypress(function(event){
    if(event.keyCode == 13){ // 13 = Enter
      $('.apply-name').click();
    }
});