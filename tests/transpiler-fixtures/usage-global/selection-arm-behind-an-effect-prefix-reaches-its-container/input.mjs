// a write through a name holding a selection lands on whichever arm runs - an arm behind an effect prefix or
// a chain assignment as well as a bare one - so a static read back through that arm's container loads the
// written constructor's statics
const listed = { C: Array };
const other = { C: Object };
const picked = flag ? (init(), listed) : other;
picked.C = Iterator;
export const copied = listed.C.from([1]);
const first = { C: Object };
const second = { C: Object };
const either = (prep(), first) || second;
either.C = Map;
export const grouped = first.C.groupBy([1], item => item);
const held = { C: Object };
const spare = { C: Object };
let tmp;
const chosen = flag ? (tmp = held) : spare;
chosen.C = Promise;
export const settled = held.C.allSettled([]);
