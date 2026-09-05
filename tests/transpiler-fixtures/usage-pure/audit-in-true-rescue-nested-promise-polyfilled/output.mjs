import _Promise$all from "@core-js/pure/actual/promise/all";
// extension of the in-true-rescue family: nested PROMISE polyfill inside rescued
// AssignmentExpression value. exempting AssignmentExpression-RHS from the skippedNodes
// sweep lets the inner `Promise.all([])` static rewrite emit `_Promise$all` alongside
// the `(y = ..., true)` rescue text - both polyfill imports survive
let y;
const r = "foo" in (y = _Promise$all([1, 2]));