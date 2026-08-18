#!/bin/bash
# Double-click me to run Ascend as an installable app on this computer.
# It serves the folder over http://localhost so the app can be INSTALLED
# (service worker + "Install app" button need http/https — plain file:// can't install).
#
# Once Chrome opens: click the install icon in the address bar (or ⋮ menu →
# "Install Ascend…"), or open the Dashboard tab and tap "Install Ascend as an app."
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORT=8756
cd "$DIR" || exit 1
# open the browser a moment after the server starts
( sleep 1; open -a "Google Chrome" "http://localhost:$PORT/index.html" ) &
echo "Serving Ascend at http://localhost:$PORT  —  close this window (Ctrl-C) to stop."
python3 -m http.server "$PORT"
