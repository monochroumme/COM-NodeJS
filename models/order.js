const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    name: { 
        type: String,
        required: true
    },
    orders: {
        type: [String],
        required: true
    }
}, {
    versionKey: false
});

const Order = module.exports = mongoose.model('Order', orderSchema);