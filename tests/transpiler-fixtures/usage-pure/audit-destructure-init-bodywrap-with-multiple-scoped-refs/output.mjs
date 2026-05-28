import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
(() => {
  var _ref2, _ref4;
  return ((() => {
    var _ref;
    var z1 = _atMaybeArray(_ref = [1]).call(_ref, 0);
    return z1;
  })(), _atMaybeArray(_ref2 = [2]).call(_ref2, 0)) + ((() => {
    var _ref3;
    var z2 = _atMaybeArray(_ref3 = [3]).call(_ref3, 0);
    return z2;
  })(), _atMaybeArray(_ref4 = [4]).call(_ref4, 0));
})();
// Outer arrow body-wrap must absorb two scoped `var _ref;` inserts coming from two
// sibling inner instance-method polyfills. The two inserts target different offsets
// inside the wrapped slice; if their splice order does not stay stable as the slice
// grows, the second insert lands at a shifted offset and silently corrupts the wrapped
// expression - producing syntactically invalid code at runtime.
const from = _Array$from;
console.log(from);