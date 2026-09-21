import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref, _ref2, _ref3, _ref4, _ref6;
// Every host keeps the RHS value and runs its effects before the target writes.
let of, from;
function make() {
  consume(of);
  return Array;
}
const held = (_ref = make(), of = _Array$of, from = _Array$from, _ref);
consume(held === Array, of(1), from([2]));
const tail = (consume(), _ref2 = _globalThis.Array, of = _Array$of, from = _Array$from, _ref2);
consume(tail === Array);
const branch = (_ref3 = consume() ? Array : Array, of = _Array$of, from = _Array$from, _ref3, 7);
if (_ref4 = Array, of = _Array$of, from = _Array$from, _ref4) consume(of, from);
const read = () => {
  var _ref5;
  return _ref5 = make(), of = _Array$of, from = _Array$from, _ref5;
};
consume(read() === Array);
label: _ref6 = make(), of = _Array$of, from = _Array$from, _ref6;
// A foreign branch retains its own values.
const foreign = {
  of: undefined,
  from: undefined
};
const custom = {
  of,
  from
} = consume() ? foreign : Array;
consume(custom, of, from, branch);