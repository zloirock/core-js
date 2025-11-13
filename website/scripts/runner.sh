#!/bin/bash
LOCK_FILE=./runner.lock
PID_FILE=./runner.pid

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
        rm -f "$LOCK_FILE" "$PID_FILE"
    fi
}

kill_old_build

if ! ln -s "$$" "$LOCK_FILE" 2>/dev/null; then
    echo "Another build still running, exit"
    exit 1
fi

CLEANED=0
cleanup() {
    if [ "$CLEANED" -eq 0 ]; then
        CLEANED=1
        echo "Cleaning up from $$"
        rm -f "$LOCK_FILE" "$PID_FILE"
        if [ -n "$NODE_PID" ] && ps -p "$NODE_PID" > /dev/null 2>&1; then
            kill -TERM -"$NODE_PID" 2>/dev/null || true
            kill -KILL -"$NODE_PID" 2>/dev/null || true
        fi
    fi
}

trap cleanup EXIT HUP INT TERM

echo "Lock acquired by $$, starting build..."

BRANCH_ARG=""
if [ -n "$1" ]; then
  BRANCH_ARG="branch=$1"
fi

if [ -z "$BRANCH_ARG" ]; then
    setsid node ./runner.mjs &
else
    setsid node ./runner.mjs "$BRANCH_ARG" &
fi
NODE_PID=$!
echo "$NODE_PID" > "$PID_FILE"

wait $NODE_PID
EXIT_CODE=$?

exit $EXIT_CODE
