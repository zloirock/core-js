// a plugin slot-shaped name (`_ref`, `_Array$from`) worn by a NON-REFERENCE position - an
// object-literal key, a member key on a non-Identifier root, a statement label - is a source-text
// name, not a binding the UID allocator can shadow. it must NOT reserve the slot: both emitters take
// the LOW number (`_ref`, `_Array$from`), matching babel's "only real bindings / references / id-rooted
// member keys block a UID". an id-rooted member key (last line) IS reserved via the member-key census,
// so its memo takes `_ref2` - the reservation boundary. distinct method per line.
function call() { return {}; }
const objKey = { _ref: 1 };
export const r1 = [10, 20].at(0);
call()._ref;
export const r2 = [[1], [2]].flat();
_ref: for (const v of [1, 2]) { if (v) break _ref; }
export const r3 = [3, 4].includes(3);
const importKey = { _Array$from: 1 };
export const r4 = Array.from([5, 6]);
const idRooted = {};
idRooted._ref;
export const r5 = [7, 8].findLast(x => x > 7);
export { objKey, importKey, idRooted };
