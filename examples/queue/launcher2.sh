#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
CONSUMER="$DIR/consumer.js"

# Check the operating system and open terminals accordingly
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    osascript -e "tell app \"Terminal\" to do script \"node $CONSUMER\""
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    gnome-terminal -- bash -c "node $CONSUMER; exec bash"
else
    echo "OS not supported"
fi
