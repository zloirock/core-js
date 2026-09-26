import _at from "@core-js/pure/actual/instance/at";
// An unbraced declaration preserves its branch and property order.
export function read(receiver, fallback) {
  var _ref2;
  if (receiver) var [_ref] = [receiver],
    {
      other
    } = _ref,
    at = (_ref2 = _at(_ref)) === void 0 ? fallback() : _ref2;
  return [at, other];
}