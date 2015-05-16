var express = require('express');
var router = express.Router();
var db = require('../data.js');

function notSignedIn(res) {
    res.status(500).json({error: "Not signed in!"});
}

function signedIn(req, res) {
    if (!req.query.user) {
	notSignedIn(res);
	return false;
    }

    var token = req.query.user;
    // TODO: Validate token!
    return true;
}

function withUser(fn) {
    return function(req, res) {
	if (!signedIn(req, res))
	    return;

	// Get our user...
	var token = req.query.user;
	db.User.findOne({name: token}, function (err, user) {
	    if (!user || err)
		notSignedIn(res);
	    else
		fn(user, req, res);
	});
    }
}

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.get('/dash', withUser(function(user, req, res) {
    user.tests(function(tests) {
	var r = {};
	for (test in tests) {
	    t = tests[test];
	    r[t._id] = t.asJson();
	}
	res.json(r);
    });
}));

/* Debug route, sets up a basic system for testing! */
router.get('/setup', function(req, res) {
    db.Group.remove({}, function(err) {});
    db.User.remove({}, function(err) {});

    var q1 = new db.Question({title: "Question 1: Why?"});
    q1.save();

    var q2 = new db.Question({title: "Question 2: Why were you right before?"});
    q2.save();

    var test = new db.Test({title: "Test 1", questions_id: [q1._id, q2._id], due: "2015-05-17 19:00:00"});
    test.save();

    var group = new db.Group({title: "class A", tests_id: [test.id]});
    group.save();

    var user = new db.User({name: "filip", groups_id: [group.id]});
    user.save();
    res.send("OK");
    console.log("Setup complete!");
});

module.exports = router;
