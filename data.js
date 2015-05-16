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
    groups-id: [ObjectId], /* Reference to Group objects */
});

e.User = mongoose.model('User', userSchema);


var groupSchema = mongoose.Schema({
    name: String,
    members-id: [ObjectId],
});

e.Group = mongoose.model('Group', groupSchema);

var testSchema = mongoose.Schema({
    title: String,
    questions: [ObjectId],
    due: Date,
    teacher-id: ObjectId, /* Reference to teacher */
});

e.Test = mongoose.model('Test', testSchema);

var questionSchema = mongoose.Schema({
    text: String,
    answers: [{
	text: String,
	group-id: ObjectId,
	user-id: ObjectId,
    }],
});

module.exports = e;

