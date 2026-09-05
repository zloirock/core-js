// a for-x HEAD is a real write of the loop variable (it assigns every iteration, and the
// binding survives past the loop), and parsers record it UNEVENLY (babel: init-less head
// declarator; estree: nothing) - the canonical write scan poisons the alias on both. the
// INIT value may still swap to the polyfill (pre-loop reads win, the rebind owns every
// later read), but USES stay raw and the alias must never feed value folds or type trust
var { from } = Array;
for (var from in { a: 1 }) { void from; }
export const rebound = from;

var { of } = Array;
for (var of of ['x']) { void of; }
export const rebound2 = of;

// control: an un-rebound alias extracts
var { fromAsync } = Array;
export const kept = fromAsync;

// a SIBLING function's same-named for-x head is a different binding - the canonical write
// scan stays function-scoped and must not poison this alias
function outer() { var { groupBy } = Map; return groupBy; }
function other() { for (var groupBy in { a: 1 }) { void groupBy; } }
export const isolated = [outer(), other()];
