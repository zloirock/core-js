// same memoization, with the side effect at the chain ROOT instead of buried along the spine: a
// member default rooted at a side-effecting IIFE plus an UNRESOLVED sibling key. the IIFE is the
// memo argument (run once); the unresolved key reads the memo rather than re-running the IIFE
function f({ from, isArray } = (() => {
  globalThis.c++;
  return globalThis;
})().Array) {
  return [from([1]), isArray([])];
}
f();
