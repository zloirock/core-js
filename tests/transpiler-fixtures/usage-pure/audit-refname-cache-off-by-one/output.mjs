import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// multiple polyfill sites triggering `_ref` allocation - suffix cache should be
// contiguous `_ref, _ref2, _ref3` not skip any values. seed with a user-declared
// `_ref5` to verify the cache advances past it but doesn't skip ahead past other
// fresh slots
var _ref5 = 99;
console.log(_ref5);
function one() {
  var _ref;
  return _atMaybeArray(_ref = [1, 2, 3]).call(_ref, 0);
}
function two() {
  var _ref2;
  return _includesMaybeArray(_ref2 = [4, 5, 6]).call(_ref2, 5);
}
function three() {
  var _ref3;
  return _findLastMaybeArray(_ref3 = [7, 8, 9]).call(_ref3, x => x > 7);
}
function four() {
  var _ref4;
  return _flatMaybeArray(_ref4 = [10, 11, 12]).call(_ref4);
}
one();
two();
three();
four();