import _at from "@core-js/pure/actual/instance/at";
// A folded non-identifier key keeps bracket notation on the captured receiver.
const K = 'x-y';
export function read(_ref) {
  let at = _at(_ref["x-y"]);
  return at;
}