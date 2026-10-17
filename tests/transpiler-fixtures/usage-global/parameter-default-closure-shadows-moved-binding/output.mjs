import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// The earlier closure reads its own parameter, even when the destructured binding has the same name.
// That shadow must not prevent serving the open function's generic method read.
export function read(probe = (at => () => at)(7), {
  at
}) {
  return [at.call([4], 0), probe()];
}
export const result = read(undefined, [4]);