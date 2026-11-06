import _at from "@core-js/pure/actual/instance/at";
// A loop initializer keeps property order within the declaration.
export function read(receiver, fallback) {
  var _ref;
  for (const [,] = [receiver], /* First read. */at = (_ref = _at(receiver)) === void 0 ? fallback() : _ref, {
      other
    } = receiver;;) return [at, other];
}