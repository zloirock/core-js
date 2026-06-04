import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// pure twin: a nested-block `var` (in an unconditional block, so its init reaches the use) holding a
// computed static key. threading the use path into the binding lookup lets the computed-key
// alias-follow resolve `Object[K]` to the static and substitute the receiver-less pure import
function f() {
  {
    var K = 'fromEntries';
  }
  return _Object$fromEntries([['a', 1]]);
}
f();