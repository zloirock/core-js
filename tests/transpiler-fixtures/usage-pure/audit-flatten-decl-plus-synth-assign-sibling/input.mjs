// a FLATTEN declarator + a sibling whose receiver a synth-swap will OWN, in ONE statement, previously HARD-
// CRASHED the unplugin transform-queue (`mergeEqualRange`): the sibling-receiver walk fires on the enclosing
// declaration BEFORE the synth-swap, and queued `globalThis -> _globalThis` for the receiver - which the
// synth-swap then ALSO replaced with its mirror literal, leaving two transforms on the same range. the walk
// now skips a destructure's whole right side, for BOTH synth-swap receiver shapes: a destructure-ASSIGNMENT
// init (AssignmentExpression) and a nested-function destructure param DEFAULT (AssignmentPattern). babel is
// AST-immune; it also drops the optional parens around the assignment-init -> output-unplugin sidecar
let of;
const { Object: { fromEntries }, Math: { floor } } = globalThis, alias = ({ Array: { of } } = globalThis);
const { Reflect: { ownKeys } } = globalThis, mk = function ({ Map: { groupBy } } = globalThis) { return groupBy; };
export { of, fromEntries, floor, alias, mk };
