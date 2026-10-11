import _concatMaybeArray from "@core-js/pure/actual/array/instance/concat";
import _sliceMaybeArray from "@core-js/pure/actual/array/instance/slice";
import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// An element written under a presence test this build always answers takes the type the test
// settles: a write in the arm the build always takes is unconditional, one in the arm it never
// takes leaves the literal element. An undecided test keeps both values, and so does a `||` over
// an alias of a global the build does not know, which may hold a falsy value.
export function live() {
  var _ref;
  const list = [[1]];
  if (typeof _Promise != 'undefined') list[0] = 'abc';
  return _atMaybeString(_ref = list[0]).call(_ref, 0);
}
export function dead() {
  var _ref2;
  const list = ['abc'];
  if (typeof _Promise == 'undefined') list[0] = [1];
  return _includesMaybeString(_ref2 = list[0]).call(_ref2, 'b');
}
export function undecided() {
  var _ref3;
  const list = [[1]];
  if (_globalThis.flag) list[0] = 'abc';
  return _sliceMaybeArray(_ref3 = list[0]).call(_ref3, 1);
}
const config = APP_CONFIG;
export function aliasLeft() {
  var _ref4;
  const list = ['abc'];
  config || (list[0] = [1]);
  return _concatMaybeArray(_ref4 = list[0]).call(_ref4, 'd');
}