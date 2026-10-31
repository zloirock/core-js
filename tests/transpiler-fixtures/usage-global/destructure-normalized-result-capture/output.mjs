import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.string.iterator";
// A lowered result capture keeps the original receiver beside its extracted statics.
let of, from, saved;
function get() {
  log('get');
  return Array;
}
const held = ({
  of,
  from
} = saved = get(), saved);
use(held, of(1), from([2]));