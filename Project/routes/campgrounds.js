var express = require("express");
var router = express.Router();
var Campground = require("../models/campgrounds");
var middleware = require("../middleware");



//INDEX - retreive all campgrounds from the database
router.get("/", function(req, res){
    Campground.find({}, function(err, allCampgrounds){
        if(err){
            console.log(err);
        }
        else{
            res.render("campgrounds/index", {campgrounds: allCampgrounds});  
        }
    });
});

//CREATE - add new campground to database
router.post("/", middleware.isLoggedIn, function(req, res){
   var campName = req.body.campName;
   var price = req.body.price;
   var campImgURL = req.body.imgURL;
   var desc = req.body.description;
   var author = {
       id: req.user._id,
       username: req.user.username
   };
   var newCampground = {
       name: campName,
       price: price,
       image: campImgURL,
       description: desc,
       author: author
   };
   
    Campground.create(newCampground, function(err, newlyCampground){
        if(err){
            console.log(err);
        }
        else{
            //redirect to campgrounds page
            res.redirect("/campgrounds");
        }
    });
});

//NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("campgrounds/new");
});

//SHOW - shows more info about selected campgrounds
router.get("/:id", function(req, res){
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err || foundCampground === null){
            req.flash("error", "Campground Not Found");
            res.redirect("back")
        }
        else{
            res.render("campgrounds/show",{ campground: foundCampground });
        }
    });
});

//EDIT - shows form to allow a user to update a campground posting
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        res.render("campgrounds/edit", {campground: foundCampground});
    });
});

//UPDATE - takes the edits saves them to the DB
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
   Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
       if(err) {
           res.redirect("/campgorunds");
       }
       else {
           req.flash("success", "Campground has been successfully edited");
           res.redirect("/campgrounds/" + req.params.id)
       }
   }); 
});

//DESTROY - delete a campground
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err){
        if(err) {
            res.redirect("/campgrounds");
        }
        else {
            req.flash("success", "Campground has been successfully removed");
            res.redirect("/campgrounds");
        }
    });
})


module.exports = router;