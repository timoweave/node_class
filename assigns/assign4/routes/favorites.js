var express = require('express');
var body_parser = require('body-parser');
var authen = require('../lib/verify');
var mongoose = require('mongoose');

var router = express.Router()
             .use(body_parser.json())
             .use(body_parser.urlencoded({extended: false}))
             .use(authen.verifyOrdinaryUser);

module.exports = router;

var Favorite = require('../models/favorites');
var Dish = require('../models/dishes').Dish;
var User = require('../models/users');

var all_favorites = router.route('/')
                    .get(get_user_favorites)
                    .put(function do_nothing(req, res, next) {})
                    .post(add_user_one_favorite)
                    .delete(delete_user_all_favorites);

var one_favorites = router.route('/:id')
                    .get(retrieve_user_one_favorite)
                    .put(function do_nothing(req, res, next) {})
                    .post(function do_nothing(req, res, next) {})
                    .delete(delete_user_one_favorite);

function get_user_favorites(request, response, next)
{ // GET /
    var user_id = request.decoded._doc._id;
    Favorite.findOne({postedBy : user_id })
    .populate({path : "postedBy", model : "User" })
    .populate({path : "dishes",  model : "Dish",
               populate: { path : 'comments', model : "Comment",
                           populate: { path : "postedBuy", model : "User" }} 
              })
    .exec(function(favorite_error, find_favorites) {
        if (favorite_error) { throw favorite_error; }
        response.json(find_favorites);
    });
}

function add_user_one_favorite(request, response, next)
{ // POST /
    var user_id = request.decoded._doc._id;
    var dish_id = request.body.dish_id;

    Favorite.findOne({postedBy : user_id }, function(favorite_error, find_favorite) {
        if (favorite_error) { throw favorite_error; }
        
        Dish.findOne({dish_id : dish_id}, function(find_error, find_dish) {
            if (find_error) { throw find_error; }
            if (find_favorite === null) {
                find_favorite = new Favorite();
                find_favorite.postedBy = user_id;
                find_favorite.dishes = [];
            }

            find_favorite.dishes.push(find_dish._id);
            find_favorite.save(function(err) {
                response.json(find_dish);
            });
        });
    });
}

function delete_user_all_favorites(request, response, next)
{ // DELETE /
    var user_id = request.decoded._doc._id;

    Favorite.findOne({postedBy : user_id }, function(favorite_error, find_favorite) {
        if (favorite_error) { throw favorite_error; }
        find_favorite.remove(function(error) {
            if (error) { throw error; }
            response.json(find_favorite);
        });
    });
}

function get_user_one_favorite(request, response, next)
{ // GET /:id
    var user_id = request.decoded._doc._id;
    var dish_id = request.params.id;

    console.log("user_id", user_id);
    console.log("dish_id", dish_id);

    Favorite.findOne({postedBy : user_id })
    .populate({path : "postedBy", model : "User" })
    .populate({path : "dishes",  model : "Dish",
               populate: { path : 'comments', model : "Comment",
                           populate: { path : "postedBuy", model : "User" }} 
              })
    .exec(function(favorite_error, find_favorite) {
        if (favorite_error) { throw favorite_error; }
        console.log("find_favorite", find_favorite );
        find_favorite.dishes.forEach(function(dish) {
            if (dish_id === dish.dish_id) {
                response.json(dish);
                return;
            }
        });
    });
}

function retrieve_user_one_favorite(request, response, next)
{ // GET /:id
    var user_id = request.decoded._doc._id;
    var dish_id = request.params.id;

    Favorite.findOne({postedBy : user_id })
    .populate({path : "postedBy", model : "User" })
    .populate({path : "dishes",  model : "Dish",
               populate: { path : 'comments', model : "Comment",
                           populate: { path : "postedBuy", model : "User" }} 
              })
    .exec(function(favorite_error, find_favorite) {
        if (favorite_error) { throw favorite_error; }

        var find_dishes = find_favorite.dishes.filter(function(dish) {
                              return (dish.dish_id == dish_id);
                          });
        response.json(find_dishes);
    });

}

function delete_user_one_favorite(request, response, next)
{ // DELETE /:id
    var user_id = request.decoded._doc._id;
    var dish_id = request.params.id;

    Favorite.findOne({postedBy : user_id })
    .populate({path : "postedBy", model : "User" })
    .populate({path : "dishes",  model : "Dish",
               populate: { path : 'comments', model : "Comment",
                           populate: { path : "postedBuy", model : "User" }} 
              })
    .exec(function(favorite_error, find_favorite) {
        if (favorite_error) { throw favorite_error; }

        var find_dishes = find_favorite.dishes.filter(function(dish) {
            return (dish.dish_id != dish_id);
        })
        find_favorite.dishes = find_dishes;
        find_favorite.save(function(error) {
            if (error) { throw error; }
            response.json(find_favorite);            
        });
    });

}

