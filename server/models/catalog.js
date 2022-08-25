const mongoose = require('mongoose');
const ProductModel = require('./product').ProductModel;

const CatalogSchema = new mongoose.Schema({
    sellerid: {
        type: Number,
        required: true,
    },

    products: {
        type: Array,
        lists: [ProductModel],
        required: true,
    },
});

const CatalogModel = mongoose.model("catalogs", CatalogSchema)
module.exports.CatalogModel = CatalogModel;