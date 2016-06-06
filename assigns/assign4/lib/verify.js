var User = require('../models/users.js');
var jwt = require('jsonwebtoken');
var config = require('../config');
var colors = require('colors');

// HTTP -> user/password

module.exports = {
    authenticate_basic : check_authenticate_basic,
    authenticate_cookie : check_authenticate_cookie,
    authenticate_session : check_authenticate_session,
    authenitcate_oauth : check_authenticate_oauth,
    authenticate_error_handler : challenge_authenticate,
    getToken : get_token,
    verifyOrdinaryUser : verify_user,
    verifyRoot : verify_admin,
    verifyAdmin : verify_privilege,
    verifyCommentOwner : verify_comment_owner
};

function check_authenticate_oauth(request, response, next)
{ // 
    
}

function check_authenticate_session(request, response, next)
{ // 
    console.log(colors.yellow("CHECK"), "check session authentication");
    console.log(colors.yellow("request.headers"), request.headers);
    var user = request.session.user;
    if (user) {
        console.log(colors.yellow("SESSION"), request.session);
        var ok = check_session_user(user);
        if (ok)  {
            next();
            return;
        }
    } 

    check_request_authentication(request, response, next, save_user);
    
    function save_user(request, response, auth_usr, auth_passwd)
    {
        request.session.user = auth_usr;
        console.log(colors.yellow("session save user, request.session"), request.session);    
    };
}

function check_authenticate_cookie(request, response, next)
{ // 
    console.log(colors.yellow("CHECK"), "check cookie authentication");
    console.log(colors.yellow("request.headers"), request.headers);
    var user = request.signedCookies.user;
    if (user) {
        console.log(colors.yellow("cookie"), request.signedCookies);
        var ok = check_cookie_user(user);
        if (ok)  {
            next();
            return;
        }
    } 

    check_request_authentication(request, response, next, save_user);
    
    function save_user(request, response, auth_usr, auth_passwd)
    {
        response.cookie("user", auth_usr, {signed : true});
        console.log(colors.yellow("cookie save user, request.signedCookies"), request.signedCookies);
        // NOTE: response.cookie("user") ---> request.signedCookies.user
    };
}

function check_authenticate_basic(request, response, next)
{
    check_request_authentication(request, response, next, null);
}

function check_request_authentication(request, response, next, authorized)
{ // 
    console.log(colors.yellow("CHECK"), "check new request for authentication");
    var auth_header = request.headers.authorization;
    if (!auth_header) {
        console.log(colors.red("NO"), "authentication not found");
        var err = new Error('authenticate data not found!');
        err.status = 401;
        next(err);
        return;
    }
    
    var auth_content = auth_header.split(' ')[1];
    var auth_content_array = new Buffer(auth_content, "base64")
                             .toString().split(':');
    var auth_usr = auth_content_array[0];
    var auth_passwd = auth_content_array[1];

    var ok = check_database_user(auth_usr, auth_passwd);
    if (ok) { // authorized
        if (authorized) {
            authorized(request, response, auth_usr, auth_passwd);
        }
        console.log(colors.green("YES"), request.signedCookies);
        next();
    } else { // not authorized
        console.log(colors.red("NO"), "user/password not found");
        var err = new Error("user/password not found");
        err.status = 401;
        next(err);
    }
}

function check_database_user(user, password)
{  // TBD: from database...
    var ok = (user == 'admin' && password == 'password');
    if (ok) {
        console.log(colors.green("OK"), "verify with database");
        return true;
    } else {
        return false;
    }
}

function check_cookie_user(user)
{  // TBD: from database...
    var ok = (user == 'admin');
    if (ok) {
        console.log(colors.green("OK"), "verify user cookie");
        return true;
    } else {
        console.log(colors.red("NO"), "no user cookie");
        return false;
    }
}

function check_session_user(user)
{  // TBD: from database...
    var ok = (user == 'admin');
    if (ok) {
        console.log(colors.green("OK"), "verify user session");
        return true;
    } else {
        console.log(colors.red("NO"), "no user session");
        return false;
    }
}

function challenge_authenticate(err, request, response, next)
{ // challenge authentication on error (after it fail authentication)

    console.log(colors.yellow("CHALLENGE"), "serve must challenge new authentication");
    var status = err.status || 500;
    var content = { "WWW-Authenticate" : "Basic",
                    "Content-Type" : "text/plain" };
    response.writeHeader(status, content);
    response.end(err.message);
}

function get_token(user)
{ // 
    var option = { expiresIn : 3600 };
    var token = jwt.sign(user, config.cookie_secret_key, option);
    return token;
}

function verify_comment_owner(request, response, next)
{ // owner of the comment
    console.log("3. authen verifies comment owner", request); next(); return; // TEST: when testing
}

function verify_user(request, response, next)
{ // ordinary user 
    var token = request.body.token
             || request.params.token
             || request.headers['x-access-token'];

    if (token) {
        jwt.verify(token, config.cookie_secret_key, function (err, decoded) {
            if (err) {
                var err = new Error('You are not authenticated!');
                err.status = 401;
                next(err);
            } else {
                // if everything is good, save to request for use in other routes
                request.decoded = decoded;
                next();
            }
        });
    } else {
        var err = new Error('No token provided!');
        err.status = 403;
        next(err);
    }
}

function verify_privilege (request, response, next)
{ // 
    if (request.decoded && request.decoded._doc && request.decoded._doc.admin)  {
        next();
    } else {
        var err = new Error('You are not a privilege admin!, not allow for this operation');
        err.status = 403;
        next(err);
    }
}

function verify_admin(request, response, next)
{ //
    console.log("2'. authen verifies admin"); next(); return; // TEST: when testing
    
    var token = request.body.token
             || request.params.token
             || request.headers['x-access-token'];

    if (token) {
        jwt.verify(token, config.cookie_secret_key, function (err, decoded) {
            if (err) {
                var err = new Error('You are not authenticated!');
                err.status = 401;
                next(err);
            } else if (decoded._doc.admin === false) {
                var err = new Error('You are not an admin user!');
                err.status = 401;
                next(err);
            } else {
                // if everything is good, save to request for use in other routes
                // console.log("token decoded:\n", decoded);
                request.decoded = decoded;
                next();
            }
        });
    } else {
        var err = new Error('No token provided!');
        err.status = 403;
        next(err);
    }
}
