// a `var` proxy-global alias hoisted to an ENCLOSING function, dereferenced from a NESTED function.
// the climbing var-hoist fallback surfaces the binding so its `globalThis` init resolves and the
// `g.Map.groupBy` proxy-chain injects the Map statics (plus the global-this polyfill the init needs)
function outer(cond) {
  if (cond) {
    var g = globalThis;
  }
  function inner() {
    return g.Map.groupBy([], () => 1);
  }
  return inner;
}
outer(true);
