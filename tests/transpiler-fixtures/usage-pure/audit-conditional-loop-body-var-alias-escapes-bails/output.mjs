import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
// A loop may never initialize its var alias. The realm identity guard retains the original
// member read and its TypeError when the loop never runs.
function f() {
  while (c) {
    var M = _globalThis;
  }
  (M === _globalThis ? _Map : M.Map).groupBy([], () => 1);
}