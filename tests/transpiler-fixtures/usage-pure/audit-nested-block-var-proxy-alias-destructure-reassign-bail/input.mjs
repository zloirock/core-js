// a nested-block `var` proxy-global alias reassigned through a destructuring-assignment LHS before
// the use. the var-hoist reassignment scan records the array-pattern write, so the synthetic
// binding reports the reassignment and the pure substitution bails - leaving `g.Promise.allSettled`
// native (the alias may no longer be globalThis at the use)
function f(src) {
  {
    var g = globalThis;
  }
  [g] = src;
  g.Promise.allSettled([]);
}
f([]);
