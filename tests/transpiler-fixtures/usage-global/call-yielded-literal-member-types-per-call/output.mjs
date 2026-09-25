import "core-js/modules/es.array.at";
import "core-js/modules/es.string.includes";
// a slot the callee fills from a parameter is typed off the argument of the call that reads it: two
// calls of one callee passing an array and a string each dispatch their own receiver's method, so
// usage-global injects the array entry for one row and the string entry for the other
const build = value => ({
  b: value
});
export const onArray = build([1, 2]).b.at(0);
export const onString = build('ab').b.includes('a');