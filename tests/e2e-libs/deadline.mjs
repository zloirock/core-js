import { fork } from 'node:child_process';

export class ChildExerciseError extends Error {
  name = 'ChildExerciseError';
}

// The watchdog runs in the caller, so an exercise cannot block it. Terminate the child even
// after a success: it can leave timers or native handles behind.
export async function runWithDeadline(module, method, args, { ms, what }) {
  const child = fork(new URL('./deadline-child.mjs', import.meta.url), {
    execArgv: [],
    stdio: ['ignore', 'inherit', 'inherit', 'ipc'],
  });
  const closed = new Promise(resolve => child.once('close', resolve));
  let timer;
  try {
    return await new Promise((resolve, reject) => {
      function arm() {
        clearTimeout(timer);
        timer = setTimeout(() => reject(new Error(`${ what } did not finish within ${ ms }ms`)), ms);
      }

      arm();
      child.on('message', message => {
        // An exercise can also use process.send(). Only the driver's messages settle the run.
        switch (message?.type) {
          case 'e2e-libs:repeat': arm(); break;
          case 'e2e-libs:failure': reject(new ChildExerciseError(message.error)); break;
          case 'e2e-libs:result': resolve(message.result); break;
        }
      });
      child.once('error', reject);
      child.once('close', (code, signal) => reject(new Error(`${ what } exited with ${ signal ?? `code ${ code }` } without a result`)));
      child.send({ module, method, args }, error => { if (error) reject(error); });
    });
  } finally {
    clearTimeout(timer);
    if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL');
    await closed;
  }
}
