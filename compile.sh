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
    curl http://localhost:3000/dash?user=filip
    echo -e "\nDone!\n"
}

echo "Restarting..."
reloadFirefox &
npm start
echo "Up!"

