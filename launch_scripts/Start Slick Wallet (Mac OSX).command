#!/bin/bash
cd "$(dirname "$BASH_SOURCE")" || {
    echo "Error getting script directory" >&2
    exit 1
}
open -n ./slick_wallet/node-webkit-v0.9.2-osx-ia32/node-webkit.app --args "$(dirname "$BASH_SOURCE")/slick_wallet/nwslick" &
disown
kill -9 $(ps -p $(ps -p $PPID -o ppid=) -o ppid=) 
