import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// A folded computed key reassigns the receiver. The method read still selects
// the method on the receiver value evaluated before that key.
let arr = [1, 2];
export const method = (_ref = arr, (() => (arr = {
  at: () => 'swapped'
}, 'at'))(), _atMaybeArray(_ref));