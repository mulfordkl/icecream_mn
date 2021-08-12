var express = require('express');
var router = express.Router();
var checkAuth = require('../lib/check_auth');
// Database connection
const { Connection } = require('../connection.js')
var mongo = require('mongodb')

/* GET new review form page */
router.get('/', function(req, res, next) {
  res.render('review_form');
});


/* Handle the POST request for a new review submission */
router.post('/submit_review', checkAuth.checkAuthentication, function(req, res, next) {

  async function add_review() {

    try {
        var o_id = new mongo.ObjectID(req.user);
        const user_collection = Connection.db.db("icecream_mn").collection("users");
        const reviewer = await user_collection.findOne({ "_id": o_id })

        const collection = Connection.db.db("icecream_mn").collection("icecream_shops");

        const result = await collection.updateOne(
          { "name": req.body.shop_name },
          { "$push": { reviews: {"review_date": req.body.review_date,
                       "reviewer": reviewer.username,
                       "flavors_tried": req.body.flavors_tried,
                       "cone_tried": req.body.cone_tried,
                       "flavor_score": req.body.flavor_score,
                       "texture_score": req.body.texture_score,
                       "overall_score": req.body.overall_score,
                       "comments" : req.body.comments
                      } 
                    }
        
          }
        );
        if (result.modifiedCount == 0) {
          req.flash('warning', "Add the shop if it is the first visit");
          return res.redirect('/add_review');
        }
        return res.redirect('/')
    } catch (e) {
      res.status(500).send({ message: e.message });
    };
  };
  add_review().catch(console.dir);
});

/* Handle the GET autocomplete request */
router.get('/shop_name_autocomplete', checkAuth.checkAuthentication, async (request, response) => {

  try {

    const collection = Connection.db.db("icecream_mn").collection("icecream_shops");

    let result = await collection.aggregate([
      {
        "$search": {
          "index": "name_index",
          "autocomplete": {
            "query": `${request.query.query}`,
            "path": "name",
            "fuzzy": {
              "maxEdits": 2,
              "prefixLength": 3
            }
          }
        }
      }
    ]).toArray();
    if ( result.length > 0 ) {
      response.send(result)
    } else {
      response.send([{"name": "None found...", "_id":"0"}])
    }
  } catch (e) {
    response.status(500).send({ message: e.message });
  }
});

/* Handle the GET request for all the reviews */ 
router.get("/get_all_reviews", async (req, res, next) => {
  try {

    const collection = Connection.db.db("icecream_mn").collection("icecream_shops");

    let result = await collection.find({ })
        .project({"name": 1, "reviews": 1, "_id": 0})  
        .toArray();

    all_reviews = [];
    result.forEach(function (item, index) {
      let shop = item.name;
      item.reviews.forEach(function (review, index2) {
        review.shop_name = shop
        all_reviews.push(review);
      });
    });
      res.render('review_list', {reviews: all_reviews})
  } catch (e) {
    response.status(500).send({ message: e.message });
  }

});


module.exports = router;

