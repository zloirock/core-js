import _at from "@core-js/pure/actual/instance/at";
// A live default runs after its getter and before the following native property.
export function read(receiver, fallback) {
  var _ref;
  const [,] = [receiver];
  /* First read. */const at = (_ref = _at(receiver)) === void 0 ? fallback() : _ref;
  const {
    /* Native read. */other
  } = receiver;
  return [at, other];
}