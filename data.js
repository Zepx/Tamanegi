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
    group_id: ObjectId, /* Reference to Group object */
});


userSchema.methods.tests = function(callback) {
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
	questions: this.questions_id,
    }
}

e.Test = mongoose.model('Test', testSchema);

var questionSchema = mongoose.Schema({
    text: String,
    answers: [{
	text: String,
	group_id: ObjectId,
	user_id: ObjectId,
	gave_up: {type: Boolean, default:false },
    }],
});

questionSchema.methods.asJson = function(user) {
    var alternatives = [];
    var our = "";
    var gave_up = false;
    for (var i = 0; i < this.answers.length; i++) {
	var a = this.answers[i];

	if (user.group_id + "" == a.group_id + "")
	    if (a.text != "")
		alternatives.push(a.text);
	if (a.user_id + "" == user._id + "") {
	    our = a.text;
	    gave_up = a.gave_up;
	}
    }

    /* Not allowed to see alternatives too early! */
    if (this.text == "" && !this.gave_up)
	alternatives = [];

    return {
	text: this.text,
	answer: our,
	alternatives: alternatives,
	gave_up: gave_up,
    };
}

questionSchema.methods.giveUp = function(user) {
    for (var i = 0; i < this.answers.length; i++) {
	var a = this.answers[i];
	if (a.user_id + "" == user._id + "") {
	    a.gave_up = true;
	    this.save();
	    return;
	}
    }

    this.answers.push({text: "", user_id: user._id, group_id: user.group_id, gave_up: true});
    this.save();
}

questionSchema.methods.answer = function(user, answer) {
    for (var i = 0; i < this.answers.length; i++) {
	var a = this.answers[i];
	if (a.user_id + "" == user._id + "") {
	    a.text = answer;
	    this.save();
	    return;
	}
    }

    this.answers.push({text: answer, user_id: user._id, group_id: user.group_id, gave_up: false});
    this.save();
}

e.Question = mongoose.model('Question', questionSchema);

module.exports = e;

