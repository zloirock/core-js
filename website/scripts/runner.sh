#!/bin/bash
LOCK_FILE=./runner.lock
PID_FILE=./runner.pid

kill_old_build() {
    if [ -f "$PID_FILE" ]; then
        OLD_PID=$(cat "$PID_FILE")
        if ps -p "$OLD_PID" > /dev/null 2>&1; then
            kill "$OLD_PID"
            echo "Previous build $OLD_PID in progress. Terminating..."
            sleep 2
            if ps -p "$OLD_PID" > /dev/null 2>&1; then
                kill -9 "$OLD_PID"
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

echo "$$" > "$PID_FILE"

cleanup() {
    echo "Cleaning up..."
    rm -f "$LOCK_FILE" "$PID_FILE"
    pkill -P $$
}
trap cleanup EXIT HUP INT TERM

echo "Lock acquired by $$, starting build..."

node ./runner.mjs
EXIT_CODE=$?

exit $EXIT_CODE
