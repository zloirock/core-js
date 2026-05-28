// 2-level nested SequenceExpression wrapping an AssignmentExpression destructure host:
// `(fxA(), (fxB(), ({Array: {from, of}} = globalThis)))`. cascade-emit lifts each SE
// prefix as a standalone ExpressionStatement and must emit them in source order
// (fxA, fxB) so observable side-effects on `calls` match the original SE evaluation
// semantics. inner-to-outer walker had reversed the prefix array
const calls = [];
function fxA() { calls.push('A'); return 0; }
function fxB() { calls.push('B'); return 0; }
let from, of;
(fxA(), (fxB(), ({ Array: { from, of } } = globalThis)));
[calls, from, of];
