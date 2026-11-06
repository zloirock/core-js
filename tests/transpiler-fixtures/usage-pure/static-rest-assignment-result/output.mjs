import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
var _ref, _unused;
// The consumed assignment keeps its receiver and runs each key before its write.
let of, from, rest;
const held = (_ref = get(), log(typeof of), of = _Array$of, from = _Array$from, {
  "of": _unused,
  from: _unused,
  ...rest
} = _ref, _ref);
function get() {
  log('receiver');
  return Array;
}
use(held, of(1), from([2]), rest);