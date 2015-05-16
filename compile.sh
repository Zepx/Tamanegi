#!/bin/bash

if pgrep "mongod" > /dev/null
then
    echo "Not running"
else
    echo "Starting mongodb..."
    mongod --dbpath ~/js/db --fork --syslog
fi

function durl {
    curl -b data/cookies -c data/cookies "$@"
}

function reloadFirefox {
    if [[ ! -f data ]]
    then
        mkdir data
    fi

    if [[ -f data/cookies ]]
    then
        rm data/cookies
    fi

    sleep 1
    # echo "Reloading firefox..."
    # ./telnet.sh | telnet 10.0.2.2 4242 > /dev/null
    curl http://localhost:3000/setup
    echo -e "\nSetup done\n"

    echo "Login..."
    durl -s --data "username=filip&password=pwd" http://localhost:3000/login > /dev/null

    questions=`durl -s http://localhost:3000/dash`
    echo $questions
    q1=`echo $questions | sed 's/.*questions\([^,]*\).*/\1/g' | grep -o "[0-9a-z]*"`
    durl "http://localhost:3000/question?id="$q1
    q2=`echo $questions | sed 's/.*questions[^,]*,\([^,]*\).*/\1/g' | grep -o "[0-9a-z]*"`
    durl "http://localhost:3000/question?id="$q2
    durl --data "" "http://localhost:3000/give_up?id="$q1
    durl --data "" "http://localhost:3000/give_up?id="$q2
    durl -H "Content-Type: application/json" --data '{"answer_text":"Answer2"}' "http://localhost:3000/answer?id="$q1
    durl -H "Content-Type: application/json" --data '{"answer_text":"Answer3"}' "http://localhost:3000/answer?id="$q2

    test=`durl -s "http://localhost:3000/tests" | sed 's/.*"\([0-9a-z]*\)".*:.*/\1/g'`
    user=`durl -s "http://localhost:3000/users" | sed 's/.*"\([0-9a-z]*\)".*:.*/\1/g'`
    group=`durl -s "http://localhost:3000/groups" | sed 's/.*"\([0-9a-z]*\)".*:.*/\1/g'`
    durl "http://localhost:3000/result?for="$user"&test="$test
    durl "http://localhost:3000/result?group="$group"&test="$test

    q='[{"text":"Question #1"}, {"text":"Question #2"}, {"text":"Question #3"}]';
    testData='{"type":"test", "title":"From JSON", "group":"'$group'", "due":"2015-05-17 18:30:00", "teacher":"'$user'", "questions":'$q'}';
    echo $testData;
    newTest=`durl -s -H "Content-Type: application/json" --data "$testData" "http://localhost:3000/create"`
    newTest=`echo $newTest | sed 's/.*id.*"\([0-9a-z]*\)".*/\1/g'`
    durl "http://localhost:3000/dash"
    
    echo -e "\nDone!"
}

echo "Restarting..."
reloadFirefox &
npm start
echo "Up!"

