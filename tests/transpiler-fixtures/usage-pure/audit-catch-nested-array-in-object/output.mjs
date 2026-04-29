import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
// Catch's ObjectPattern contains a nested ArrayPattern. Outer extraction pulls
// from `_ref`; the nested array pattern should transpile to its own destructuring
// on `inner`, and the instance method `at` should polyfill for `inner[0]`.
try {
  throw {
    inner: [{}],
    flat: "x"
  };
} catch (_ref) {
  let flat = _flatMaybeArray(_ref);
  let {
    inner: [first]
  } = _ref;
  _at(first).call(first, 0);
  _at(flat).call(flat, 0);
}