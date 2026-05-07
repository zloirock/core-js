import _Array$from from "@core-js/pure/actual/array/from";
// SequenceExpression-tail destructure-assignment cascade lock: `(0, ({Array:{from}}=
// globalThis));` is minifier output where the assignment sits as the SE's tail. before
// the fix, `tryFlattenAssignmentExpression` peeled only ParenthesizedExpression between
// AssignmentExpression and ExpressionStatement; SE blocked the cascade and the polyfill
// for `from` was silently dropped. after the fix, the peel loop also threads through
// SE (only when the AE is the SE's tail - mid-SE peel would change observable value),
// ChainExpression and TS wrappers; the SE's leading expressions are re-emitted as
// statements so `0` (or any side-effect prefix) keeps observable order
let from;
0;
from = _Array$from;
const arr = from([1, 2, 3]);
export { arr };