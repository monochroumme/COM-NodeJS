const express = require('express');
//const mongoose = require('mongoose');

var app = express();

// const clientSchema = new mongoose.Schema({
//     name: String,
//     orders: [String]
// });

app.set('port', (process.env.PORT || 3000));
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/views');

app.get("/", (req, res) => {
    res.sendFile(app.get('views') + '/index.html');
});

// app.post('/orders', (req, res) => {
//     var query1=req.body.name;
//     var query2=req.body.orders;
//     console.log(query1 + " " + query2);
//     res.send(query1 + " " + query2);
// });

app.listen(app.get('port'), () => console.log("Listening on port " + app.get('port')));