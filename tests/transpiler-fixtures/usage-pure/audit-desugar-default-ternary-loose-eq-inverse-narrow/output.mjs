import _at from "@core-js/pure/actual/instance/at";
// loose-equality inverse default-ternary: `_ref != null ? _ref : D` collapses
// both null and undefined test slots into one branch. Some minifiers (terser
// in non-strict-equality mode) emit this; narrow resolver must accept the
// `!=` operator alongside `!==` for the inverse-shape detection. `_ref` is
// intentionally untyped: a caller can pass any value, so the result of the
// ternary is `default | _ref` and Maybe-array narrow on the receiver would be
// unsound - the resolver MUST fall through to the generic instance dispatch
function fn(_ref) {
  var arr = _ref != null ? _ref : [1, 2, 3];
  return _at(arr).call(arr, 0);
}
export { fn };