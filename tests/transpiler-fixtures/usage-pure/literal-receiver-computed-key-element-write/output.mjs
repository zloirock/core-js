import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// A literal receiver evaluates its elements before the computed key. Replaying
// a key that changes an element binding must not delay constructing that receiver.
let value = 'before';
export const result = (_ref = [value], (() => (value = 'after', 'at'))(), _atMaybeArray(_ref).call(_ref, 0));