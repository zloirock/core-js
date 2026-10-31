import _Iterator from "@core-js/pure/actual/iterator";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
import _Set from "@core-js/pure/actual/set/constructor";
import _Symbol from "@core-js/pure/actual/symbol";
import _URL from "@core-js/pure/actual/url";
// a constructor written through a binding that holds a selection of container names lands in whichever arm
// the selection yields, so a static read back through an arm reaches the written constructor's static, and pure
// takes the entry carrying it - over a ternary, a logical, an alias of such a binding, a decided selection, and
// an arm that never spelled the slot
const listed = {
  C: Object
};
const other = {
  C: _Set
};
const either = flag ? listed : other;
either.C = _Iterator;
export const copied = listed.C.from([1]);
const first = {
  C: Object
};
const second = {
  C: _Set
};
const pick = first || second;
pick.C = _Map;
export const grouped = first.C.groupBy([1], x => x);
const box = {
  C: Array
};
const spare = {
  C: _Set
};
const held = flag ? box : spare;
const named = held;
named.C = _Promise;
export const settled = box.C.allSettled([]);
const parsed = {
  C: Object
};
const unused = {
  C: _Set
};
const decided = parsed;
decided.C = _Symbol;
export const registered = parsed.C.for('a');
const empty = {};
const filled = {
  C: _Set
};
const via = flag ? empty : filled;
via.C = _URL;
export const valid = empty.C.canParse('a:b');