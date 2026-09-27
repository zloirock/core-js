import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref, _ref2;
// @flow
// Reading a getter returns its value; calling a getter invokes that value.
declare class C {
  get items(): number[],
  get m(): () => string,
}
_atMaybeArray(_ref = new C().items).call(_ref, 0);
_includesMaybeString(_ref2 = new C().m()).call(_ref2, "a");