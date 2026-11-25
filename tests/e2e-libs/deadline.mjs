import { fork } from 'node:child_process';

export const CHILD_STOP_TIMEOUT_MS = 10_000;

export async function waitWithin(promise, timeout) {
  const { promise: deadline, resolve: expire } = Promise.withResolvers();
  const timer = setTimeout(expire, timeout, null);
  try {
    return await Promise.race([promise, deadline]);
  } finally {
    clearTimeout(timer);
  }
}

// A process or its inherited pipes can keep Node alive after the watchdog reports failure.
export function releaseChild(child) {
  if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL');
  for (const stream of child.stdio) stream?.destroy();
  if (child.connected) child.disconnect();
  child.unref();
}

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
  const exited = new Promise(resolve => {
    child.once('exit', () => resolve());
    child.once('error', () => resolve());
  });
  let timer;
  let result;
  let reaped;
  try {
    result = await new Promise((resolve, reject) => {
      function exitError(code, signal) {
        return new Error(`${ what } exited with ${ signal ?? `code ${ code }` } without a result`);
      }
      function arm(budget) {
        clearTimeout(timer);
        timer = setTimeout(() => {
          reject(new Error(`${ what } did not finish within ${ budget }ms`));
        }, budget);
      }

      // Reserve time for Node to load the driver before timing the exercise.
      arm(120_000);
      child.on('message', message => {
        // An exercise can also use process.send(). Only the driver's messages settle the run.
        switch (message?.type) {
          case 'e2e-libs:ready':
          case 'e2e-libs:repeat': arm(ms); break;
          case 'e2e-libs:exit': reject(exitError(message.code, message.signal)); break;
          case 'e2e-libs:failure': reject(new ChildExerciseError(message.error)); break;
          case 'e2e-libs:result': resolve(message.result); break;
        }
      });
      child.once('error', reject);
      child.once('close', (code, signal) => reject(exitError(code, signal)));
      child.send({ module, method, args }, error => { if (error) reject(error); });
    });
  } finally {
    clearTimeout(timer);
    // The supervisor can stop the process tree even when the exercise never yields.
    if (child.connected) child.disconnect();
    reaped = await waitWithin(exited, CHILD_STOP_TIMEOUT_MS) !== null;
    if (!reaped) releaseChild(child);
  }
  if (!reaped) throw new Error(`could not reap the child for ${ what }`);
  return result;
}
