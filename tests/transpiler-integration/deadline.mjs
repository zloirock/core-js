// A bound on a wait - a child process, or fixture code a runner called. It lives beside `matrix.mjs`
// and under the same contract, pulling in nothing, so a suite imports it across the directory boundary
// without installing anything from here; `tests/e2e-libs` does. Keep it that way.
//
// Unbounded, a wait that never finishes takes two shapes and neither says what broke: with something
// still on the event loop the runner hangs, and with nothing left node aborts the module on the
// unsettled top-level await - exit 13, naming an `await` line and no fixture, no check and no total.
// The pending timer replaces the second with a sentence: it is itself a reason for the loop to stay
// alive, so the deadline arrives first and names what did not finish.
//
// Cleared on every path, the winning one included, or a finished runner stays alive to the end of its
// budget - the same defect wearing the other face. A thunk rather than a promise, so the work is
// started and claimed in one expression.
//
// Not `timeLimitedPromise` from `tests/helpers/helpers.js`, which looks like this and is not: it
// imports `@core-js/pure` at module level, so a runner taking it would pull the polyfill under test
// into its own realm, and it rejects with `undefined`, naming neither the wait nor its bound.
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
