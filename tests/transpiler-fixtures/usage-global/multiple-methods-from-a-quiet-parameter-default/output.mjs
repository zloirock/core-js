import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
// A pristine prototype can serve both default properties directly.
// No parameter work can observe a delay between their reads.
function read({
  at,
  flat
} = Array.prototype) {
  return [at, flat];
}
export const methods = read();