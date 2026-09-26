import _at from "@core-js/pure/actual/instance/at";
// A live default runs after its getter and before the following native property.
export function read(receiver, fallback) {
  var _ref2;
  const [_ref] = [receiver];
  /* First read. */const at = (_ref2 = _at(_ref)) === void 0 ? fallback() : _ref2;
  const {
    /* Native read. */other
  } = _ref;
  return [at, other];
}