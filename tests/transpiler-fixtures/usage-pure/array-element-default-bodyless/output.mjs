import _at from "@core-js/pure/actual/instance/at";
// An unbraced declaration preserves its branch and property order.
export function read(receiver, fallback) {
  var _ref;
  if (receiver) var [,] = [receiver],
    {
      other
    } = receiver,
    at = (_ref = _at(receiver)) === void 0 ? fallback() : _ref;
  return [at, other];
}