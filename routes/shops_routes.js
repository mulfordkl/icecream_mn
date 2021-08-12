var express = require('express');
var router = express.Router();
var config = require('../config');
var checkAuth = require('../lib/check_auth');

// Google Maps API
const maps_key = config.google_maps_api;
const {Client} = require("@googlemaps/google-maps-services-js");
// Database connection
const { Connection } = require('../connection.js')


/* GET the new shop form page */
router.get('/', function(req, res, next) {
  res.render('new_shop_form');
});


/* Handle the submission of the new shop form */
router.post('/submit_new_shop', checkAuth.checkAuthentication, check_shop_exists, function(req, res, next) {
  console.log("New Shop Received")
  console.log(req.body)

  new_shop_address = req.body.street_address + ", " + req.body.city + ", " + req.body.state + " " + req.body.zipcode

  const maps_client = new Client({});
  maps_client
  .geocode({
    params: {
        address: new_shop_address,
        key: maps_key,
    },
    timeout: 1000, // milliseconds
  })
  .then((r) => {
    lat = r.data.results[0].geometry.location.lat
    lng = r.data.results[0].geometry.location.lng
    if (!(lng > -100 && lng < -85 && lat > 35 && lat < 50)) {
      req.flash('warning', "Address not in Upper Midwest")
      return res.redirect('/shops');  
    }
    console.log(r.data.results[0].geometry.location);
    async function add_new_shop() {
        try {
            const collection = Connection.db.db("icecream_mn").collection("icecream_shops");

            const result = await collection.insertOne({ "name": req.body.shop_name, 
                                                        "address": new_shop_address,
                                                        "zipcode": req.body.zipcode,
                                                        "website": req.body.website,
                                                        "latlng": r.data.results[0].geometry.location,
                                                        "reviews": []    
                                                    });
            return res.redirect('/')
        } catch (e) {
          req.flash("warning", "Some error with the submission. Try again")
        }
    }
    add_new_shop().catch(console.dir);
  })
  .catch((e) => {
    console.log(e.response.data.error_message);
    req.flash('warning', "Something is wrong")
    res.redirect('/shops');
  });  
});

/* Handle the GET request for all shop info */
router.get('/get_shop_info', function(req, res, next) {
    async function get_shop_info() {
        try {

            const collection = Connection.db.db("icecream_mn").collection("icecream_shops");
            const cursor = collection.find({});
            
            let items = [];
            await cursor.forEach(function(doc){
                items.push(doc);
            });
            res.send(JSON.stringify(items))
        } finally {

        }
    }
    get_shop_info().catch(console.dir);
});

async function check_shop_exists(req, res, next) {
  try {
    const collection = Connection.db.db("icecream_mn").collection("icecream_shops");
    const result = await collection.findOne({ "name": req.body.shop_name });
    console.log("The result it" + result);
    if (result) {
      req.flash("warning", "A shop with that name already exists")
      res.redirect("/shops");
    } else {
      next()
    }
  } catch (e) {
      req.flash("warning", "Some error occurred")
      res.redirect("/shops");
  }
};

module.exports = router;