import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// unlabeled `continue` inside a for loop is iteration-local, not a function-level exit
// (analogous to the switch-break case). `subtreeContainsExit` sets `inLoopOrSwitch=true`
// when descending into the for, then suppresses the unlabeled continue. the straight-line
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