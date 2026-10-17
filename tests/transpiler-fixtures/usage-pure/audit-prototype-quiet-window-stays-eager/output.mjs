import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// A stable prototype default beside quiet parameter work reads both instance methods eagerly.
function read(first = 0, {
  at,
  flat
} = {
  at: _atMaybeArray(Array.prototype),
  flat: _flatMaybeArray(Array.prototype)
}, last = 0) {
  return [first, at, flat, last];
}
const result = read(effect(), undefined, effect());
export { result };