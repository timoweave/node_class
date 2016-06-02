
var mongoose = require("mongoose");

var leadershipSchema = new mongoose.Schema({
    name: String,
    image: String,
    designation: String,
    abbr: String,
    description: String
});

var leadership_seq = require("mongoose-sequence");
leadershipSchema.plugin(leadership_seq, {inc_field: "leadership_id"});

module.exports = mongoose.model("Leadership", leadershipSchema);
