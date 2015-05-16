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

function withTest(fn) {
    return withUser(function(user, req, res) {
        /* Check access! */
        db.Test.findOne({_id: req.query.test}, function(error, test) {
            fn(user, test, req, res);
        })
    });
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
    res.render('index', { title: 'Express' });
});

router.get('/groups', withUser(function(user, reg, res) {
    db.Group.find({}, function(error, groups) {
        var result = {};
        for (var i = 0; i < groups.length; i++) {
            var group = groups[i];
            result[group._id] = group.name;
        }
        res.json(result);
    });
}));

router.get('/tests', withUser(function(user, reg, res) {
    var q = {};
    if (reg.query.group !== undefined)
        q = {_id: reg.query.group};

    db.Test.find(q, function(error, tests) {
        var result = {};
        for (var i = 0; i < tests.length; i++) {
            var test = tests[i];
            result[test._id] = test.title;
        }
        res.json(result);
    });
}));

router.get('/users', withUser(function(u, reg, res) {
    var q = {};
    if (reg.query.group !== undefined)
        q = {_id: reg.query.group};

    db.User.find(q, function(error, users) {
        var result = {};
        for (var i = 0; i < users.length; i++) {
            var user = users[i];
            result[user._id] = user.name;
        }
        res.json(result);
    });
}));

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

router.get('/result', withTest(function(user, test, req, res) {
    var q = {};
    if (req.query.for !== undefined)
        q = {_id: req.query.for};
    else if (req.query.group !== undefined)
        q = {group_id: req.query.group};

    console.log(q);
    db.User.find(q, function(error, forUsers) {
        db.Question.find({_id: {$in: test.questions_id}}, function(error, questions) {
            var all = {};

            for (var u = 0; u < forUsers.length; u++) {
                var forUser = forUsers[u];
                var answers = [];

                for (var i = 0; i < questions.length; i++) {
                    var q = questions[i];
                    var a = q.answerBy(forUser);
                    if (a !== undefined) {
                        answers.push({
                            question_text: q.text,
                            question_id: q._id,
                            answer: a.text,
                            gave_up: a.gave_up,
                        });
                    }
                }

                all[forUser._id] = answers;
            }
            res.json(all);
        });
    });
}));

/* Debug route, sets up a basic system for testing! */
router.get('/setup', function(req, res) {
    db.Group.remove({}, function(err) {});
    db.User.remove({}, function(err) {});
    db.Test.remove({}, function(err) {});
    db.Question.remove({}, function(err) {});
    

    var q1 = new db.Question({text: "Question 1: Why?"});
    q1.save();

    var q2 = new db.Question({text: "Question 2: Why were you right before?"});
    q2.save();

    var test = new db.Test({title: "Test 1", questions_id: [q1._id, q2._id], due: "2015-05-17 19:00:00"});
    test.save();

    var group = new db.Group({name: "class A", tests_id: [test.id]});
    group.save();

    var user = new db.User({name: "filip", group_id: group.id});
    user.save();

    q1.answers.push({text: "Answer 1", group_id: group._id, user_id: user._id});
    q1.save();

    res.send("OK");
    console.log("Setup complete!");
});

module.exports = router;
