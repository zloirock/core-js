// same memoization for a `||` fallback receiver whose resolved left is call-rooted, with an
// UNRESOLVED sibling key. the memo argument is the resolved LEFT only - the left is the always-truthy
// receiver, so the dead right operand short-circuits and is dropped (same collapse the all-resolved
// path applies), keeping the import set minimal and identical across both emitters
function h({ from, isArray } = (() => {
  globalThis.c++;
  return globalThis;
})().Array || Set) {
  return [from([1]), isArray([])];
}
h();
