// A bound on an in-process wait; a child gets zx's own `timeout` instead. Unbounded, a wait that never
// settles ends the run on the unsettled top-level await - exit 13, naming an `await` line and no
// fixture. An armed timer keeps the loop alive, so the deadline arrives first and names what hung.
//
// Not `timeLimitedPromise` from `tests/helpers/helpers.js`: it rejects with `undefined`, and a bound
// naming neither the wait nor its length is that same silence one step later.
export async function withDeadline(start, { ms, what }) {
  let timer;
  try {
    return await Promise.race([
      start(),
      new Promise((resolve, reject) => {
        timer = setTimeout(() => reject(new Error(`${ what } did not finish within ${ ms }ms`)), ms);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}
