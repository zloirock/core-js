import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6;
// ECMA evaluates a member call's RECEIVER before its computed key, and a member get runs user code
// whenever the property is an accessor - so "the receiver has no syntactic side effects" is not a
// reason to leave it after the harvested key effect. the receiver memo hoists ahead of that effect
_globalThis.orderBox = {
  list: ['ab', 'cd'],
  n: 4
};
let k = 0;
export const memberReceiver = null == (_ref = _globalThis.window) ? void 0 : (_ref2 = _ref.orderBox.list, k++, _at(_ref2).call(_ref2, 0));
export const memberReceiverPlain = (_ref3 = _globalThis.orderBox.list, k++, _at(_ref3).call(_ref3, 0));
export const deepMemberReceiver = null == (_ref4 = _globalThis.window) ? void 0 : (_ref5 = _ref4.orderBox.list, k++, _includes(_ref5).call(_ref5, 'a'));

// a receiver that CANNOT run anything stays in place: a literal builds its value without invoking
// user code, and a binding is just a read - the negatives that keep the hoist off the common path
const bound = ['ab', 'cd'];
export const literalReceiver = (k++, _atMaybeArray(_ref6 = ['ab', 'cd']).call(_ref6, 0));
export const bindingReceiver = (k++, _atMaybeArray(bound).call(bound, 0));
export { k };