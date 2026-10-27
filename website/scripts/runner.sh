#!/bin/bash
# a newer build of a target - `latest` or a branch - replaces its running build; builds of other targets wait
# for the lock instead, since they share `builds/` and `bundles/`
LOCK_FILE=./runner.lock
PID_FILE=./runner.pid
# `~` is not allowed in git branch names, so different branches never share a file
if [ -n "$1" ]; then
    PID_FILE="./runner.$(printf '%s' "$1" | tr '/' '~').pid"
fi
# a build takes minutes, so a longer wait means a hung one
LOCK_TIMEOUT=1800

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

kill_old_build() {
    if [ -f "$PID_FILE" ]; then
        OLD_PID=$(cat "$PID_FILE")
        if ps -p "$OLD_PID" > /dev/null 2>&1; then
            kill -TERM -"$OLD_PID"
            echo "Previous build $OLD_PID in progress. Terminating..."
            sleep 2
            if ps -p "$OLD_PID" > /dev/null 2>&1; then
                kill -KILL -"$OLD_PID"
                echo "PID $OLD_PID still alive, sending SIGKILL!"
            fi
        fi
        rm -f "$PID_FILE"
    fi
}

kill_old_build

# the lock is released when this process exits, however it exits, so the lock file is never removed
exec 9> "$LOCK_FILE"
if ! flock -w "$LOCK_TIMEOUT" 9; then
    echo "Another build holds the lock for too long, exit"
    exit 1
fi

CLEANED=0
cleanup() {
    if [ "$CLEANED" -eq 0 ]; then
        CLEANED=1
        echo "Cleaning up from $$"
        if [ -n "$NODE_PID" ]; then
            rm -f "$PID_FILE"
            if ps -p "$NODE_PID" > /dev/null 2>&1; then
                kill -TERM -"$NODE_PID" 2>/dev/null || true
                kill -KILL -"$NODE_PID" 2>/dev/null || true
            fi
        fi
    fi
}

trap cleanup EXIT HUP INT TERM

echo "Lock acquired by $$, starting build..."

# each run brings its own copy of the runner next to this script
setsid node "$(dirname "$0")/runner.mjs" ${1:+"branch=$1"} &
NODE_PID=$!
echo "$NODE_PID" > "$PID_FILE"

wait $NODE_PID
EXIT_CODE=$?

exit $EXIT_CODE
