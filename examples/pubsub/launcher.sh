#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SERVER="$DIR/server.js"
SUBSCRIBER="$DIR/subscriber.js"
PUBLISHER="$DIR/publisher.js"

# Check the operating system and open terminals accordingly
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    osascript -e "tell app \"Terminal\" to do script \"node $SERVER\""
    sleep 1
    osascript -e "tell app \"Terminal\" to do script \"node $PUBLISHER\""
    osascript -e "tell app \"Terminal\" to do script \"node $SUBSCRIBER\""
    osascript -e "tell app \"Terminal\" to do script \"node $SUBSCRIBER\""
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    gnome-terminal -- bash -c "node $SERVER; exec bash"
    sleep 1
    gnome-terminal -- bash -c "node $PUBLISHER; exec bash"
    gnome-terminal -- bash -c "node $SUBSCRIBER; exec bash"
    gnome-terminal -- bash -c "node $SUBSCRIBER; exec bash"
else
    echo "OS not supported"
fi
