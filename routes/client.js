const path = require('path');

module.exports = function(app, Order) {
  // Routes
  app.get("/", (req, res) => {
      res.sendFile(path.join(app.get('views'), '/index.html'));
  });

  app.post('/orders', async (req, res) => {
      let order = new Order();
      order.name = req.body.name;
      order.orders = req.body.orders;
      order.served = false;

      try {
        const client = await order.save();
        // Give the client his ID
        res.status(200).send(client.id);
        console.log(client.name + '#' + client.id + ' has added a new order: ' + client.orders);
      } catch (error) {
        console.log(error);
        res.status(500).send(error);
      }
  });

  app.put('/orders', async (req, res) => {
    try {
      const client = await Order.findById(req.body.id);
      if (client.name != req.body.name) { // Change the name of the client
        console.log(client.name + '#' + client.id + ' has changed his name to ' + req.body.name);
        client.name = req.body.name;
      }
      // Change the orders of the user with this id
      client.orders = req.body.orders;
      client.served = false;
      try {
        await client.save();
        res.status(200).send('Successfully updated the orders');
        console.log(client.name + '#' + client.id + ' has updated his order: ' + client.orders);
      } catch (error) {
        res.status(500).send(error);
        console.log(error);
      }
    } catch (error) {
      res.status(400).send(error);
      console.log(error);
    }
  });

  app.delete('/orders', async (req, res) => {
    try {
      const client = await Order.findByIdAndDelete(req.body.id);
      res.status(200).send('Successfully deleted all the orders');
      console.log(client.name + '#' + client.id + ' has been removed from the db');
    } catch (error) {
      res.status(400).send(error);
      console.log(error);
    }
  });

  app.post('/checkorder/:id', async (req, res) => {
    try {
      const client = await Order.findById(req.params.id);
      if (client.served) {
        try {
          const client = await Order.findByIdAndDelete(req.params.id);
          res.status(200).json({status: 'SERVED', orders: client.orders});
          console.log(client.name + '#' + client.id + ' has been successfully served and removed from the db');
        } catch (error) {
          res.status(400).send(err);
          console.log(err);
        }
      } else {
        res.status(200).json({status: 'NOTSERVED'});
      }
    } catch (error) {
      res.status(400).send(err);
      console.log(err);
    }
  });
}
