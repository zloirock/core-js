// A loop may never initialize its var alias. The realm identity guard retains the original
// member read and its TypeError when the loop never runs.
function f() {
  while (c) { var M = globalThis; }
  M.Map.groupBy([], () => 1);
}
