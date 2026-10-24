import _Iterator from "@core-js/pure/actual/iterator";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
import _Set from "@core-js/pure/actual/set/constructor";
import _Symbol from "@core-js/pure/actual/symbol";
// a write through a binding that holds a selection of a container name and other values lands on the named
// container whichever value runs, so a static read back through that container loads the written
// constructor's static - over a ternary with a literal, a logical, a call arm, and an alias of such a binding
const listed = {
  C: Array
};
const either = flag ? listed : {
  C: _Set
};
either.C = _Iterator;
export const copied = listed.C.from([1]);
const first = {
  C: Object
};
const pick = first || {
  C: _Set
};
pick.C = _Map;
export const grouped = first.C.groupBy([1], x => x);
const box = {
  C: Array
};
const made = flag ? box : make();
made.C = _Promise;
export const settled = box.C.allSettled([]);
const parsed = {
  C: Object
};
const chosen = flag ? parsed : {
  C: _Set
};
const named = chosen;
named.C = _Symbol;
export const registered = parsed.C.for('a');