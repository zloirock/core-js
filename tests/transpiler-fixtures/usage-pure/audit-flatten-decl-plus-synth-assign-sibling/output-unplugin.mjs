import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
// a FLATTEN declarator plus a sibling destructure-ASSIGNMENT in one statement. the assignment's VALUE
// is CAPTURED (`alias = ({ Array: { of } } = globalThis)` yields globalThis), so its receiver must NOT
// synth-swap into a mirror literal - that would capture the mirror instead of globalThis. the leaf bails
// to the inline-default (`{ of = _Array$of }`), keeping the receiver (-> _globalThis) as the captured
// value while still polyfilling the leaf on absence. contrasts, each a distinct path: a param default
// (`mk`) is caller-correct so it synth-swaps its default; a STATEMENT-context assignment discards its
// value so the cascade extracts (`from = _Array$from`). distinct static per line. babel drops the
// assignment parens -> sidecar.
let of, from;
const fromEntries = _Object$fromEntries;
const { Math: { floor } } = _globalThis;
const alias = ({ Array: { of = _Array$of } } = _globalThis);
const ownKeys = _Reflect$ownKeys;
const mk = function ({ Map: { groupBy } } = { Map: { groupBy: _Map$groupBy } }) { return groupBy; };
from = _Array$from;
export { of, from, fromEntries, floor, alias, mk };