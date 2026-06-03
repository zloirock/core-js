import _globalThis from "@core-js/pure/actual/global-this";
// the conditional branch guarding the declarator is a LOOP body (exercises the For/While body entry
// of the branch-field table). `var M = globalThis` runs only when the loop body executes; the use
// sits OUTSIDE the loop, so usage-pure bails - dropping M would mask the native throw when the loop
// never runs (c falsy)
function f() {
  while (c) {
    var M = _globalThis;
  }
  M.Map.groupBy([], () => 1);
}