import _at from "@core-js/pure/actual/instance/at";
// loose-equality inverse default-ternary `_ref != null ? _ref : D` collapses both null and
// undefined test slots into one branch (terser in non-strict mode emits this); narrow detection
// must accept `!=` alongside `!==`. `_ref` is untyped, so the result is `default | _ref` and a
// Maybe-array narrow would be unsound; dispatch must reach the generic instance helper.
function fn(_ref) {
  var arr = _ref != null ? _ref : [1, 2, 3];
  return _at(arr).call(arr, 0);
}
export { fn };