import _at from "@core-js/pure/actual/instance/at";
// Splitting a sibling revisits the positional claim on its new receiver.
export function read(obj) {
  const {
    list: [_ref]
  } = obj;
  const at = _at(_ref);
  const {
    y
  } = obj;
  return [at, y];
}