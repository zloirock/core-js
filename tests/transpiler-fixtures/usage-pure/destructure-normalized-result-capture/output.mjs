import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// A lowered result capture keeps the original receiver beside its extracted statics.
let of, from, saved;
function get() {
  log('get');
  return Array;
}
const held = (saved = get(), of = _Array$of, from = _Array$from, saved);
use(held, of(1), from([2]));