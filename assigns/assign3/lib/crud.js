// HTTP -> CRUD
module.exports = {

    create_one : create_one,
    get_one : get_one,
    update_one : update_one,
    remove_one : remove_one,

    create_all : do_nothing,
    get_all : get_all,
    update_all : do_nothing,
    remove_all : remove_all,
    
    do_nothing: do_nothing,
    cannot_do_it : cannot_do_it,
    experiment_or_buggy_or_not_ready : experiment_or_buggy_or_not_ready

};

function update_one(Model, model_name, model_id)
{ // CRUD update
    var uniq_id = model_id; // ) | (model_name + "_id");
    return function crud_update_one(request, response, next)
    { // PUT /:id
        var id = request.params.id;
        if (!Number.isInteger(id)) { next(); }

        var criteria = {};
        criteria[uniq_id] = id;
        Model.findOneAndUpdate(criteria, function(err) {
            if (err) { throw err; }
            console.log("update id ", id);
        });
    }
}

function remove_one(Model, model_name, model_id)
{ // CRUD delete
    var uniq_id = model_id; // ) | (model_name + "_id");
    return function remove_one(request, response, next)
    { // DELETE /:id
        var id = request.params.id;
        if (!Number.isInteger(id)) { next(); }

        var criteria = {};
        criteria[uniq_id] = id;
        
        Model.remove(criteria, function(err) {
            if (err) { throw err; }
            console.log("remove id ", id);
        });
    }
}

function get_one(Model, model_name, model_id)
{ // Crud retrieve
    var default_id = model_name + "_id";
    var uniq_id = model_id || default_id;

    return function crud_get_one(request, response, next)
    { // GET /:id
        var id = request.params.id;
        if (!Number.isInteger(id)) { next(); }

        var criteria = {};
        criteria[uniq_id] = id;
        // console.log(uniq_id, model_id, model_name + "_id_");
        console.log(criteria);
        Model.find(criteria, function(find_error, find_model) {
            if (find_error) { throw find_error; }
            // response.setHeader("Content-Type", "application/json")
            response.json(find_model);
            return ;
            // response.json(find_model);
            // console.log("get id ", id);
        });
    }
}

function remove_all(Model, model_name)
{ // CRUD delete
    return function crud_remove_all(request, response, next)
    { // DELETE /
        Model.remove({}, function(error) {
            if (error) { throw error; }
            var data = {"time" : Date.now(),
                        "remove" : model_name };
            response.json(data);
            
        })
    }
}

function create_one(Model, model_name)
{ // CRUD create

    return function create_one_detail(request, response, next)
    { // POST /
        var body = request.body;
        if (body) {
            var colors = require('colors');
            // console.log(colors.yellow("saving"), request.body)
            var model = new Model(request.body);
            model.save(function(error) {
                if (error) { throw error; }
                response.json(model);
                console.log(colors.green("saved"),  model_name + " instance : \n", model);
            });
        }
    }
}

function get_all(Model, model_name)
{ // CRUD retrieve
    return function crud_get_all(request, response, next)
    { // GET /
        // console.log("hello", model_name);
        Model.find({}, function(find_err, find_models) {
            if (find_err) { throw find_err; }
            response.end(JSON.stringify(find_models));
            // response.json(find_models);
        });
    }
}

function do_nothing(Model, model_name)
{ // do nothing
    return function crud_do_nothing(request, response, next)
    {
        console.log("TBD : do_nothing, " + request.url + " (model " + model_name + ")");
    }
}


function cannot_do_it(Model, model_name)
{ // cannot do it
    return function crud_cannot_do_it(request, response, next)
    {
        console.log("TBD : cannot_do_it, " + request.url + " (model " + model_name + ")");
    }
}

function experiment_or_buggy_or_not_ready(Model, model_name)
{ // cannot do it
    return function crud_cannot_do_it(request, response, next)
    {
        console.log("TBD : experiment_or_buggy_or_not_ready, " + request.url + " (model " + model_name + ")");
    }
}
