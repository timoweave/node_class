var express = require('express');

var body_parser = require('body-parser');
var crud = require("../lib/crud");
var authen = require("../lib/verify");

var router = express.Router()
             .use(body_parser.json())
             .use(body_parser.urlencoded({ extended: false }))
             .use(authen.verifyOrdinaryUser);
module.exports = router;

var Dish = require('../models/dishes').Dish;
var Comment = require('../models/dishes').Comment;
var User = require('../models/users');

var all_dishes = router.route("/")
                 .get(crud.get_all(Dish, "Dish", "comments.postedBy"))
                 .put(authen.verifyAdmin, crud.cannot_do_it(Dish, "Dish"))
                 .post(authen.verifyAdmin, crud.create_one(Dish, "Dish"))
                 .delete(authen.verifyAdmin, crud.remove_all(Dish, "Dish"));

var one_dish = router.route("/:id(\\d+)")
               .get(crud.get_one(Dish, "Dish", "dish_id", "comments.postedBy"))
               .put(authen.verifyAdmin, crud.update_one(Dish, "Dish", "dish_id"))
               .post(authen.verifyAdmin, crud.cannot_do_it(Dish, "Dish"))
               .delete(authen.verifyAdmin, crud.remove_one(Dish, "Dish", "dish_id"));

var all_comments = router.route("/:dishId(\\d+)/comments")
                   .all(authen.verifyOrdinaryUser)
                   .get(get_all_comments)
                   .put(authen.verifyAdmin, crud.cannot_do_it(Comment, "Comment"))
                   .post(authen.verifyAdmin, create_one_comment)
                   .delete(authen.verifyAdmin, remove_all_comments);

var one_comments = router.route("/:dishId(\\d+)/comments/:commentId(\\d+)")
                   .all(authen.verifyOrdinaryUser)
                   .get(get_one_comment)
                   .put(authen.verifyCommentOwner, update_one_comment)
                   .post(crud.cannot_do_it(Comment, "Comment"))
                   .delete(authen.verifyCommentOwner, remove_one_comment);

function get_all_comments(request, response, next)
{ // GET /:dishId/comments
    var dish_id = request.params.dishId;
    // console.log(Dish.Schema.path("comments"));
    Dish.findOne({ dish_id : dish_id })
    .populate({
        path: "comments",
        model: 'Comment',
        populate: {
            path: 'postedBy',
            model: 'User'
        }
    })
    .exec(function (err, dish_with_comments) {
        if (err) throw err;
        response.json(dish_with_comments.comments);
        console.log(request);
    });
}

function create_one_comment(request, response, next)
{ // POST /:dishId/comments
    console.log(1, "get comment post...");
    console.log(2, request.body);
    console.log(3, request.decoded._doc._id);

    var dish_id = request.params.dishId;
    var user_id = request.decoded._doc._id;
    request.body.postedBy = user_id;
    var comment_input = request.body;

    Dish.findOne({ dish_id : dish_id }, function(dish_error, find_dish) {
        if (dish_error) { throw dish_error; }
        console.log(4, "find", find_dish);
        var comment = new Comment(comment_input);
        comment.save(function(comment_error, save_comment) {
            if (comment_error) { throw comment_error; }
            console.log(5, "save", save_comment);
            find_dish.comments = find_dish.comments || [];
            console.log(6, "comments", find_dish.comments);
            find_dish.comments.push(save_comment);
            find_dish.save(function(dish_comment_error, save_dish) {
                if (dish_comment_error) { throw dish_comment_error; }
                console.log(7, "save (dish&comment)", save_dish);
                Dish.findOne({_id : save_dish._id})
                .populate({
                    path: "comments",
                    model: 'Comment',
                    populate: {
                        path: 'postedBy',
                        model: 'User'
                    }
                })
                .exec(function(pop_error, pop_dish) {
                    console.log(8, "populate (dish&comment)", pop_dish);
                    pop_dish.populate("comments.postedBy")
                    response.json(pop_dish);
                })
            });
        });
    });
}

function remove_all_comments(request, response, next)
{ // DELETE /:dishId/comments
    var dish_id = request.params.dishId;
    var user_id = request.decoded._doc._id;
    request.body.postedBy = user_id;
    var comment_input = request.body;

    Dish.findOne({ dish_id : dish_id }, function(find_error, find_dish) {
        if (find_error) { throw find_error; }
        if (find_dish && find_dish.comments) {
            var delete_count = finish_dish.comments.length;
            for (var i = delete_count - 1; i >= 0; i = i - 1) {
                var delete_id = find_dish.comments[i]._id;
                find_dish.comments.id(delete_id).remove();
            }
            find_dish.save(function(save_error, save_dish) {
                // response.writeHead(200, { 'Content-Type': 'text/plain' });
                // response.end('Deleted all comments!');
                response.json({dish_id : find_dish.dish_id, delete_comment_count : delete_count });
            });
        }
    });
}

function get_one_comment(request, response, next)
{ // GET /:dishId/comments/:commentId
    var dish_id = request.params.dishId;
    var comment_id = request.params.commentId;
    Dish.findOne({ dish_id : dish_id })
    .populate({
        path: "comments",
        model: 'Comment',
        populate: {
            path: 'postedBy',
            model: 'User'
        }
    })
    .exec(function (err, dish_with_comments) {
        if (err) throw err;
        var comment = dish_with_comments.comments.length[comment_id];
        response.json(comment);
        console.log(comment);
    });
}

function update_one_comment(request, response, next)
{ // PUT /:dishId/comments/:commentId
    var dish_id = request.params.dishId
    var comment_id = request.params.commentId;
    var user_id = request.decoded._doc._id;
    request.body.postedBy = user_id;

    console.log(1, "dish_id", dish_id, "comment_id", comment_id);
    Dish.findOne({dish_id:dish_id}, function(find_error, find_dish) {
        if (find_error || (find_dish.comments.length < comment_id)) { throw find_error; }
        var find_comment = find_dish.comments
                           .filter(function(comment) {
                               return (comment.id == comment_id);
                           });
        if (find_comment) {
            find_comment.comment = request.body;
            find_dish.save(function(save_error, save_dish) {
                if (save_error) { throw save_error; }
                console.log(4, save_dish);
                response.json(save_dish);
            });
        }
    });
}

function remove_one_comment(request, response, next)
{ // DELETE /:dishId/comments/:commentId
    var dish_id = request.params.dishId
    var comment_id = request.params.commentId;
    var user_id = request.decoded._doc._id;
    request.body.postedBy = user_id;

    console.log(1, "dish_id", dish_id, "comment_id", comment_id);
    Dish.findOne({dish_id:dish_id}, function(find_error, find_dish) {
        if (find_error || (find_dish.comments.length < comment_id)) { throw find_error; }
        var remained_comments = find_dish.comments
                                .filter(function(comment) {
                                    return (comment.id != comment_id);
                                });
        if (remained_comments.length < find_dish.comments.length) { 
            find_dish.comments = remained_comments;
            find_dish.save(function(save_error, save_dish) {
                if (save_error) { throw save_error; }
                console.log(4, save_dish);
                response.json(save_dish);
            });
        }
    });

}