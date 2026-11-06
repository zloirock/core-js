// A zero-arg IIFE computed method key folds to its returned name. usage-pure drops an observably-pure
// IIFE (first line); one whose key runs an effect - a sequence in the body (second line) or the IIFE's
// own argument (third line) - is replayed ahead of the polyfilled dispatch, so the effect still runs
// once, before the call. distinct method per line.
const arr = [1, 2, 3];
let log = 0;
export const pure = arr[(() => 'flat')()]();
export const bail = arr[(() => (log++, 'flatMap'))()](x => [x]);
export const argBail = arr[(x => 'at')(log++)](0);
export { log };
