var mongoose = require("mongoose");
var Currency = (function define_mongoose_currency(mongoose) {
                    var mongoose_currency = require("mongoose-currency");
                    mongoose_currency.loadType(mongoose);
                    return mongoose.Types.Currency;
                })(mongoose);

var promotionSchema = new mongoose.Schema({
    name: String,
    image: String,
    label:  { type : String, default : "" },
    price: Currency,
    description: String
});

(function add_plugins(){
    var promotion_seq = require("mongoose-sequence");
    promotionSchema.plugin(promotion_seq, {inc_field: "promotion_id"});
})();

module.exports = mongoose.model("Promotion", promotionSchema);
