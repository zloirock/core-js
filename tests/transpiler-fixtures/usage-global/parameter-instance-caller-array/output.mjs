import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
// A closed caller supplies an array receiver and selects only Array dispatchers.
// Each method is read once at function entry after the arguments finish.
function read({
  at,
  flat
}) {
  return [at, flat];
}
export const result = read([1, [2]]);