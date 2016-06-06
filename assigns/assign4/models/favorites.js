var mongoose = require("mongoose");
var Dish = require("./dishes").Dish;
var User = require("./users");

var favoriteSchema = new mongoose.Schema({
    postedBy : { type : mongoose.Schema.Types.ObjectId, ref : "User" },
    dishes : [ { type : mongoose.Schema.Types.ObjectId, ref : "Dish" } ]
}, {timestamps : true});

(function add_plugins(){
    var favorite_seq = require("mongoose-sequence");
    favoriteSchema.plugin(favorite_seq, {inc_field: "favorite_id"});
})();

var Favorite  = mongoose.model("Favorite", favoriteSchema);
module.exports = Favorite;