import _at from "@core-js/pure/actual/instance/at";
// control for the loop/switch shadowing: `throw` inside a loop is NOT loop-local - it
// propagates past the loop and exits the function. the `LOOP_LIKE_TYPES` flag in
// `subtreeContainsExit` only suppresses break/continue; throw/return still bail. the
// straight-line `x = "hello"` after the loop must not be considered reachable
let x = [1, 2, 3];
let n = 3;
(() => {
  for (let i = 0; i < n; i++) {
    throw new Error();
  }
  x = "hello";
})();
_at(x).call(x, 0);