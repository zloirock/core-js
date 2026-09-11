import _at from "@core-js/pure/actual/instance/at";
// some downlevel transpilers desugar `function({ x = D })` to
// `var x = typeof _ref === 'undefined' ? D : _ref;` while babel uses `_ref === void 0`.
// Type inference for the resulting `x` has to recognise both shapes - `D`'s type drives
// the polyfill variant chosen for member calls on `x` afterwards
function fn(_ref) {
  var arr = typeof _ref === 'undefined' ? [1, 2, 3] : _ref;
  return _at(arr).call(arr, 0);
}
export { fn };