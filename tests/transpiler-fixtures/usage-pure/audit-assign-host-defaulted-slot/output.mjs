import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8;
// a DEFAULTED leaf in an assignment host is flat like its undefaulted twin: the default costs a
// guard, not a route, and the consume spells the receiver once whether or not it is re-readable
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
// a PATTERN default consumes too - the left becomes the extraction's own target, and it may
// spell whatever a pattern spells: a rest, a leaf default, a surviving sibling prop
({
  0: m4
} = (_ref4 = _atMaybeArray(arr)) === void 0 ? [9] : _ref4);
({
  0: m5,
  ...restOf
} = (_ref5 = _atMaybeArray(arr)) === void 0 ? [9] : _ref5);
({
  0: m6 = 7
} = (_ref6 = _atMaybeArray(arr)) === void 0 ? [9] : _ref6);
({
  0: m7
} = (_ref7 = _atMaybeArray(arr)) === void 0 ? [9] : _ref7);
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
m9 = _at((_ref8 = _flatMaybeArray(arr)) === void 0 ? [] : _ref8);
m10 = _nameMaybeFunction(_Array$from === void 0 ? {} : _Array$from);
export { m1, m2, m3, m4, m5, restOf, m6, m7, n7, m8, m9, m10 };