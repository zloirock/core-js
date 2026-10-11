// a write through a binding that holds a selection of a container name and other values lands on the named
// container whichever value runs, so a static read back through that container loads the written
// constructor's static - over a ternary with a literal, a logical, a call arm, and an alias of such a binding
const listed = { C: Array };
const either = flag ? listed : { C: Set };
either.C = Iterator;
export const copied = listed.C.from([1]);
const first = { C: Object };
const pick = first || { C: Set };
pick.C = Map;
export const grouped = first.C.groupBy([1], x => x);
const box = { C: Array };
const made = flag ? box : make();
made.C = Promise;
export const settled = box.C.allSettled([]);
const parsed = { C: Object };
const chosen = flag ? parsed : { C: Set };
const named = chosen;
named.C = Symbol;
export const registered = parsed.C.for('a');
