import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// A present array element receives its instance polyfill after the initializer prefix.
// The element default stays conditional and does not stand in for the present receiver.
// The array slot and empty default admit no string receiver.
let effects = 0;
const wrapper = [[1, 2]];
let at;
[_ref = {}] = (effects++, wrapper);
at = _atMaybeArray(_ref);