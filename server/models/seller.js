const mongoose = require('mongoose');

const SellerSchema = new mongoose.Schema({
    sellername: {
        type: String,
        required: true,
    },

    sellerid: {
        type: String,
        required: true,
    }
});

const SellerModel = mongoose.model("sellers", SellerSchema)
module.exports.SellerModel = SellerModel;