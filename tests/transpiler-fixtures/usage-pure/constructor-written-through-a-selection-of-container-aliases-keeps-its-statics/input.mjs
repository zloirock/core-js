// a constructor written through a binding that holds a selection of container names lands in whichever arm
// the selection yields, so a static read back through an arm reaches the written constructor's static, and pure
// takes the entry carrying it - over a ternary, a logical, an alias of such a binding, a decided selection, and
// an arm that never spelled the slot
const listed = { C: Object };
const other = { C: Set };
const either = flag ? listed : other;
either.C = Iterator;
export const copied = listed.C.from([1]);
const first = { C: Object };
const second = { C: Set };
const pick = first || second;
pick.C = Map;
export const grouped = first.C.groupBy([1], x => x);
const box = { C: Array };
const spare = { C: Set };
const held = flag ? box : spare;
const named = held;
named.C = Promise;
export const settled = box.C.allSettled([]);
const parsed = { C: Object };
const unused = { C: Set };
const decided = typeof Symbol != 'undefined' ? parsed : unused;
decided.C = Symbol;
export const registered = parsed.C.for('a');
const empty = {};
const filled = { C: Set };
const via = flag ? empty : filled;
via.C = URL;
export const valid = empty.C.canParse('a:b');
