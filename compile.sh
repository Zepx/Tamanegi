#!/bin/bash

if pgrep "mongod"
then
    :
else
    echo "Starting mongodb..."
    mongod --dbpath ~/js/db --fork --syslog
fi

echo "Killing node..."
pgrep "node" | xargs kill
echo "Restarting..."
npm start bin/www &
echo "Up!"

sleep 1
echo "Reloading firefox..."
./telnet.sh | telnet 10.0.2.2 4242 > /dev/null
