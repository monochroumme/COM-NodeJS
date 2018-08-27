let sessionID;
let $servantOrderlist = $('#servant-orderlist');

$(function() {
  // Clicking the qm popover
  $('#servant-qm').popover({
    html: true,
    'content': () => { return $('#qm-servant-content').html(); }
  });

  $('#servant-password').keypress(function(event){ // TODO doesn't work
    if(event.keyCode == 13){ // 13 = Enter
      $('#servant-login').click();
    }
  });

  $('#servant-login').click(() => {
    if ($('.servant-username').val() !== '' && $('.servant-password').val() !== '') {
      $.ajax({
        type: 'POST',
        url: '/servant/login',
        data: {
          "username": $('.servant-username').val(),
          "password": $('.servant-password').val()
        },
        success: (data) => {
            sessionID = data;
            $('#servant-login-form').slideUp(1000, () => {
              $('#servant-table').slideDown(1000);
            });
            updateOrders();
            setInterval(updateOrders, 1000 * 20); // every 20 secs
        }
      }).fail(() => notify('red', 'Incorrect username or password'));
    } else {
      notify('red', 'Both username and password must be entered');
    }
  });

  $('#servant-update').click(() => {
    updateOrders();
  });

  $(document).on('click', '.checkbox', () => {
    $.ajax({
      type: 'POST',
      url: '/servant/delete',
      data: {
        "id": sessionID,
        "clientID": document.activeElement.id
      },
      success: (data) => {
        notify('green', 'Client was successfully served!');
        document.activeElement.disabled = true;
      }
    }).fail(() => notify('red', 'There was a problem with serving this client. Please log in again'));
  });
});

function updateOrders() {
  $.ajax({
    type: 'POST',
    url: '/servant/orders',
    data: {
      "id": sessionID
    },
    success: (data) => {
      notify('green', 'Orders are updated!');

      $servantOrderlist.html('');
      for (let i = 0; i < data.length; i++) {
        let curOrders = '';
        for (let j = 0; j < data[i].orders.length; j++) {
          curOrders += data[i].orders[j].charAt(0).toUpperCase() + data[i].orders[j].slice(1) + '<br>';
        }
        $servantOrderlist.append(
          '<li class="list-group-item d-flex">' +
            '<div class="flex-fill order-client-name">' + data[i].name + '</div>' +
            '<div class="flex-fill order-coffee">' + curOrders + '</div>' +
            '<div class="flex-fill order-tick"><input id="' + data[i]._id +
            '" class="checkbox" type="checkbox" name="' + data[i].name + '" value="' + data[i].name +
            '"' + (data[i].served ? 'disabled checked' : '') + '></div>' +
          '</li>'
        );
      }
    }
  }).fail(() => notify('red', 'There was a problem with getting the order list. Please log in again'));
}
