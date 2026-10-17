import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.push";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
const events = [];
const array = [3, [1, 2]];
function read({
  at
} = (events.push('default'), array).flat()) {
  return at.call(array, -1);
}
use(read(), events);