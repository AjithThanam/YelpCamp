var express = require("express");
var router = express.Router({mergeParams: true});
var Campground = require("../models/campgrounds");
var Comment = require("../models/comment");
var middleware = require("../middleware");



//==============================
//*******COMMENT ROUTES*********
//==============================

//Create a new comment
router.get("/new", middleware.isLoggedIn, function(req, res){
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err)
        }
        else{
            res.render("comments/new", {campground, campground});
        }
    })
});

//Post the comment and save to DB
router.post("/", middleware.isLoggedIn, function(req, res){
    Campground.findById(req.params.id, function(err, campground) {
        if(err){
            console.log(err);
            res.redirect("/camprounds");
        }
        else {
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    console.log(err);
                }
                else{
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    
                    campground.comments.push(comment);
                    campground.save();
                     req.flash("success", "Successfully added comment");
                    res.redirect("/campgrounds/" + campground._id);
                }
            });
        }
    });
});

//Show edit form for a comment
router.get("/:comment_id/edit", middleware.checkCommentOwnership,function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment){
        if(err) {
            res.redirect("back");
        }
        else {
            res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});     
        }
    });
});

//Update comments
router.put("/:comment_id", middleware.checkCommentOwnership,function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err) {
            res.redirect("back");
        }
        else {
            res.redirect("/campgrounds/" + req.params.id)
        }
    });
});

//delete a comment
router.delete("/:comment_id", middleware.checkCommentOwnership,function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err) {
            res.redirect("back");
        }
        else {
            req.flash("success", "Comment has been successfully removed");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
})


module.exports = router;