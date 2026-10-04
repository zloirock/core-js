import _at from "@core-js/pure/actual/instance/at";
var _ref;
// Required captures remain private; only the source bindings are exported.
const head = before(),
  [,] = [receiver],
  {
    other
  } = receiver,
  at = (_ref = _at(receiver)) === void 0 ? fallback() : _ref,
  tail = after();
export { head, other, at, tail };