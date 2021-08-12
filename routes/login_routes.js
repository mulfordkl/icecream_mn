var express = require('express');
var router = express.Router();
// Database connection
const { Connection } = require('../connection.js')
// Import authentication modules
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
var bcrypt = require("bcrypt");

/* GET Login page. */
router.get('/', function(req, res, next) {
    res.render('login_form');
});

router.post('/login',
    passport.authenticate('local', {    successRedirect: '/',
                                        failureRedirect: '/login',
                                        failureFlash: true
                        })
);

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

// This is the function to handle local authentication
passport.use(new LocalStrategy({
    passReqToCallback: true
},
    function(req, username, password, done) {
        const User = Connection.db.db("icecream_mn").collection("users");

        User.findOne({ username: username }, function(err, user) {
            if (err) { return done(err); }
            if (!user) {
                return done(null, false, { message: req.flash('warning', 'Username Not Found') });
            }
            if (!bcrypt.compareSync(password, user.password)) {
                return done(null, false, { message: req.flash('warning', 'Incorrect password.') });
            }
            return done(null, user);
        });
    }
));

module.exports = router;