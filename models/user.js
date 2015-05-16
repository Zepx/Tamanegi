var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

var User = new Schema({
    name: String,
    username: String,
    password: String, /* Plain-text for now... */
    teacher: Boolean, /* Teacher? Teacher may create tests and so on... */
    group_id: ObjectId, /* Reference to Group object */
});

User.methods.tests = function(callback) {
    var q = {_id: this.group_id};
    e.Group.find(q, function (err, result) {
	var tests = [];
	for (i in result)
	    tests = tests.concat(result[i].tests_id);

	var q = {_id: {$in: tests}};
	e.Test.find(q, function (err, result) {
	    callback(result);
	});
    });
}

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);