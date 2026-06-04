import _globalThis from "@core-js/pure/actual/global-this";
// a nested-block `var` proxy-global alias reassigned through a for-of head before the use. the
// var-hoist reassignment scan records the for-of head write, so the synthetic binding reports the
// reassignment and the receiver-dropping pure substitution bails - leaving `g.Array.from` native
// (the alias may no longer be globalThis at the use)
function f(arr) {
  {
    var g = _globalThis;
  }
  for (g of arr) {}
  g.Array.from([1, 2, 3]);
}
f([]);