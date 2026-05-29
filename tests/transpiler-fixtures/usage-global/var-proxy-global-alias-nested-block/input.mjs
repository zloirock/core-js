// a `var` alias of a proxy-global declared in a nested non-function block hoists to the
// enclosing function scope, so a static call through it must still resolve and inject
function run(flag) {
  if (flag) {
    var g = globalThis;
  }
  return g.Map.groupBy([], () => 1);
}
run(true);
