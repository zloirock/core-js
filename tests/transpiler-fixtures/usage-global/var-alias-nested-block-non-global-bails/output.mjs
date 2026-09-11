// a `var` alias hoisted from a nested non-function block is surfaced by the var-hoist fallback,
// but only a proxy-global init (globalThis / self / window) makes the aliased member a real
// global. a plain-object init must NOT inject: the fallback finds the declarator yet resolution
// correctly bails, so `g.Map.groupBy` stays an ordinary property access (no es.map.group-by).
// negative counterpart of var-proxy-global-alias-nested-block
function run(flag) {
  if (flag) {
    var g = {};
  }
  return g.Map.groupBy([], () => 1);
}
run(true);