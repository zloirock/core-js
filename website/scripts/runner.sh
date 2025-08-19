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
    if [ -n "$NODE_PID" ]; then
        kill "$NODE_PID" 2>/dev/null || true
    fi
}
trap cleanup EXIT HUP INT TERM

node ./runner.mjs &
NODE_PID=$!

wait $NODE_PID
EXIT_CODE=$?

exit $EXIT_CODE
