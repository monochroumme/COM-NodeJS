let ordersAmount = 0;
let orderID = -1;
let clientID;
let committed = false;
let curInterval;
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
            '<div class="order-status" status="pending">PENDING</div>' +
            '<div class="order-coffee-type">' + coffeeType + '</div>' +
            '<button type="button" class="btn btn-danger delete-order"><img src="icons/trash.png" width="14px" height="14px"></button>' +
        '</li>');
        // if now we have 1 order, then show the order button and hide the No Orders text
        if (ordersAmount === 1) {
            $('.no-orders').hide();
            $('.order').show();
        }
        // if we've already committed the orders before and there isn't the update button already, then change the order button to update button
        if (!$('.update').length && committed) swapButtons("Update", 'btn-success', 'btn-primary', 'order', 'update');
        $('.update').prop('disabled', false);
        $('.order').prop('disabled', false);

        notify('green', 'Your ' + coffeeType.toLowerCase() + ' was added to the cart');
    });

    // Clicking the trash can button
    $(document).on('click', '.delete-order', function() {
        // delete it both from popover-body cart-order-list by using the specific id number of the parent of the clicked button
        if ($('[order-id=' + $(this).parent().attr('order-id') + ']').children().eq(0).attr('status') == 'done') { // if it's status is done
            $('[order-id=' + $(this).parent().attr('order-id') + ']').remove(); // then just remove it
            notify('green', 'Your delivered order was successfully removed from the cart');
        } else {
            $('[order-id=' + $(this).parent().attr('order-id') + ']').remove();
            ordersAmount--;

            if (ordersAmount === 0) {
                // if there's Update button, then make it the order button
                if ($('.update').length)
                    swapButtons("Order", 'btn-primary', 'btn-success', 'update', 'order');
                // enable the order button
                $('.order').prop('disabled', false);
                // hide the order button
                $('.order').hide();
                // add No Orders text
                $(".no-orders").show();
                orderID = -1;
                // Tell the server that this client has deleted all the orders
                if (committed)
                    sendOrders('DELETE', () => notify('green', 'Your order was successfully removed from the cart'));
                committed = false;
                clearInterval(curInterval);
            } else if ($('.order').length && committed) {
                swapButtons("Update", 'btn-success', 'btn-primary', 'order', 'update');
            }

            // enable the update button
            $('.update').prop('disabled', false);

            if (!committed)
                notify('green', 'Your order was successfully removed from the cart');
        }
    });

    // Clicking the order button (in the cart)
    $(document).on('click', '.order', function() {
        if (ordersAmount > 0) {
            sendOrders("POST", (id) => {
                clientID = id;
                committed = true;
                statusOrdered();
                notify('green', "You've successfully ordered your coffee!");
                curInterval = setInterval(checkForServed, 1000 * 5); // 60 secs = 1 min (check every 1 minute)
            });
        }
        // disable the order button
        $('.order').prop('disabled', true);
    });

    // Clicking the update button (in the cart)
    $(document).on('click', '.update', function() {
        if (ordersAmount > 0) {
            sendOrders("PUT", () => {
                notify('green', "You've successfully updated your order list!");
                statusOrdered();
            });
        }
        // disable the update button
        $('.update').prop('disabled', true);
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
    let $lis = $("#cart-content li");

    for (let i = 0; i < $lis.children().length; i++) {
        if ($lis.eq(i).children().eq(0).attr('status') == 'pending' || $lis.eq(i).children().eq(0).attr('status') == 'ordered') {
            orders[i] = $lis.eq(i).children().eq(1).text();
        }
    }

    if (!clientID)
        return {
            "name": name,
            "orders": orders
        };
    else return {
            "id": clientID,
            "name": name,
            "orders": orders
        };
}

function sendOrders(type, success) {
    $.ajax({
        type: type,
        url: "/orders",
        data: getOrdersSendRequest(),
        success: (data) => {
            success(data);
        }
    }).fail(() => notify('red', 'There was a problem while ordering :( Use Help to figure out what happened'));
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

            // Change the name of the client with these orders
            if (ordersAmount > 0 && committed) {
                sendOrders('PUT', () => notify('green', "Your coffee was succesfully reordered to your name"));
            } else notify('green', "Welcome to COM, " + name + "!");
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

function checkForServed() {
    $.ajax({
        type: "GET",
        url: "/checkorder/" + clientID,
        success: (data) => {
            if (data.status == 'SERVED') {
                notify('green', "You've been served successfully. Thanks for using our services!");
                console.log("You've been successfully served");
                clearInterval(curInterval); // stop checking
                committed = false;
                clientID = undefined;
                swapButtons("Order", 'btn-primary', 'btn-success', 'update', 'order');
                // Make the served orders DONE in the cart
                let $cart = $(".cart li");
                for (let i = 0; i < $cart.children().length; i++) {
                    for (let j = 0; j < data.orders.length; j++) {
                        if ($cart.eq(i).children().eq(1).text() == data.orders[j]) { // if the coffee type in the cart is the same as in the orders
                            $cart.eq(i).children().eq(0).html('DONE');
                            $cart.eq(i).children().eq(0).attr('status', 'done');
                            ordersAmount--;
                        }
                    }
                }
            } else if (data.status == 'NOTSERVED') return;
            else {
                clearInterval(curInterval); // stop checking
                console.log('No response from server when checking for served. Make sure both the server and the db are up');
            }
        }
    }).fail(() => {
        clearInterval(curInterval); // stop checking
        notify('red', 'There was an problem when checking if you were served :( Use Help to figure out what happened');
    });
}

function statusOrdered() {
    $('li .order-status').attr('status', 'ordered');
    $('li .order-status').html('ORDERED');
}