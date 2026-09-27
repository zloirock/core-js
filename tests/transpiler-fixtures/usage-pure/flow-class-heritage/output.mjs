import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref, _ref2;
// @flow
// Ambient inheritance carries members through every hop on both surfaces.
declare class B {
  m(): string,
  static m(): number[],
}
declare class M extends B {}
declare class C extends M {}
_atMaybeString(_ref = new C().m()).call(_ref, 0);
_includesMaybeArray(_ref2 = C.m()).call(_ref2, 1);