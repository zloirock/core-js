import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// swc / esbuild desugar `function({ x = D })` to `var x = typeof _ref === 'undefined' ? D : _ref;`
// (babel uses `_ref === void 0`). type inference for the resulting `x` has to recognize both
// shapes - `D`'s type drives the polyfill variant chosen for member calls on `x` afterwards
function fn(_ref) {
  var arr = typeof _ref === 'undefined' ? [1, 2, 3] : _ref;
  return _atMaybeArray(arr).call(arr, 0);
}
export { fn };