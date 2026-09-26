import _at from "@core-js/pure/actual/instance/at";
var _ref2;
// Captured element references remain private; only the source bindings are exported.
const head = before(),
  [_ref] = [receiver],
  {
    other
  } = _ref,
  at = (_ref2 = _at(_ref)) === void 0 ? fallback() : _ref2,
  tail = after();
export { head, other, at, tail };