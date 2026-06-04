// global twin: a nested-block `var` proxy-global alias used as the object of a `Symbol.iterator in`
// check. threading the use path into the class-walk proxy-global lookup surfaces the synthetic
// var-hoist binding, so the iterator dependency set is injected (not the bare Symbol constructor set)
function f(c, obj) {
  if (c) {
    var g = globalThis;
  }
  return g.Symbol.iterator in obj;
}
f(true, []);
