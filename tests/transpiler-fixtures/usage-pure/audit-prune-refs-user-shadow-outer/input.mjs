// user-defined outer binding shadows a polyfillable name: the inner reference still
// resolves to the user binding, no spurious polyfill emission.
var _ref2 = 5;
var _ref3 = 10;
console.log(_ref2, _ref3);
function a() {
  return [1, 2, 3].at(0);
}
function b() {
  return [4, 5, 6].at(1);
}
a();
b();
