import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref, _ref2;
// A proxy navigation over a chain assignment keeps the assigned value and its effects. The guard and any collapsed tail must read
// that same value.
_globalThis.assignBox = {
  list: ['ab', 'cd'],
  n: 1
};
// the dispatches above take a nav receiver, which carries no type, so they record the GENERIC
// entry. this row narrows: a literal receiver resolves to `array`, and the element type `at`
// yields carries the second call to `string`. a single-family dispatch shows neither verdict
export const typedNarrowing = null == (_ref = _atMaybeArray(_ref2 = ['ab', 'cd']).call(_ref2, (null == _globalThis.window ? void 0 : _self.assignBox.list) ? 0 : 1)) ? void 0 : _includesMaybeString(_ref).call(_ref, 'a');