import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
// a FLATTEN declarator + a sibling whose receiver a synth-swap will OWN, in ONE statement, previously HARD-
// CRASHED the unplugin transform-queue (`mergeEqualRange`): the sibling-receiver walk fires on the enclosing
// declaration BEFORE the synth-swap, and queued `globalThis -> _globalThis` for the receiver - which the
// synth-swap then ALSO replaced with its mirror literal, leaving two transforms on the same range. the walk
// now skips a destructure's whole right side, for BOTH synth-swap receiver shapes: a destructure-ASSIGNMENT
// init (AssignmentExpression) and a nested-function destructure param DEFAULT (AssignmentPattern). babel is
// AST-immune; it also drops the optional parens around the assignment-init -> output-unplugin sidecar
let of;
const fromEntries = _Object$fromEntries;
const { Math: { floor } } = _globalThis;
const alias = ({ Array: { of } } = { Array: { of: _Array$of } });
const ownKeys = _Reflect$ownKeys;
const mk = function ({ Map: { groupBy } } = { Map: { groupBy: _Map$groupBy } }) { return groupBy; };
export { of, fromEntries, floor, alias, mk };