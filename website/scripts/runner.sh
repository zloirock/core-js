#!/bin/bash
# a newer build of a target - `latest` or a branch - replaces its running build; builds of other targets wait
# for the lock instead, since they share `builds/` and `bundles/`
# runners of branches without this version share the server: they create and remove the same lock, a symlink to the
# PID of its holder, and exit while it exists; `runner.pid` stays theirs, they kill the build it names
LOCK_FILE=./runner.lock
# `~` is not allowed in git branch names, so different branches never share a file
PID_FILE="./runner.$(printf '%s' "${1:-latest}" | tr '/' '~').pid"
# a build takes minutes, so a longer wait means a hung one
LOCK_TIMEOUT=1800

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

kill_old_build() {
    if [ -f "$PID_FILE" ]; then
        OLD_PID=$(cat "$PID_FILE")
        # while the old build still holds the lock: once it is stopped, a waiting build may take it and write this file
        rm -f "$PID_FILE"
        if ps -p "$OLD_PID" > /dev/null 2>&1; then
            kill -TERM -"$OLD_PID"
            echo "Previous build $OLD_PID in progress. Terminating..."
            sleep 2
            if ps -p "$OLD_PID" > /dev/null 2>&1; then
                kill -KILL -"$OLD_PID"
                echo "PID $OLD_PID still alive, sending SIGKILL!"
            fi
        fi
    fi
}

kill_old_build

WAITED=0
until ln -s "$$" "$LOCK_FILE" 2>/dev/null; do
    # no lock there: an error of the file system, shown by the second try, unless another build took it meanwhile
    if [ ! -L "$LOCK_FILE" ] && [ ! -e "$LOCK_FILE" ]; then
        ln -s "$$" "$LOCK_FILE" && break
        [ -L "$LOCK_FILE" ] || [ -e "$LOCK_FILE" ] || exit 1
        continue
    fi
    HOLDER=$(readlink "$LOCK_FILE")
    # a holder gone without its cleanup, or the regular lock file of the version that used `flock`
    if [ -z "$HOLDER" ] || ! ps -p "$HOLDER" > /dev/null 2>&1; then
        if [ "$(readlink "$LOCK_FILE")" = "$HOLDER" ]; then
            rm -f "$LOCK_FILE" || exit 1
            echo "Stale lock removed"
        fi
    elif [ "$WAITED" -ge "$LOCK_TIMEOUT" ]; then
        echo "Another build holds the lock for too long, exit"
        exit 1
    else
        [ "$WAITED" -eq 0 ] && echo "Build $HOLDER in progress, waiting..."
        sleep 5
        WAITED=$((WAITED + 5))
    fi
done

CLEANED=0
cleanup() {
    if [ "$CLEANED" -eq 0 ]; then
        CLEANED=1
        if [ -n "$NODE_PID" ]; then
            rm -f "$PID_FILE"
            if ps -p "$NODE_PID" > /dev/null 2>&1; then
                kill -TERM -"$NODE_PID" 2>/dev/null || true
                kill -KILL -"$NODE_PID" 2>/dev/null || true
            fi
        fi
        # after the build is stopped and its PID file is removed, so that a waiting build starts only then
        [ "$(readlink "$LOCK_FILE")" = "$$" ] && rm -f "$LOCK_FILE"
        # the last: a cancelled job closes the output without a signal (ssh runs this without a terminal), and an `echo`
        # into it kills the runner
        echo "Cleaning up from $$"
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
