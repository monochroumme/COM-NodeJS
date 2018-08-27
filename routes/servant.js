const username = 'admin';
const password = 'youllneverguess';

let curOrders;

module.exports = function(app, Order, Session) {
  // Routes
  app.post('/servant/login', (req, res) => {
    if (req.body.username == username && req.body.password == password) {
      let session = new Session();
      session.save((err, servant) => {
        if (err) {
            console.log(err);
            res.status(500).send(err);
        } else {
            // Give the servant his cookie with the session ID
            res.status(200).send(servant.id);
            console.log('A new servant#' + servant.id + ' has logged into the system');
        }
      });
    } else {
      res.status('401').send('NAH');
    }
  });

  app.post('/servant/logout', (req, res) => {
    Session.findByIdAndRemove(req.body.id, (err, servant) => {
      if (err) {
        res.status(400).send(err);
        console.log(err);
      }
      else {
        res.status(200).send('Logged out');
        console.log('The servant#' + servant.id + ' has logged out');
      }
    });
  });

  app.post('/servant/orders', (req, res) => {
    Session.findById(req.body.id, (err, session) => {
      if (err) {
        res.status(401).send(err);
        console.log(err);
      } else {
        Order.find({}, (err, orders) => {
          if (err) {
            res.status(500).send(err);
            console.log(err);
          } else {
            let curI = 0,
            curOrders = [];

            orders.forEach((order) => {
              curOrders[curI] = order;
              curI++;
            });

            res.status(200).send(curOrders);
          }
        });
      }
    })
  });

  app.post('/servant/delete', (req, res) => {
    console.log(req.body);
    Session.findById(req.body.id, (err, session) => {
      if (err) {
        res.status(500).send(err);
        console.log(err);
      } else {
        Order.findById(req.body.clientID, (err, order) => {
          if (err) {
            res.status(500).send(err);
            console.log(err);
          } else {
            if (order && order != null) {
              order.served = true;
              console.log(order);
              order.save(err => {
                  if (err) {
                      res.status(500).send(err);
                      console.log(err);
                  } else {
                      res.status(200).send('Client was successfully served');
                      console.log(order.name + '#' + order.id + ' was successfully served by servant#' + session.id);
                  }
              });
            }
          }
        });
      }
    });
  });
}
