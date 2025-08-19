#!/bin/bash
LOCK_FILE=./runner.lock
PID_FILE=./runner.pid

lock_acquired=false

for i in {1..60}; do
    if ln -s "$$" "$LOCK_FILE" 2>/dev/null; then
        lock_acquired=true
        break
    else
        echo "Another process running, waiting..."
        sleep 5
    fi
done

if ! $lock_acquired; then
    echo "Timeout waiting for lock! Exiting."
    exit 1
fi

echo "$$" > "$PID_FILE"

cleanup() {
    echo "Cleaning up..."
    rm -f "$LOCK_FILE" "$PID_FILE"
    pkill -P $$
}
trap cleanup EXIT HUP INT TERM

node ./runner.mjs
EXIT_CODE=$?

exit $EXIT_CODE
