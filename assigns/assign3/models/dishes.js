var mongoose = require("mongoose");

var Currency = (function define_mongoose_currency(mongoose) {
                     var mongoose_currency = require("mongoose-currency");
                     mongoose_currency.loadType(mongoose);
                     return mongoose.Types.Currency;
                 })(mongoose);

var commentSchema = new mongoose.Schema({
    rating: { type : Number, min : 0, max : 5 },
    comment: String,
    author : String
});

var dishSchema = new mongoose.Schema({
    name : { type : String, default : ""},
    image :  { type : String },
    category : { type : String },
    label : { type : String, default : ""},
    price : Currency,
    description : String,
    comments : [ commentSchema ]
});

(function add_plugins(){
    var comment_seq = require("mongoose-sequence");
    commentSchema.plugin(comment_seq, {inc_field: "comment_id"});
    
    var dish_seq = require("mongoose-sequence");
    dishSchema.plugin(dish_seq, {inc_field: "dish_id"});
})();

module.exports  = mongoose.model("Dish", dishSchema);

