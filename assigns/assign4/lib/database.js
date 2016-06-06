
// ODM -> database
module.exports = {
    connect_database : connect_database,
    connect : connect_middleware
};

function connect_middleware(mongodb_host, mongodb_doc)
{
    var db_connection = undefined;
    if (db_connection) {
        // TBD: remove middleware (1. using closure variable as a connection-flag)
        next();
    }

    return route_database_middleware;

    function route_database_middleware(request, response, next) {
        var mongoose = require("mongoose");

        var mongoose_connect = mongoose.connect(mongodb_host + "/" + mongodb_doc);
        
        mongoose_connect.connection.on("error", error_connection);
        mongoose_connect.connection.once("open", live_connection);

        next();

        function error_connection()
        {
            var colors = require('colors');
            console.error.bind(console, colors.red('connection error:'));
            // TBD: try again
        }

        function live_connection()
        {
            var colors = require('colors');
            console.log(colors.green("OK"), "mongodb ", mongodb_host);
            db_connection = mongoose_connect.connection;
            // TBD: remove middleware (2. ideal place, right after successful connection)
        }
    }
}

function connect_database(mongodb_host, mongodb_doc)
{ // TBD : singleton???
    var mongoose = require("mongoose");

    var connect = mongoose.connect(mongodb_host + "/" + mongodb_doc);
    var db_connection = connect.connection;
    
    db_connection.on("error", show_error);
    db_connection.once("open", show_live);

    return db_connection;


    function show_error()
    {
        var colors = require('colors');
        console.error.bind(console, colors.red('connection error:'));
    }

    function show_live()
    {
        var colors = require('colors');
        console.log(colors.green("OK"), "mongodb ", mongodb_host);
    }
}

