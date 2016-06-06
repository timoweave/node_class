/*global  */
var body_parser = require('body-parser');
var passport = require('passport');
var verify_user = require('../lib/verify').verifyOrdinaryUser;
var verify_admin = require('../lib/verify').verifyAdmin;
var sign_token = require('../lib/verify').getToken;
var colors = require('colors');

var express = require('express');
var router = express.Router()
             .use(body_parser.json())
             .use(body_parser.urlencoded({ extended: false }));

module.exports = router;

var crud = require('../lib/crud');
var User = require('../models/users');

var login_routes = router.route("/login")
                   .post(login_user);

var logout_routes = router.route("/logout")
                    .get(verify_user, logout_user);

var register_routes = router.route("/register")
                      .post(register_user);

var one_routes = router.route("/:id(\\d+)")
                 .all(verify_user)
                 .get(verify_admin, crud.get_one(User, "User", "user_id"))
                 .put(verify_admin, crud.update_one(User, "User", "user_id"))
                 .post(verify_admin, crud.cannot_do_it(User, "User"))
                 .delete(verify_admin, crud.remove_one(User, "User", "user_id"));

var all_routes = router.route("/")
                 .all(verify_user)
                 .get(verify_admin, crud.get_all(User, "User"))
                 .put(verify_admin, crud.cannot_do_it(User, "User"))
                 .post(register_user)
                 .delete(verify_admin, crud.remove_all(User, "User"));

function logout_user(request, response)
{ // logout user
    request.logout();
    // response.status(200).json({ status: 'Bye!' });
    var data = { status: 'Bye!' };
    response.json(data);
}

function login_user(request, response, next)
{ // POST /login  (with username, password)
    console.log("login user... ??");

    passport.authenticate('local', check_user)(request, response, next);

    function check_user(err, user, info) {
        console.log("passport verifies user...");
        if (err) {
            next(err);
            return;
        }
        if (!user) {
            // return response.status(401).json({ err: info });
            var data = { err: info };
            response.json(data);
            return;
        }
        request.logIn(user, function(err) {
            if (err) {
                // return response.status(500).json({ err: 'Could not log in user' });
                var data = { err: 'Could not log in user' };
                response.json(data);
                return;
            }
            
            var token = sign_token(user);
            var data = { status: 'Login successful!', success: true, token: token };
            // response.status(200).json(data);
            response.json(data);
        });
    }
}

function oauth_user(request, response)
{ // oauth user from other social site

}

function register_user(request, response, next)
{
    var newbie = new User({ username : request.body.username });
    User.schema.eachPath(function(attr) {
        if (attr.toString() in request.body) {
            newbie[attr] = request.body[attr];
        }
    });

    User.register(newbie, request.body.password, add_user);

    function add_user(err, user)
    {
        if (err) {
            // return response.status(500).json({err: err});
            var data = {err: err};
            response.json(data);
            return;
        }

        passport.authenticate('local')(request, response, function () {
            // return response.status(200).json({status: 'Registration Successful!'});
            var category = (newbie.admin) ? "admin": "normal";
            var data = { "status" : "Registration "  + category + " Successful!" };
            response.json(data);
            console.log(colors.green("add"), " : \n", user);
            return;
        });
    }
}
