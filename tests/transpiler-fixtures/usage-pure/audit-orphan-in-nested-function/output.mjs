import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref2;
// User-shape `_ref = foo()` inside a nested function body must NOT be adopted by the
// orphan heuristic - the var-scope boundary check in collectAllBindingNames downgrades
// `atTopLevel=false` once a function body is entered.
function inner() {
  _ref = helper();
}
_atMaybeArray(_ref2 = [1, 2, 3]).call(_ref2, 0);
function helper() {
  return 42;
}