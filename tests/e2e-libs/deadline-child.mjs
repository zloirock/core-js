// Keep the caller's IPC channel on an event loop the exercise cannot block.
import { execFile, fork } from 'node:child_process';
import { promisify } from 'node:util';
import { ps } from 'zx';

// On POSIX a process group survives the exercise process and can still be stopped.
const windows = process.platform === 'win32';
const child = fork(new URL('./deadline-exercise.mjs', import.meta.url), {
  detached: !windows,
  execArgv: [],
  stdio: ['ignore', 'inherit', 'inherit', 'ipc'],
});

function killPid(pid) {
  try {
    process.kill(pid, 'SIGKILL');
  } catch (error) {
    if (error.code !== 'ESRCH') throw error;
  }
}

async function stopWindowsTree(pid) {
  try {
    await promisify(execFile)('taskkill', ['/pid', String(pid), '/t', '/f']);
    return true;
  } catch (error) {
    try {
      process.kill(pid, 0);
    } catch (probeError) {
      if (probeError.code === 'ESRCH') return false;
    }
    throw error;
  }
}

async function stopExercise() {
  if (!child.pid) return;
  const running = child.exitCode === null && child.signalCode === null;
  try {
    if (windows) {
      if (running && await stopWindowsTree(child.pid)) return;
      // Windows retains the creator PID after exit. Terminate surviving branches.
      const branches = await ps.tree({ pid: child.pid });
      await Promise.all(branches.map(branch => stopWindowsTree(Number(branch.pid))));
    } else {
      try {
        // A detached descendant leaves the process group. Find it while its parent lives.
        if (running) {
          const descendants = await ps.tree({ pid: child.pid, recursive: true });
          for (const descendant of descendants.reverse()) killPid(Number(descendant.pid));
        }
      } finally {
        // The group can still exist after its leader has exited.
        killPid(-child.pid);
      }
    }
  } catch (error) {
    process.exitCode = 1;
    console.error(`could not stop the exercise process tree: ${ error.message }`);
    if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL');
  }
}

let stopping;
function stop() {
  return stopping ??= stopExercise();
}

process.once('disconnect', stop);
process.once('message', request => { if (child.connected) child.send(request); });
child.on('message', reply => { if (process.connected) process.send(reply, () => { /* The caller can disconnect before the relay completes. */ }); });
child.on('exit', (code, signal) => {
  // Report the exercise exit before tree cleanup can consume its remaining deadline.
  if (process.connected) process.send({ type: 'e2e-libs:exit', code, signal }, () => {
    if (process.connected) process.disconnect();
  });
  return stop();
});
