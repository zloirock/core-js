import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref, _ref2;
// the probe nav as a WRITE target: every slot that takes a reference rather than a value. the guard
// renders the same way it does in a read, and the write lands on the object the guard yields - a
// fold into the alternate would write to the short-circuit value instead
_globalThis.writeBox = {
  n: 1,
  list: ['ab', 'cd']
};
// the dispatches above take a nav receiver, which carries no type, so they record the GENERIC
// entry. this row narrows: a literal receiver resolves to `array`, and the element type `at`
// yields carries the second call to `string`. a single-family dispatch shows neither verdict
export const typedNarrowing = null == (_ref = (_atMaybeArray(_ref2 = ['ab', 'cd']) || 0).call(_ref2, (null == _globalThis.window ? void 0 : _self.writeBox.list) ? 0 : 1)) ? void 0 : _includesMaybeString(_ref).call(_ref, 'a');