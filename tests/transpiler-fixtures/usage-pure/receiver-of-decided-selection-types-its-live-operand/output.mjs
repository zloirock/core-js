import _Array$from from "@core-js/pure/actual/array/from";
import _concatMaybeArray from "@core-js/pure/actual/array/instance/concat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// A selection this build decides is the operand it yields, held or read in place: a presence test
// the build always answers picks its arm or leaves `||` to its right, and a served static left of
// `||` is the callee. An undecided selection keeps both arms.
function toArray(value) {
  return value;
}
export function ternary() {
  const value = 'abc';
  return _atMaybeString(value).call(value, 0);
}
export function falseTest() {
  const value = 'abc';
  return value.slice(1);
}
export function callee(source) {
  var _ref;
  return _includesMaybeArray(_ref = _Array$from(source)).call(_ref, 1);
}
export function undecided() {
  var _ref2;
  return _concatMaybeArray(_ref2 = _globalThis.flag ? 'abc' : [1]).call(_ref2, 'd');
}