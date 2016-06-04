var express = require('express');

var body_parser = require('body-parser');
var authen = require('../lib/verify');

var router = express.Router()
             .use(body_parser.json())
             .use(body_parser.urlencoded({ extended: false }))
             .use(authen.verifyOrdinaryUser);

var crud = require('../lib/crud');
var Promotion = require('../models/promotions');

var all_routes = router.route("/")
                 .get(crud.get_all(Promotion, "Promotion"))
                 .put(authen.verifyAdmin, crud.cannot_do_it(Promotion, "Promotion"))
                 .post(authen.verifyAdmin, crud.create_one(Promotion, "Promotion"))
                 .delete(authen.verifyAdmin, crud.remove_all(Promotion, "Promotion"));

var one_routes = router.route("/:id(\\d+)")
                 .get(crud.get_one(Promotion, "Promotion", "promotion_id"))
                 .put(authen.verifyAdmin, crud.update_one(Promotion, "Promotion", "promotion_id"))
                 .post(authen.verifyAdmin, crud.cannot_do_it(Promotion, "Promotion"))
                 .delete(authen.verifyAdmin, crud.remove_one(Promotion, "Promotion", "promotion_id"));

module.exports = router;

