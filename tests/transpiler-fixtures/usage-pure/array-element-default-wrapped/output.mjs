import _at from "@core-js/pure/actual/instance/at";
// Transparent wrappers keep the array capture and source property order.
export function read(receiver, fallback) {
  var _ref;
  // @ts-expect-error the member read is the probe, and the right answer is a type without it
  const [,] = (([receiver] as unknown[]));
  const {
    other
  } = receiver;
  const at = (_ref = _at(receiver)) === void 0 ? fallback() : _ref;
  return [other, at];
}