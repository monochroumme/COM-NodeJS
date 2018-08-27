const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

let app = express();

app.set('port', (process.env.PORT || 3000));
app.use(express.static(path.join(__dirname, '/public')));
app.set('views', path.join(__dirname, '/views'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Connecting to the db
mongoose.connect('mongodb://localhost/com', { useNewUrlParser: true });
const db = mongoose.connection;
// Check for connection
db.once('open', () => {
    console.log('Connected to MongoDB/com');
});
// Check for db errors
db.on('error', (err) => {
    console.log(err);
});
// Bring in Orders
let Order = require('./models/order');
let Session = require('./models/session');

const client = require('./routes/client')(app, Order);
const servant = require('./routes/servant')(app, Order, Session);

// Listening to the port
app.listen(app.get('port'), () => console.log("Listening on port " + app.get('port')));
