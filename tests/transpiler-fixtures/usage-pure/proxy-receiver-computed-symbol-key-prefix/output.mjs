import _getIterator from "@core-js/pure/actual/get-iterator";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// Iterator consumption keeps a sealed receiver prefix ahead of the symbol-key effect.
// The effectful realm key remains inside its original receiver.
export const result = (_ref = (prefix(), _globalThis[hop(), 'self']).window, key(), _getIterator(_ref));