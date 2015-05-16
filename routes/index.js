var express = require('express');
var router = express.Router();
var db = require('../data');
var User = require('../models/user')
var passport = require('passport');

function notSignedIn(res) {
    res.status(500).json({error: "Not signed in!"});
}

function signedIn(req, res) {
    if (req.user === undefined) {
        notSignedIn(res);
        return false;
    }
    return true;
}

function withUser(fn) {
    return function(req, res) {
	if (!signedIn(req, res))
	    return;

        fn(req.user, req, res);
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
     res.render('index', { user : req.user });
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

router.get('/tests', withUser(function(user, req, res) {
    var q = {};
    if (req.query.group !== undefined)
        q = {_id: req.query.group};
    else if (req.query.teacher !== undefined)
        q = {teacher_id: req.query.teacher};

    db.Test.find(q, function(error, tests) {
        var result = {};
        for (var i = 0; i < tests.length; i++) {
            var test = tests[i];
            result[test._id] = test.title;
        }
        res.json(result);
    });
}));

router.get('/users', withUser(function(u, req, res) {
    var q = {};
    if (req.query.group !== undefined)
        q = {_id: req.query.group};

    User.find(q, function(error, users) {
        var result = {};
        for (var i = 0; i < users.length; i++) {
            var user = users[i];
            result[user._id] = user.name;
        }
        res.json(result);
    });
}));

router.get('/dash', withUser(function(user, req, res) {
    db.testsFor(user, function(tests) {
        var r = {};
        for (test in tests) {
            t = tests[test];
            r[t._id] = t.asJson();
        }
        res.json(r);
    });
}));

router.post('/create', withUser(function(user, req, res) {
    var body = req.body;
    if (body.type == "group") {
        createGroup(body, res)
    } else if (body.type == "user") {
        createUser(body, res);
    } else if (body.type == "test") {
        createTest(body, res);
    } else {
        res.json({error: "Unknown type"});
    }
}));

function createGroup(body, res) {
    var g = new db.Group({name: body.name});
    g.save();
    res.json({status: "ok", id : g._id });
}

function createUser(body, res) {
    var p = { username: body.username, name: body.name, group_id: body.group, teacher: body.teacher};
    User.register(new User(p), body.password, function(err, account) {
        if (err !== undefined)
            res.json({status: "failed"});
        else
            res.json({status: "ok", id: account._id });
    });
}

function createTest(body, res) {
    db.Group.findOne({_id: body.group}, function(error, group) {
        var questions = [];
        for (var i = 0; i < body.questions.length; i++) {
            var q = body.questions[i];
            var created = new db.Question({text: q.text, answers:[]});
            created.save();
            questions.push(created);
        }

        var test = new db.Test({title: body.title, questions_id: questions, due: body.due, teacher_id: body.teacher});
        test.save();

        group.tests_id.push(test._id);
        group.save();

        res.json({status: "ok", id: test._id});
    });
}

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
    User.find(q, function(error, forUsers) {
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
    User.remove({}, function(err) {});
    db.Test.remove({}, function(err) {});
    db.Question.remove({}, function(err) {});
    

    var q1 = new db.Question({text: "Example question 1"});
    q1.save();

    var q2 = new db.Question({text: "Example question 2"});
    q2.save();

    var test = new db.Test({title: "Test 1", questions_id: [q1._id, q2._id], due: "2015-05-17 19:00:00"});
    test.save();

    var group = new db.Group({name: "class A", tests_id: [test.id]});
    group.save();

    User.register(new User({ username: 'test', name: 'Test User', group_id: group._id, teacher:true}), 'pwd', function(err, account) {
        var user = User.findByUsername('test');

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
