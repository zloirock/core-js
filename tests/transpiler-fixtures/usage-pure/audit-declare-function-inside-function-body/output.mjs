import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `declare function` inside a function body: ambient binding in a nested scope. the
// ambient walk drills through the function-body block down to the statement array.
// without this, `g().at(0)` falls back to the generic helper instead of the array-
// narrowed one (the declared `number[]` return type would be lost)
function f() {
  var _ref;
  declare function g(): number[];
  return _atMaybeArray(_ref = g()).call(_ref, 0);
}