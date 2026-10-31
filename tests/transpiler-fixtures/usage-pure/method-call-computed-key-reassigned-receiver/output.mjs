import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref;
// A folded computed key reassigns the receiver. Capture its original value before
// replaying the key so method selection and the call use the same receiver.
let arr = [1, [2]];
export const result = (_ref = arr, (() => (arr = {
  flat: () => 'swapped'
}, 'flat'))(), _flatMaybeArray(_ref).call(_ref));