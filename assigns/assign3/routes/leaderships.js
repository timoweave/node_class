var express = require('express');

var body_parser = require('body-parser');
var authen = require('../lib/verify');

var router = express.Router()
             .use(body_parser.json())
             .use(body_parser.urlencoded({ extended: false }))
             .use(authen.verifyOrdinaryUser);
module.exports = router;

var Leadership = require('../models/leadership');
var crud = require('../lib/crud');

var all_routes = router.route("/")
                 .get(crud.get_all(Leadership, "Leadership"))
                 .put(authen.verifyAdmin, crud.cannot_do_it(Leadership, "Leadership"))
                 .post(authen.verifyAdmin, crud.create_one(Leadership, "Leadership"))
                 .delete(authen.verifyAdmin, crud.remove_all(Leadership, "Leadership"));

var one_routes = router.route("/:id(\\d+)")
                 .get(crud.get_one(Leadership, "Leadership", "leadership_id"))
                 .put(authen.verifyAdmin, crud.update_one(Leadership, "Leadership", "leadership_id"))
                 .post(authen.verifyAdmin, crud.cannot_do_it(Leadership, "Leadership"))
                 .delete(authen.verifyAdmin, crud.remove_one(Leadership, "Leadership", "leadership_id"));



