var e = {};
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

mongoose.connect('mongodb://localhost/tamanegi');
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
    console.log("DB Connected");
});


var userSchema = mongoose.Schema({
    name: String,
    password: String, /* Plain-text for now... */
    teacher: Boolean, /* Teacher? Teacher may create tests and so on... */
    groups_id: [ObjectId], /* Reference to Group objects */
});


userSchema.methods.tests = function(callback) {
    var q = {_id: {$in: this.groups_id}};
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


e.User = mongoose.model('User', userSchema);


var groupSchema = mongoose.Schema({
    name: String,
    tests_id : [ObjectId],
});

e.Group = mongoose.model('Group', groupSchema);

var testSchema = mongoose.Schema({
    title: String,
    questions_id: [ObjectId],
    due: Date,
    teacher_id: ObjectId, /* Reference to teacher */
});

testSchema.methods.asJson = function() {
    return {
	title: this.title,
	due: this.due,
	teacher: "unknown",
	first_question: this.questions_id[0],
    }
}

e.Test = mongoose.model('Test', testSchema);

var questionSchema = mongoose.Schema({
    text: String,
    answers: [{
	text: String,
	group_id: ObjectId,
	user_id: ObjectId,
    }],
});

e.Question = mongoose.model('Question', questionSchema);

module.exports = e;

