// a `var` proxy-global alias declared in a CONDITIONAL nested block, used OUTSIDE the branch.
// a var-hoist fallback surfaces it (nested-block vars are otherwise missed) and usage-global
// INJECTS the Map statics: `g.Map.groupBy` is preserved, so a falsy `flag` throws natively at
// `g.Map` and a truthy one finds the polyfill. the usage-pure twin BAILS (its receiver-dropping
// rewrite would mask that native throw); this dominance gate is pure-only.
function run(flag) {
  if (flag) {
    var g = globalThis;
  }
  return g.Map.groupBy([], () => 1);
}
run(true);
