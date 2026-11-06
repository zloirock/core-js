import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// A parameter mirror serves two instance methods from a supplied prototype default.
// Each method gets its own receiver node, and the original comment prints once.
function read(first = 0, {
  at,
  flat
} = {
  at: _atMaybeArray(Array /* receiver */.prototype),
  flat: _flatMaybeArray(Array.prototype)
}, last = 0) {
  return [at, flat];
}
export const result = read(effect(), undefined, effect());