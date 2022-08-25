var express = require('express');
var cors = require('cors');
var app = express();
var dotenv = require('dotenv').config();
const mongoose = require('mongoose');
const UserModel = require('./models/user').UserModel;
const SellerModel = require('./models/seller').SellerModel;
const CatalogModel = require('./models/catalog').CatalogModel;
const OrderModel = require('./models/order').OrderModel;

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }));


const mongoAtlasUri = process.env.MONGOLAB_URI;

try {
    // Connecting to the MongoDB cluster
    mongoose.connect(
        mongoAtlasUri,
        { useNewUrlParser: true, useUnifiedTopology: true },
        (err) => console.log(err)
    );

} catch (e) {
    console.log("could not connect");
}


//AUTH API

app.post('/api/auth/register', async (req, res) => {
    var uname = req.body.username;
    var passwd = req.body.password;
    var type = req.body.type;
    const item = req.body;

    if (type == "buyer" || type == "seller") {
        const newItem = new UserModel(item);
        await newItem.save();
        res.send("registered username: " + uname);

        if (type == "seller") {
            //finding the last enetered 'id', new seller will have 'id' + 1
            var id;
            const resp = await SellerModel.find({}).sort({ _id: -1 }).limit(1).then((sellers) => {
                console.log(sellers[0].sellerid);
                id = parseInt(sellers[0].sellerid);
            })
            const item = {
                "sellername": uname,
                "sellerid": id + 1
            };
            const newSeller = new SellerModel(item);
            await newSeller.save();
        }
    }

    else {
        res.send("Wrong user type");
    }
});

app.post('/api/auth/login', async (req, res) => {
    var uname = req.body.username;
    var passwd = req.body.password;

    const response = await UserModel.find({ "username": uname, "password": passwd });
    console.log(response);
    if (response.length) {
        res.send("Login successful");
    }
    else {
        res.send("wrong username/password");
    }
    console.log(uname, passwd);
});


// APIs for buyers

app.get('/api/buyer/list-of-sellers', async (req, res) => {

    console.log('get and return list of sellers');

    const response = await SellerModel.find({});

    res.send(response);

});

app.get('/api/buyer/seller-catalog/:seller_id', async (req, res) => {

    var sellerid = req.params.seller_id;
    sellerid = sellerid.substring(1);
    sellerid = parseInt(sellerid);

    console.log('Requested the catalog for sellerid: ' + sellerid);

    const response = await CatalogModel.find({ "sellerid": sellerid });

    if (response.length > 0) {
        res.send({ "message": "found", "catalog": response });
    }
    else {
        res.send({ "message": "not-found" });
    }
});

app.post('/api/buyer/create-order/:seller_id', async (req, res) => {

    var sellerid = req.params.seller_id;
    sellerid = sellerid.substring(1);
    sellerid = parseInt(sellerid);

    const availOptions = await CatalogModel.find({ "sellerid": sellerid });

    console.log(availOptions);

    var orderRequests = req.body.products;

    var flag = 1;
    for (var i = 0; i < orderRequests.length; i++) {
        console.log(orderRequests);
        var tempReq = orderRequests[i];
        flag = 0;
        for (var j = 0; j < availOptions[0].products.length; j++) {
            console.log(tempReq.name, availOptions[0].products[j]);
            if (tempReq.name == availOptions[0].products[j].name) {
                flag = 1
                break;
            }
        }

        if (!flag)
            break;
    }

    if (flag) {
        console.log("all products available, placing order");
        const newOrder = new OrderModel({
            "sellerid": sellerid,
            "products": orderRequests
        });
        await newOrder.save();
        res.send({ 'message': "ok, order placed" });
    }
    else {
        res.send({ 'message': 'not-okay' });
    }
});


// APIs for sellers

app.post('/api/seller/create-catalog', async (req, res) => {
    console.log('Send a list of items to create a catalog for a seller');

    const catalog = req.body;
    const newCatalog = new CatalogModel(catalog);
    await newCatalog.save();

    res.send(catalog);
});

app.get('/api/seller/orders', async (req, res) => {

    console.log('Retrieve the list of orders received by a seller');

    var sellerid = req.body.sellerid;

    var orders = await OrderModel.find({ "sellerid": sellerid });

    if (orders.length)
        res.send(orders);
    else
        res.send({ "message": "no orders found" });
});

app.listen(5000, () => {
    console.log("listening at port: 5000");
});








