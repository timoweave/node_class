module.exports = {
    not_found_handler : error_404_handler,
    dev_handler : error_dev_handler,
    prod_handler : error_production_handler
};

function error_404_handler(req, res, next)
{ // catch 404 (not found) and forward to error handler
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
}

function error_dev_handler(err, req, res, next)
{ // development error handler, will print stacktrace
    var status = err.status || 500;
    var problem = {
        message: err.message,
        error: err
    }
    // res.status(status);
    res.json(problem);
    // res.render('error', problem);
    // res.end("\n");
}

function error_production_handler(err, req, res, next)
{ // production error handler, no stacktraces leaked to user
    var status = err.status || 500;
    var problem = {
        message: err.message,
        error: {}
    };
    // res.status(status);
    res.json(problem);
    // res.render('error', problem);
    // res.end("\n");
}
