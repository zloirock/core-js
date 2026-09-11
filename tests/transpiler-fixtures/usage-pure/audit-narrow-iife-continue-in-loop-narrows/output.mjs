import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// unlabeled `continue` inside a for loop is iteration-local, not a function-level exit
// (analogous to the switch-break case). the exit scan must treat descent into the for as
// a loop boundary and suppress the unlabeled continue, so the straight-line
// `x = "hello"` after the loop is still reachable
let x = [1, 2, 3];
let n = 3;
(() => {
  for (let i = 0; i < n; i++) {
    if (i === 0) continue;
  }
  x = "hello";
})();
_atMaybeString(x).call(x, 0);