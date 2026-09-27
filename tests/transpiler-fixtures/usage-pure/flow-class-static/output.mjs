import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref;
// @flow
// An ambient static method keeps its declared string return.
declare class C {
  static m(): string
}
_atMaybeString(_ref = C.m()).call(_ref, 0);