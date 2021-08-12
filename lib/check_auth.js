var express = require('express');

module.exports = {
    checkAuthentication: function(req,res,next){
        if(req.isAuthenticated()){
            //req.isAuthenticated() will return true if user is logged in
            next();
        } else{
            req.flash("warning", "You must be logged in to do that");
            res.redirect("/login");
        }
    }
};