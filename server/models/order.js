const mongoose = require('mongoose');
const ProductModel = require('./product').ProductModel;

const OrderSchema = new mongoose.Schema({

    sellerid: {
        type: Number,
        required: true,
    },

    products: {
        type: Array,
        lists: [ProductModel],
        required: true
    }
});

const OrderModel = mongoose.model("orders", OrderSchema)
module.exports.OrderModel = OrderModel;