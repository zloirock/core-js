import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref2 = 5;
var _ref3 = 10;
console.log(_ref2, _ref3);
function a() {
  var _ref;
  return _atMaybeArray(_ref = [1, 2, 3]).call(_ref, 0);
}
function b() {
  var _ref4;
  return _atMaybeArray(_ref4 = [4, 5, 6]).call(_ref4, 1);
}
a();
b();