#!/bin/bash
# Double-click me to open Ascend in Google Chrome.
# Opens the index.html sitting next to this file — works even if you move the folder.
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
open -a "Google Chrome" "$DIR/index.html"
