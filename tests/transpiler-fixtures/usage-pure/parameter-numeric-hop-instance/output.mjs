import _at from "@core-js/pure/actual/instance/at";
// A numeric hop uses a computed member read after the receiver is captured.
export function read(_ref) {
  let at = _at(_ref[0]);
  return at;
}