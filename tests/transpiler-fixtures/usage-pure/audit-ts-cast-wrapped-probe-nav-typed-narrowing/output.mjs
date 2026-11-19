import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref, _ref2;
// a TS cast layer sits BETWEEN the probe nav and its tail. the cast is type-only: the guard
// renders exactly as in the bare spelling, the collapse still fires, and the cast layer rides
// the rendered value (it erases downstream)
_globalThis.tsBox = {
  n: 4,
  inner: {
    n: 5
  },
  list: ['ab', 'cd']
};
// the dispatches above take a nav receiver, which carries no type, so they record the GENERIC
// entry. this row narrows: a literal receiver resolves to `array`, and the element type `at`
// yields carries the second call to `string`. a single-family dispatch shows neither verdict
export const typedNarrowing = null == (_ref = (_atMaybeArray(_ref2 = ['ab', 'cd']) || 0).call(_ref2, (null == _globalThis.window ? void 0 : _self.tsBox.list) ? 0 : 1)) ? void 0 : _includesMaybeString(_ref).call(_ref, 'a');