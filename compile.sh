#!/bin/bash

if pgrep "mongod" > /dev/null
then
    echo "Not running"
else
    echo "Starting mongodb..."
    mongod --dbpath ~/js/db --fork --syslog
fi

function reloadFirefox {
    sleep 1
    # echo "Reloading firefox..."
    # ./telnet.sh | telnet 10.0.2.2 4242 > /dev/null
    curl http://localhost:3000/setup
    echo -e "\nSetup done\n"
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
    echo -e "\nDone!"
}

echo "Restarting..."
reloadFirefox &
npm start
echo "Up!"

