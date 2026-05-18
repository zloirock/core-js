import _Array$from from "@core-js/pure/actual/array/from";
// extension of the in-true rescue: nested static-method polyfill INSIDE the rescued
// AssignmentExpression value (`(y = Array.from([1, 2]))`). exempting the RHS from the
// `skippedNodes` sweep also lets the inner `Array.from` static-rewrite emit; without
// that the rescue would strand raw `Array.from` in the replacement
let y;
const x = "groupBy" in (y = _Array$from([1, 2]));