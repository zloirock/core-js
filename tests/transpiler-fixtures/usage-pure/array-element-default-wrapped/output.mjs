import _at from "@core-js/pure/actual/instance/at";
// Transparent wrappers keep the array capture and source property order.
export function read(receiver, fallback) {
  var _ref2;
  const [_ref] = (([receiver] as unknown[]));
  const {
    other
  } = _ref;
  const at = (_ref2 = _at(_ref)) === void 0 ? fallback() : _ref2;
  return [other, at];
}