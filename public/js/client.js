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
    // notify that a new order was added to the cart
    notify('green', 'Your ' + coffeeType.toLowerCase() + ' was added to the cart');
    // if it's the 1st time that we add a new order
    if (ordersAmount === 1) {
      // hide No Orders
      $('.no-orders').hide();
      // show the Order button
      $('.order').show();
    } else {
      if (committed) {
        if ($('.order').length)
          swapButtons();
        $('.update').prop('disabled', false); // enable the update button
      }
    }
  });

  // Clicking the trash can button
  $(document).on('click', '.delete-order', function() {
    if ($('[order-id=' + $(this).parent().attr('order-id') + ']').children().eq(0).attr('status') != 'done') { // if it's status is not done
      if (ordersAmount == 1) {
        if (!$('.order').length) {
          swapButtons();
        }
        // enable the order button
        $('.order')
          .prop('disabled', false)
        .addBack()
        // hide the order button
          .hide();
        // show No Coffee To Order text
        $(".no-orders").show();
        // reset the orderID so it wouldn't go to infinity
        orderID = -1;
        if (committed) {
          sendOrders('DELETE', () => notify('green', 'Your order was successfully removed from the cart'));
          clearInterval(curInterval);
          committed = false;
        }
      } else if (committed) {
        if (!$('.update').length)
          swapButtons();
        // enable the update button
        $('.update').prop('disabled', false);
      }

      ordersAmount--;
      notify('green', 'Your order was successfully removed from the cart');
    } else {
      notify('green', 'Your delivered order was successfully removed from the cart');
    }
    // detele the order from the Cart
    $('[order-id=' + $(this).parent().attr('order-id') + ']').remove();
  });

  // Clicking the order button (in the cart)
  $(document).on('click', '.order', function() {
    if (ordersAmount > 0) {
      sendOrders("POST", (id) => {
        clientID = id;
        committed = true;
        statusOrdered();
        notify('green', "You've successfully ordered your coffee!");
        curInterval = setInterval(checkForServed, 1000 * 20); // check every 20 seconds
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

function swapButtons() {
    // create some variables
    let textToChange, clr1, clr2, class1, class2;
    // determine which button is out there at the moment
    if ($('.order').length) {
      textToChange = 'Update';
      clr1 = 'btn-success';
      clr2 = 'btn-primary';
      class1 = 'order';
      class2 = 'update';
    } else {
      textToChange = 'Order';
      clr1 = 'btn-primary';
      clr2 = 'btn-success';
      class1 = 'update';
      class2 = 'order';
    }

    $('.' + class1)
      // change the text
      .text(textToChange)
    .addBack()
      // change the color
      .removeClass(clr1)
    .addBack()
      .addClass(clr2)
    .addBack()
      // remove the original class and adding the new class
      .addClass(class2);
    $('.' + class2).removeClass(class1);
}

function getOrdersSendRequest() {
  let orders = [];
  let orderIndex = 0;
  let $lis = $("#cart-content li");

  for (let i = 0; i < $lis.children().length; i++) {
    if ($lis.eq(i).children().eq(0).attr('status') == 'pending' || $lis.eq(i).children().eq(0).attr('status') == 'ordered') {
      orders[orderIndex] = $lis.eq(i).children().eq(1).text();
      orderIndex++;
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
			$(this)
        .removeClass('apply-name')
      .addBack()
			   .addClass('edit-name')
       .addBack()
  			.removeClass('btn-success')
      .addBack()
			   .addClass('btn-secondary')
       .addBack()
         .html('Edit');
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
		$(this)
      .removeClass('edit-name')
    .addBack()
    	.addClass('apply-name')
    .addBack()
    	.removeClass('btn-secondary')
    .addBack()
    	.addClass('btn-success')
    .addBack()
      .html('&check;');
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
        if (!$('.order').length) {
          swapButtons();
        }
        // enable Order button
        $('.order')
          .prop('disabled', false)
        .addBack()
          // hide Order button
          .hide();
        // show No Coffee to Order
        $('.no-orders').show();
        // Make the served orders DONE in the cart
        let $cart = $(".cart li");
        for (let i = 0; i < data.orders.length; i++) {
          for (let j = 0; j < $cart.children().length; j++) {
            if ($cart.eq(j).children().eq(0).attr('status') == 'ordered' && $cart.eq(j).children().eq(1).text() == data.orders[i]) { // if the coffee type in the cart is the same as in the orders
              $cart.eq(j).children().eq(0).html('DONE');
              $cart.eq(j).children().eq(0).attr('status', 'done');
              // decrease the ordersAmount only once by checking if the order is in the Cart
              if ($cart.eq(j).parent().parent().parent().is('#cart-content'))
                ordersAmount--;
            }
          }
        }
      } else if (data.status == 'NOTSERVED') return;
      else {
        clearInterval(curInterval); // stop checking
        notify('red', "There was a problem while checking if the orders were delivered :( Use Help to figure out what happened");
        console.log('No response from server when checking for served. Make sure both the server and the db are up');
      }
    }
  }).fail(() => {
    clearInterval(curInterval); // stop checking
    notify('red', 'There was a problem while checking if you were served :( Use Help to figure out what happened');
  });
}

function statusOrdered() {
  let $lis = $('.cart-order');
  for (let i = 0; i < $lis.children().length; i++) {
    if ($lis.children().eq(i).attr('status') == 'pending'){
      $lis.children().eq(i).attr('status', 'ordered');
      $lis.children().eq(i).html('ORDERED');
    }
  }
}
