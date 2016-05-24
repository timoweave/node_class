var body_parser = require('body-parser');
var router = require('express').Router();
var dishes = router.use(body_parser.json());

var one = router.route('/:id');

one.all(function(request, response, next) {
    response.writeHead(200, { 'Content-Type': 'text/plain' });
    next();
});

one.get(function(request, response, next) {
    response.end('1. GET 1 dish '+ request.params.id + '\n');
});

one.put(function(request, response, next) {
    response.end('2. PUT 1 dish '+ request.params.id + '\n');
});

one.delete(function(request, response, next) {
    response.end('3. DELETE 1 dish '+ request.params.id + '\n');
});

var all = router.route('/');

all.all(function(request, response, next) {
    response.writeHead(200, { 'Content-Type': 'text/plain' });    
    next();
});

all.get(function(request, response, next) {
    response.end("1. get all dishes\n");
});

all.post(function(request, response, next) {
    response.end("2. add dishes a new dish\n");
});

all.delete(function(request, response, next) {
    response.end("3. delete all dishes\n");
});

module.exports.router = router;

