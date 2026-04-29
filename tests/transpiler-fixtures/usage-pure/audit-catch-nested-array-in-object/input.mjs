// Catch's object destructure contains a nested array destructure. Outer extraction pulls
// from `_ref`; the nested array pattern should transpile to its own destructuring
// on `inner`, and the instance method `at` should polyfill for `inner[0]`.
try {
  throw { inner: [{}], flat: "x" };
} catch ({ inner: [first], flat }) {
  first.at(0);
  flat.at(0);
}
