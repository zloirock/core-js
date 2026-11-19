import "core-js/modules/es.array.of";
import "core-js/modules/es.array.push";
// A selecting factory keeps the static claim on its default arm. Its supplied constructor
// stays native under the existing factory-source proof boundary.
const events = [];
const choose = events.length === 0;
function select() {
  return {
    k: choose ? Array : undefined
  };
}
const {
  k: {
    of,
    [(events.push('key'), 'missing')]: value
  } = Array
} = select();
use(of(3), value, events);