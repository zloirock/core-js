#!/bin/bash
# a newer build of the full site or of the same branch replaces its running build; builds of other targets wait
# for the lock instead, since they share `builds/` and `bundles/`
# runners of branches without this version share the server: they create and remove the same lock, a symlink to the
# PID of its holder, and exit while it exists; `runner.pid` stays theirs, they kill the build it names
LOCK_FILE=./runner.lock
PID_FILE=./runner-site.pid
if [ -n "$1" ]; then
    # Quote the replacement so Bash keeps the literal `~`, which git forbids in branch names.
    PID_FILE=./runner-branch.${1//\//'~'}.pid
fi
# a build takes minutes, so a longer wait means a hung one
LOCK_TIMEOUT=1800

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

kill_old_build() {
    # Only the lock holder removes its PID file, before releasing the lock in cleanup.
    if OLD_PID=$(cat "$PID_FILE" 2>/dev/null) && ps -p "$OLD_PID" > /dev/null 2>&1 &&
        [ "$(readlink "$LOCK_FILE")" = "$REPLACE_HOLDER" ]; then
        REPLACE_HOLDER=
        kill -TERM -"$OLD_PID"
        echo "Previous build $OLD_PID in progress. Terminating..."
        sleep 2
        if ps -p "$OLD_PID" > /dev/null 2>&1; then
            kill -KILL -"$OLD_PID"
            echo "PID $OLD_PID still alive, sending SIGKILL!"
        fi
    fi
}

# The holder at entry may still be starting its child. Retry once its PID appears under that same lock.
REPLACE_HOLDER=$(readlink "$LOCK_FILE")
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
        [ "$HOLDER" = "$REPLACE_HOLDER" ] && kill_old_build
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
