// a `||` fallback param default whose resolved LEFT is a member chain rooted at a side-effecting IIFE
// (`(() => { globalThis.c++; return globalThis; })().Array || Set`): the fallback collapses to the
// polyfilled literal, but the left's chain-root call setup must be rescued ahead of it (run once) -
// the structural prefix harvest alone stops at the chain root, dropping the call
function g({ from } = (() => {
  globalThis.c++;
  return globalThis;
})().Array || Set) {
  return from([1]);
}
g();
