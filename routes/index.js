var express = require('express');
var router = express.Router();
var db = require('../data');
var User = require('../models/user')
var passport = require('passport');

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
	User.findOne({name: token}, function (err, user) {
	    if (!user || err)
		notSignedIn(res);
	    else
		fn(user, req, res);
	});
    }
}

function withQuestion(fn) {
    return withUser(function (user, req, res) {
	/* Check access! */
	db.Question.findOne({_id: req.query.id}, function(error, question) {
	    fn(user, question, req, res);
	});
    });
}

/* GET home page. */
router.get('/', function(req, res, next) {
     res.render('index', { user : req.user });
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

router.get('/question', withQuestion(function(user, question, req, res) {
    res.json(question.asJson(user));
}));

router.post('/give_up', withQuestion(function(user, question, req, res) {
    question.giveUp(user);
    res.json(question.asJson(user));
}));

router.post('/answer', withQuestion(function(user, question, req, res) {
    var answer = req.body['answer_text'];
    if (answer === undefined) {
	res.json({error: "No answer_text, use Content-Type: application/json!"});
	return;
    }

    question.answer(user, answer);
    res.json(question.asJson(user));
}));

/* Debug route, sets up a basic system for testing! */
router.get('/setup', function(req, res) {
    db.Group.remove({}, function(err) {});
    User.remove({}, function(err) {});
    db.Test.remove({}, function(err) {});
    db.Question.remove({}, function(err) {});
    

    var q1 = new db.Question({text: "Question 1: Why?"});
    q1.save();

    var q2 = new db.Question({text: "Question 2: Why were you right before?"});
    q2.save();

    var test = new db.Test({title: "Test 1", questions_id: [q1._id, q2._id], due: "2015-05-17 19:00:00"});
    test.save();

    var group = new db.Group({title: "class A", tests_id: [test.id]});
    group.save();

    //var user = new User({username: 'filip', name: "filip", password: 'filip', group_id: group.id});
    User.register(new User({ username: 'filip', name: 'Filip Stromback'}), 'filip', function(err, account) {
       var user = User.findByUsername('filip');
       q1.answers.push({text: "Answer 1", group_id: group._id, user_id: user._id});
       q1.save();

       res.send("OK");
       console.log("Setup complete!");
    });
    
    
});

router.get('/register', function(req, res) {
    res.render('register', { });
});

router.post('/register', function(req, res) {
    User.register(new User({ username : req.body.username }), req.body.password, function(err, account) {
        if (err) {
          return res.render("register", {info: "Sorry. That username already exists. Try again."});
        }

        passport.authenticate('local')(req, res, function () {
            res.redirect('/');
        });
    });
});

router.get('/login', function(req, res) {
    res.render('login', { user : req.user });
});

router.post('/login', passport.authenticate('local'), function(req, res) {
    res.redirect('/');
});

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

router.get('/ping', function(req, res){
    res.status(200).send("pong!");
});

module.exports = router;
