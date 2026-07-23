import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref2, _ref3, _ref4, _ref5;
// a plugin slot-shaped name (`_ref`, `_Array$from`) worn by a NON-REFERENCE position - an
// object-literal key, a member key on a non-Identifier root, a statement label - is a source-text
// name, not a binding the UID allocator can shadow. it must NOT reserve the slot: both emitters take
// the LOW number (`_ref`, `_Array$from`), matching babel's "only real bindings / references / id-rooted
// member keys block a UID". an id-rooted member key (last line) IS reserved via the member-key census,
// so its memo takes `_ref2` - the reservation boundary. distinct method per line.
function call() { return {}; }
const objKey = { _ref: 1 };
export const r1 = _atMaybeArray(_ref2 = [10, 20]).call(_ref2, 0);
call()._ref;
export const r2 = _flatMaybeArray(_ref3 = [[1], [2]]).call(_ref3);
_ref: for (const v of [1, 2]) { if (v) break _ref; }
export const r3 = _includesMaybeArray(_ref4 = [3, 4]).call(_ref4, 3);
const importKey = { _Array$from: 1 };
export const r4 = _Array$from([5, 6]);
const idRooted = {};
idRooted._ref;
export const r5 = _findLastMaybeArray(_ref5 = [7, 8]).call(_ref5, x => x > 7);
export { objKey, importKey, idRooted };