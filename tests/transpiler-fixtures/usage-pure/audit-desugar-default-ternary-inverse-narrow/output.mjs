import _at from "@core-js/pure/actual/instance/at";
// esbuild / swc / terser emit inverse default-ternary `X !== void 0 ? X : D`
// instead of the babel `X === void 0 ? D : X` shape. Inference of the bound
// variable must accept both forms. `_ref` is intentionally untyped: a caller
// can pass any value, so the result of the ternary is `default | _ref` and
// Maybe-array narrow on the receiver would be unsound - the resolver MUST
// fall through to the generic instance dispatch
function fn(_ref) {
  var arr = _ref !== void 0 ? _ref : [1, 2, 3];
  return _at(arr).call(arr, 0);
}
export { fn };