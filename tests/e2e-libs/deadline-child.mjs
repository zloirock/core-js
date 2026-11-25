// Keep the caller's IPC channel on an event loop the exercise cannot block.
import { fork } from 'node:child_process';

// On POSIX a process group survives the exercise process and can still be stopped.
const windows = process.platform === 'win32';
const child = fork(new URL('./deadline-exercise.mjs', import.meta.url), {
  detached: !windows,
  execArgv: [],
  stdio: ['ignore', 'inherit', 'inherit', 'ipc'],
});

async function stopExercise() {
  if (!child.pid) return;
  try {
    if (windows) {
      const { kill, ps } = await import('zx');
      if (child.exitCode === null && child.signalCode === null) {
        await kill(child.pid, 'SIGKILL');
      } else {
        // Windows retains the creator PID after exit. Stop each surviving branch
        // without sending a signal to the exited process's PID.
        const branches = await ps.tree({ pid: child.pid });
        await Promise.all(branches.map(branch => kill(branch.pid, 'SIGKILL')));
      }
    } else {
      process.kill(-child.pid, 'SIGKILL');
    }
  } catch (error) {
    if (error.code !== 'ESRCH') {
      console.warn(`could not stop the exercise process tree: ${ error.message }`);
      if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL');
    }
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
  process.exitCode = code ?? 1;
  if (process.connected) process.send({ type: 'e2e-libs:exit', code, signal }, () => {
    if (process.connected) process.disconnect();
  });
  return stop();
});
