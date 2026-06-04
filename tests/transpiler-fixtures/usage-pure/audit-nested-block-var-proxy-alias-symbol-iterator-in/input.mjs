// a nested-block `var` proxy-global alias used as the object of a `Symbol.iterator in` check.
// threading the use path into the class-walk proxy-global lookup surfaces the synthetic var-hoist
// binding, so `g.Symbol.iterator` resolves to the global and the `in` test folds to the iterable
// helper (rather than leaving the native check un-polyfilled)
function f(c, obj) {
  if (c) {
    var g = globalThis;
  }
  return g.Symbol.iterator in obj;
}
f(true, []);
