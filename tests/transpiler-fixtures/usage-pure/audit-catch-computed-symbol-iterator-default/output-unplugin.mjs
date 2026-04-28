import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
// catch param destructuring with computed Symbol.iterator key carrying a default,
// no rest. companion fixture to `destructuring-computed-symbol-iterator-default`
// that uses const-binding; here the binding lives in catch parameter scope which
// triggers the `_ref`-rename + hoisted `_ref2` temp pattern
try {} catch (_ref) {
let _ref2, it = (_ref2 = _getIteratorMethod(_ref)) === void 0 ? fallback : _ref2;
  it();
}