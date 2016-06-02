var express = require('express');

var body_parser = require('body-parser');
var crud = require("../lib/crud");
var authen = require("../lib/verify");

var router = express.Router()
             .use(body_parser.json())
             .use(body_parser.urlencoded({ extended: false }))
             .use(authen.verifyOrdinaryUser);
module.exports = router;

var Dish = require('../models/dishes');

var all_routes = router.route("/")
                 .get(crud.get_all(Dish, "Dish"))
                 .put(authen.verifyAdmin, crud.cannot_do_it(Dish, "Dish"))
                 .post(authen.verifyAdmin, crud.create_one(Dish, "Dish"))
                 .delete(authen.verifyAdmin, crud.remove_all(Dish, "Dish"));

var one_routes = router.route("/:id")
                 .get(crud.get_one(Dish, "Dish", "dish_id"))
                 .put(authen.verifyAdmin, crud.update_one(Dish, "Dish", "dish_id"))
                 .post(authen.verifyAdmin, crud.cannot_do_it(Dish, "Dish"))
                 .delete(authen.verifyAdmin, crud.remove_one(Dish, "Dish", "dish_id"));

