var express = require('express');
var body_parser = require('body-parser');
var http = require('http');
var path =  require('path');
var config = require('./config');
var dishes = require('./dishRouter');
var promotions = require('./promoRouter');
var leadership = require('./leaderRouter');
var express_app = express();

express_app.use(body_parser.json());

express_app.use('/dishes', dishes.router);
express_app.use('/promotions', promotions.router);
express_app.use('/leadership', leadership.router);

var express_srv = http.createServer(express_app);

express_srv.listen(config.port, config.host, function() {
    var module_name = path.basename(module.filename);
    var url = "http://" + config.host + ":" + config.port + "/";
    console.log(module_name, "is listerning to ", url);
});

