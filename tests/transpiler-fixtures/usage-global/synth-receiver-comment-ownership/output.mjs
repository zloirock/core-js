import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
// Two instance methods retain the supplied prototype receiver.
// Its source comment prints once even when both dispatchers use the captured value.
function read(first = 0, {
  at,
  flat
} = Array /* receiver */.prototype, last = 0) {
  return [at, flat];
}
export const result = read(effect(), undefined, effect());