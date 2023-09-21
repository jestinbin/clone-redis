#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SERVER="$DIR/server.js"
CONSUMER="$DIR/consumer.js"
PRODUCER="$DIR/producer.js"

# Check the operating system and open terminals accordingly
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    osascript -e "tell app \"Terminal\" to do script \"node $SERVER\""
    sleep 1
    osascript -e "tell app \"Terminal\" to do script \"node $PRODUCER\""
    osascript -e "tell app \"Terminal\" to do script \"node $CONSUMER\""
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    gnome-terminal -- bash -c "node $SERVER; exec bash"
    sleep 1
    gnome-terminal -- bash -c "node $PRODUCER; exec bash"
    gnome-terminal -- bash -c "node $CONSUMER; exec bash"
else
    echo "OS not supported"
fi
