import _Array$from from "@core-js/pure/actual/array/from";
// extension of the in-true rescue: nested static-method polyfill INSIDE the rescued
// AssignmentExpression value (`(y = Array.from([1, 2]))`). the rescued RHS must stay
// exempt from the skip sweep so the inner `Array.from` static-rewrite still emits; without
// that the rescue would strand raw `Array.from` in the replacement
let y;
const x = "groupBy" in (y = _Array$from([1, 2]));