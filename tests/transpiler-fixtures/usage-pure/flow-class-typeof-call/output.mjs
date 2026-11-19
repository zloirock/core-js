import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// @flow
// A call through typeof an ambient static method reads the function signature.
declare class C {
  static m(): number[]
}
function f(m: typeof C.m) {
  var _ref;
  _atMaybeArray(_ref = m()).call(_ref, 0);
}