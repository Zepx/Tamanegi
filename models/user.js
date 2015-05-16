var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

var User = new Schema({
    name: String,
    username: String,
    teacher: {type: Boolean, default: false }, /* Teacher? Teacher may create tests and so on... */
    group_id: ObjectId, /* Reference to Group object */
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);
