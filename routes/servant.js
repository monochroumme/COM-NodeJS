const username = 'admin';
const password = 'youllneverguess';

module.exports = function(app, Order, Session) {
  // Routes
  app.post('/servant/login', async (req, res) => {
    if (req.body.username == username && req.body.password == password) {
      let session = new Session();
      try {
        const servant = await session.save();
        // Give the servant his cookie with the session ID
        res.status(200).send(servant.id);
        console.log('A new servant#' + servant.id + ' has logged into the system');
      } catch (error) {
        console.log(error);
        res.status(500).send(error);
      }
    } else {
      res.status(401).send('NAH');
    }
  });

  app.post('/servant/logout', async (req, res) => {
    try {
      const servant = await Session.findByIdAndDelete(req.body.id);
      res.status(200).send('Logged out');
      console.log('The servant#' + servant.id + ' has logged out');
    } catch (error) {
      res.status(400).send(error);
      console.log(error);
    }
  });

  app.post('/servant/orders', async (req, res) => {
    try {
      const session = await Session.findById(req.body.id)
      if (session) {
        try {
          const orders = await Order.find({});

          let curI = 0,
            curOrders = [];

          orders.forEach((order) => {
            curOrders[curI] = order;
            curI++;
          });

          res.status(200).send(curOrders);
        } catch (error) {
          res.status(500).send(error);
          console.log(error);
        }
      }
    } catch (error) {
      res.status(401).send(error);
      console.log(error);
    }
  });

  app.post('/servant/serve', async (req, res) => {
    try {
      const session = await Session.findById(req.body.id);
      try {
        const order = await Order.findById(req.body.clientID);
        if (order && order != null) {
          order.served = true;
          console.log(order);
          try {
            await order.save();
            res.status(200).send('Client was successfully served');
            console.log(order.name + '#' + order.id + ' was successfully served by servant#' + session.id);
          } catch (error) {
            res.status(500).send(error);
            console.log(error);
          }
        }
      } catch (error) {
        res.status(500).send(error);
        console.log(error);
      }
    } catch (error) {
      res.status(500).send(error);
      console.log(error);
    }
  });
}
