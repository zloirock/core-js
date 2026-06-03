import _globalThis from "@core-js/pure/actual/global-this";
// the assignment is in the `if` branch but the use is in the `else` - sibling branches never both
// run, so M is undefined at the use. the guarding branch (the consequent) doesn't contain the use,
// so the alias is left unresolved (sound) and `M.Promise.allSettled` stays. proves the gate keys
// on the SPECIFIC branch, not merely "inside the same if-statement"
function f() {
  if (c) {
    var M = _globalThis;
  } else {
    M.Promise.allSettled([]);
  }
}