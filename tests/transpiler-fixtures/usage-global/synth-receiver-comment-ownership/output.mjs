import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
// A parameter mirror serves two instance methods from a supplied prototype default.
// Each method gets its own receiver node, and the original comment prints once.
function read(first = 0, {
  at,
  flat
} = Array /* receiver */.prototype, last = 0) {
  return [at, flat];
}
export const result = read(effect(), undefined, effect());