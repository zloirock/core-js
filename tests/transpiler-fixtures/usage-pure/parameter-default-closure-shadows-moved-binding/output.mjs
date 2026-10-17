import _at from "@core-js/pure/actual/instance/at";
// The earlier closure reads its own parameter, even when the destructured binding has the same name.
// That shadow must not prevent serving the open function's generic method read.
export function read(probe = (at => () => at)(7), _ref) {
  let at = _at(_ref);
  return [at.call([4], 0), probe()];
}
export const result = read(undefined, [4]);