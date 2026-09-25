import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref, _ref2;
// a slot the callee fills from a parameter is typed off the argument of the call that reads it: two
// calls of one callee passing an array and a string each dispatch their own receiver's method, so
// usage-global injects the array entry for one row and the string entry for the other
const build = value => ({
  b: value
});
export const onArray = _atMaybeArray(_ref = build([1, 2]).b).call(_ref, 0);
export const onString = _includesMaybeString(_ref2 = build('ab').b).call(_ref2, 'a');