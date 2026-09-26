import { Worker } from 'node:worker_threads';

const WORKER = new URL('./global-leg-worker.mjs', import.meta.url);

// run an already-written module file in a fresh stripped worker realm; resolves to its runtimeKey.
// a worker-level crash (strip canary, loader failure) or a silent exit resolves to a sentinel that
// can never equal a native reference, so it surfaces as a loud failure instead of a skip
export function runInWorker(file, options = {}) {
  return new Promise(resolve => {
    const worker = new Worker(WORKER, { workerData: { file, ...options }, execArgv: [] });
    let result = null;
    function record(key) {
      result ??= key;
    }
    worker.once('message', key => {
      record(key);
      // grace window: a snippet that left a live handle (a timer, an open port) keeps the
      // thread alive past its natural wind-down - fall back to forcible teardown then.
      // unref'd so the guard itself never holds the shard open; firing after a clean exit
      // terminates an already-dead worker (a settled no-op)
      const guard = setTimeout(() => {
        // eslint-disable-next-line promise/prefer-await-to-then, no-empty-function -- fire-and-forget fallback teardown
        worker.terminate().catch(() => {});
      }, 2000);
      guard.unref();
    });
    worker.once('error', error => {
      record(`WORKER-CRASH|${ error?.message ?? error }`);
      // an errored worker may never end on its own - forcible teardown only on this path
      // eslint-disable-next-line promise/prefer-await-to-then, promise/no-promise-in-callback, no-empty-function -- fire-and-forget teardown of a dead worker
      worker.terminate().catch(() => {});
    });
    // resolve on EXIT, not on message: the worker closes its own port after posting and the
    // thread ends NATURALLY - no `terminate()` on the happy path, and no overlap between one
    // worker's teardown and the next one's spawn (both belong to the forcible-disposal race
    // class behind the Windows ACCESS_VIOLATION crashes at this spawn volume)
    worker.once('exit', () => resolve(result ?? 'WORKER-CRASH|exited without result'));
  });
}
