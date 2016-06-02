var mongoose = require("mongoose");

var UserSchema = mongoose.Schema({
    username : {type : String },
    password : { type : String },
    email : { type : String },
    phone : { type : String },
    admin : { type : Boolean,  default : false}
});

var passport_local_mongoose = require("passport-local-mongoose");
UserSchema.plugin(passport_local_mongoose);

var user_seq = require("mongoose-sequence");
UserSchema.plugin(user_seq, {inc_field: "user_id"});

module.exports = mongoose.model("User", UserSchema);
