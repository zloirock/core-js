import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `declare function` inside a method body: ambient declaration in a class-method scope.
// the walk drills through the method body's block to the statement array - same
// approach as for regular function bodies. `g().at(0)` dispatches the array-narrowed
// polyfill via the declared `number[]` return type
class K {
  m() {
    var _ref;
    declare function g(): number[];
    return _atMaybeArray(_ref = g()).call(_ref, 0);
  }
}
new K();