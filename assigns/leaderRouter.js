var body_parser = require('body-parser');
var router = require('express').Router();
var leaderships = router.use(body_parser.json());

var one = router.route('/:id');

one.all(function(request, response, next) {
    response.writeHead(200, { 'Content-Type': 'text/plain' });
    next();
});

one.get(function(request, response, next) {
    response.end('1. GET 1 leadership '+ request.params.id + '\n');
});

one.put(function(request, response, next) {
    response.end('2. PUT 1 leadership '+ request.params.id + '\n');
});

one.post(function(request, response, next) {
    response.end('2. POST 1 leadership '+ request.params.id + '??, please donnot\n');
});

one.delete(function(request, response, next) {
    response.end('3. DELETE 1 leadership '+ request.params.id + '\n');
});

var all = router.route('/');

all.all(function(request, response, next) {
    response.writeHead(200, { 'Content-Type': 'text/plain' });    
    next();
});

all.get(function(request, response, next) {
    response.end("1. get all leaderships\n");
});

all.put(function(request, response, next) {
    response.end("2. update leaderships all leadership???? please, donnot\n");
});

all.post(function(request, response, next) {
    response.end("2. add leaderships a new leadership\n");
});

all.delete(function(request, response, next) {
    response.end("3. delete all leaderships\n");
});

module.exports.router = router;

