import _at from "@core-js/pure/actual/instance/at";
// The initializer prefix precedes the receiver read once. A default with calls on the
// same receiver stays in its own branch and must not receive that prefix.
export function read(rows, effect, fallback) {
  var _ref;
  let method;
  method = (_ref = _at((effect(), rows))) === void 0 ? (fallback(rows), fallback(rows)) : _ref;
  return method;
}