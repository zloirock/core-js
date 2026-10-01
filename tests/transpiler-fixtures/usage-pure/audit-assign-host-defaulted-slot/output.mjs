import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
// Assignment defaults compose with instance dispatch and nested static patterns.
// The receiver is evaluated once; a rest-bearing instance level remains native.
const arr = [1, 2];
const nb = {
  y: arr
};
let m1, m2, m3, m4, m5, restOf, m6, m7, n7, m8, m9, m10, x;
m1 = (_ref = _atMaybeArray([1, 2])) === void 0 ? 1 : _ref;
// the same leaf in the two sequence positions: a discarded non-tail element and a tail one
m2 = (_ref2 = _atMaybeArray([1, 2])) === void 0 ? 1 : _ref2;
x;
x;
m3 = (_ref3 = _atMaybeArray([1, 2])) === void 0 ? 1 : _ref3;
({
  0: m4
} = (_ref4 = _atMaybeArray(arr)) === void 0 ? [9] : _ref4);
({
  at: {
    0: m5,
    ...restOf
  } = [9]
} = arr);
({
  0: m6 = 7
} = (_ref5 = _atMaybeArray(arr)) === void 0 ? [9] : _ref5);
({
  0: m7
} = (_ref6 = _atMaybeArray(arr)) === void 0 ? [9] : _ref6);
n7 = _includesMaybeArray(arr);
// ... but a leaf carrying a claim of its OWN keeps the mirror: that claim is the composition's,
// and consuming here would render the receiver twice
({
  y: {
    flat: m8
  } = {
    flat: _flatMaybeArray([])
  }
} = nb);
// the composed two-step in this host: a TYPED outer hop feeds the leaf dispatch, whether the hop
// is an instance method or a static of the constructor the receiver names
m9 = _at((_ref7 = _flatMaybeArray(arr)) === void 0 ? [] : _ref7);
({
  from: {
    name: m10
  } = {}
} = {
  from: {
    name: _nameMaybeFunction(_Array$from)
  }
});
export { m1, m2, m3, m4, m5, restOf, m6, m7, n7, m8, m9, m10 };