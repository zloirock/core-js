import _Array$from from "@core-js/pure/actual/array/from";
// chain-assignment with MemberExpression LHS evaluates to its RHS (`Array`), so
// the destructure `{ from }` should still see the static receiver - same shape as
// `const { from } = (a = Array)` but with `a.x = Array` instead of bare `a`
const a = {};
a.x = Array;
const from = _Array$from;
from([1, 2, 3]);