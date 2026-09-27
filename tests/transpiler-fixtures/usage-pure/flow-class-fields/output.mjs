import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref, _ref2;
// @flow
// Instance and static fields read annotations without treating them as initializers.
declare class C {
  items: string,
  static items: number[],
}
_atMaybeString(_ref = new C().items).call(_ref, 0);
_includesMaybeArray(_ref2 = C.items).call(_ref2, 1);