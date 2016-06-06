var config = require("./config");
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var cookie_parser = require('cookie-parser');
var express_session = require('express-session');
var session_store = require('session-file-store')(express_session);
var passport = require('passport');
var PassportStrategy = require('passport-local').Strategy;
var body_parser = require('body-parser');
var authen = require('./lib/verify');
var error = require('./lib/error_handler');

var app = express();
module.exports = app;

def_services(app);

function def_services(app) {
    use_https(app);
    set_view_engine(app);
    app.use(morgan('dev'));
    use_database(app);
    use_parsers(app);
    // use_express_session(app);
    use_passport(app);
    //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
    app.use(express.static(path.join(__dirname, 'public')));
    use_routing(app);
    use_error_handlers(app);
}

function use_https(app) {
    console.log("non-secure http for tesing"); return // TEST: when testing;
    app.all('*', forward_to_https);
    function forward_to_https(request, response, next) {
        if (request.secure) {
            next();
        } else {
            var port = app.get('securePort');
            var protocol = 'https://';
            var url =  protocol + request.hostname + ':' + port + request.url;
            response.redirect(url);
        }
    }
}

function set_view_engine(app) {
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'jade');
}

function use_database(app) {
    var database = require("./lib/database");
    database.connect_database(config.mongodb_site, config.mongodb_database);
    // var db_connection = database.connect(config.mongodb_site, config.mongodb_database);
    // app.use(db_connection);
    
}

function use_parsers(app) { // parsers for body, form, cookie
    app.use(body_parser.json());
    app.use(body_parser.urlencoded({ extended: true }));
    app.use(cookie_parser(config.cookie_sign_key));
}

function use_express_session(app) {
    return; // disable /////////////////////////////////////////////
    app.use(express_session({name : config.session_name,
                             secret : config.cookie_secret_key,
                             saveUninitialized: true,
                             cookie: { maxAge: 1000 },
                             resave : true,
                             store: new session_store()
                            }));
    app.use(authen.authenticate_session);
    app.use(authen.authenticate_error_handler);
}

function use_passport(app) {
    app.use(passport.initialize());

    var User = require('./models/users');
    passport.use(new PassportStrategy(User.authenticate()));
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());
}

function use_routing(app) { 
    app.use('/', require('./routes/index'));
    app.use('/users', require('./routes/users'));
    app.use('/leaderships', require('./routes/leaderships'));
    app.use('/promotions', require('./routes/promotions'));
    app.use('/dishes', require('./routes/dishes'));
    app.use('/favorites', require('./routes/favorites'));
}

function use_error_handlers(app) { // errors
    app.use(error.not_found_handler);
    if (app.get('env') === 'development') {
        app.use(error.dev_handler);
    }
    app.use(error.prod_handler);
}




