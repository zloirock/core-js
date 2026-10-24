import _Array$from from "@core-js/pure/actual/array/from";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// a write whose value reads the alias itself - a fallback over it, a nullish fallback, a selection keeping it - may
// store the value the alias already held, so that value still reaches the static read after it: the read is served
// for the constructor the alias was declared with beside the fallback. the write runs after the read in its own
// value and overwrites nothing of what came before it
let P = _Promise;
P = P;
export const resolved = (P === _Promise ? _Promise$resolve : P.resolve.bind(P))(1);
let M = _Map;
M = M;
export const grouped = (M === _Map ? _Map$groupBy : M.groupBy.bind(M))(list, key);
let A = Array;
A = flag ? legacyA : A;
export const made = (A === Array ? _Array$from : A.from.bind(A))(list);