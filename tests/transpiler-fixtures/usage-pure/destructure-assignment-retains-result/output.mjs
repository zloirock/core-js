import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref, _ref2, _ref4;
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
const branch = (consume() ? Array : Array, of = _Array$of, from = _Array$from, 7);
if (of = _Array$of, from = _Array$from, Array) consume(of, from);
const read = () => {
  var _ref3;
  return _ref3 = make(), of = _Array$of, from = _Array$from, _ref3;
};
consume(read() === Array);
label: make(), of = _Array$of, from = _Array$from;
// A foreign branch retains its own values.
const foreign = {
  of: undefined,
  from: undefined
};
const custom = (_ref4 = consume() ? foreign : Array, of = _ref4 === Array ? _Array$of : _ref4.of, from = _ref4 === Array ? _Array$from : _ref4.from, _ref4);
consume(custom, of, from, branch);