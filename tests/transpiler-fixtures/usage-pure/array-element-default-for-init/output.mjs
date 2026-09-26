import _at from "@core-js/pure/actual/instance/at";
// A loop initializer keeps property order within the declaration.
export function read(receiver, fallback) {
  var _ref2;
  for (const [_ref] = [receiver], /* First read. */at = (_ref2 = _at(_ref)) === void 0 ? fallback() : _ref2, {
      other
    } = _ref;;) return [at, other];
}