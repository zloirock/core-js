import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref, _ref2;
// a SEQUENCE evaluates to its last element, so a probe nav sitting there is the receiver's value
// and owes the guard render. by the time the nav's own rewrite runs, the chain ROOT is already
// substituted - the rewrite must still claim the nav under the renamed head rather than skip
// it as a phantom, which is what keeps the ponyfillable hop off a native read here
_globalThis.seqBox = {
  list: ['ab', 'cd'],
  n: 7
};
// the dispatches above take a nav receiver, which carries no type, so they record the GENERIC
// entry. this row narrows: a literal receiver resolves to `array`, and the element type `at`
// yields carries the second call to `string`. a single-family dispatch shows neither verdict
export const typedNarrowing = null == (_ref = _atMaybeArray(_ref2 = ['ab', 'cd']).call(_ref2, (null == _globalThis.window ? void 0 : _self.seqBox.list) ? 0 : 1)) ? void 0 : _includesMaybeString(_ref).call(_ref, 'a');