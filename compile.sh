#!/bin/bash

if pgrep "mongod" > /dev/null
then
    echo "Not running"
else
    echo "Starting mongodb..."
    mongod --dbpath ~/js/db --fork --syslog
fi

function reloadFirefox {
    if [[ ! -f data ]]
    then
        mkdir data
    fi

    sleep 1
    # echo "Reloading firefox..."
    # ./telnet.sh | telnet 10.0.2.2 4242 > /dev/null
    curl http://localhost:3000/setup
    echo -e "\nSetup done\n"

    echo "Login..."
    # curl -s -b data/cookies -c data/cookies -D "username=filip&password=pwd" http://localhost:3000/login > /dev/null

    questions=`curl -s http://localhost:3000/dash?user=filip`
    echo $questions
    q1=`echo $questions | sed 's/.*questions\([^,]*\).*/\1/g' | grep -o "[0-9a-z]*"`
    curl "http://localhost:3000/question?user=filip&id="$q1
    q2=`echo $questions | sed 's/.*questions[^,]*,\([^,]*\).*/\1/g' | grep -o "[0-9a-z]*"`
    curl "http://localhost:3000/question?user=filip&id="$q2
    curl --data "" "http://localhost:3000/give_up?user=filip&id="$q1
    curl --data "" "http://localhost:3000/give_up?user=filip&id="$q2
    curl -H "Content-Type: application/json" --data '{"answer_text":"Answer2"}' "http://localhost:3000/answer?user=filip&id="$q1
    curl -H "Content-Type: application/json" --data '{"answer_text":"Answer3"}' "http://localhost:3000/answer?user=filip&id="$q2

    test=`curl -s "http://localhost:3000/tests?user=filip" | sed 's/.*"\([0-9a-z]*\)".*:.*/\1/g'`
    user=`curl -s "http://localhost:3000/users?user=filip" | sed 's/.*"\([0-9a-z]*\)".*:.*/\1/g'`
    group=`curl -s "http://localhost:3000/groups?user=filip" | sed 's/.*"\([0-9a-z]*\)".*:.*/\1/g'`
    curl "http://localhost:3000/result?user=filip&for="$user"&test="$test
    curl "http://localhost:3000/result?user=filip&group="$group"&test="$test
    echo -e "\nDone!"
}

echo "Restarting..."
reloadFirefox &
npm start
echo "Up!"

