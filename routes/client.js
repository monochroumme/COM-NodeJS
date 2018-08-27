const path = require('path');

module.exports = function(app, Order) {
  // Routes
  app.get("/", (req, res) => {
      res.sendFile(path.join(app.get('views'), '/index.html'));
  });

  app.post('/orders', (req, res) => {
      let order = new Order();
      order.name = req.body.name;
      order.orders = req.body.orders;
      order.served = false;

      order.save((err, client) => {
          if (err) {
              console.log(err);
              res.status(500).send(err);
          } else {
              // Give the client his ID
              res.status(200).send(client.id);
              console.log(client.name + '#' + client.id + ' has added a new order: ' + client.orders);
          }
      });
  });

  app.put('/orders', (req, res) => {
      Order.findById(req.body.id, (err, client) => {
          if (err) {
              res.status(400).send(err);
              console.log(err);
          }
          else {
              if (client.name != req.body.name) { // Change the name of the client
                  console.log(client.name + '#' + client.id + ' has changed his name to ' + req.body.name);
                  client.name = req.body.name;
              }
              // Change the orders of the user with this id
              client.orders = req.body.orders;
              client.save(err => {
                  if (err) {
                      res.status(500).send(err);
                      console.log(err);
                  } else {
                      res.status(200).send('Successfully updated the orders');
                      console.log(client.name + '#' + client.id + ' has updated his order: ' + client.orders);
                  }
              });
          }
      });
  });

  app.delete('/orders', (req, res) => {
      Order.findByIdAndRemove(req.body.id, (err, client) => {
          if (err) {
              res.status(400).send(err);
              console.log(err);
          }
          else {
              res.status(200).send('Successfully deleted all the orders');
              console.log(client.name + '#' + client.id + ' has been removed from the db');
          }
      });
  });

  app.get('/checkorder/:id', (req, res) => {
    Order.findById(req.params.id, (err, client) => {
      if (err) {
        res.status(400).send(err);
        console.log(err);
      } else if (client.served) {
        Order.findByIdAndRemove(req.params.id, (err, client) => {
          if (err) {
            res.status(400).send(err);
            console.log(err);
          } else {
            res.status(200).json({ status: 'SERVED', orders: client.orders });
            console.log(client.name + '#' + client.id + ' has been successfully served and removed from the db');
          }
        });
      } else {
        res.status(200).json({ status: 'NOTSERVED' });
      }
    });
  });
}
