// Keep the caller's IPC channel on an event loop the exercise cannot block.
import { fork } from 'node:child_process';

const child = fork(new URL('./deadline-exercise.mjs', import.meta.url), {
  execArgv: [],
  stdio: ['ignore', 'inherit', 'inherit', 'ipc'],
});

process.once('disconnect', () => child.kill('SIGKILL'));
process.once('message', request => { if (child.connected) child.send(request); });
child.on('message', reply => { if (process.connected) process.send(reply, () => { /* The caller can disconnect before the relay completes. */ }); });
child.on('close', (code, signal) => {
  process.exitCode = code ?? 1;
  if (process.connected) process.send({ type: 'e2e-libs:exit', code, signal }, () => {
    if (process.connected) process.disconnect();
  });
});
