import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
var _ref;
// A lowered result capture keeps the original receiver beside its extracted statics.
let of, from, saved;
function get() {
  log('get');
  return Array;
}
const held = (_ref = saved = get(), of = _Array$of, from = _Array$from, _ref, saved);
use(held, of(1), from([2]));