// esbuild / swc / terser emit the inverse default-ternary `X !== void 0 ? X : D` instead of
// the babel `X === void 0 ? D : X` shape; inference of the bound variable must accept both forms.
// `_ref` is untyped, so the result is `default | _ref` and a Maybe-array narrow would be unsound;
// dispatch must reach the generic instance helper.
function fn(_ref) {
  var arr = _ref !== void 0 ? _ref : [1, 2, 3];
  return arr.at(0);
}
export { fn };
