// IIFE wrapping a LogicalExpression `&&` fallback shape: `(() => Array && Iterator)()`.
// distinct branch shape from ConditionalExpression, resolved recursively after the IIFE
// peels. `&&` is always conditional (right taken only when left is truthy, else falsy
// left), so when the two sides resolve to different objects both must contribute: Array.from
// and Iterator.from emitted via per-branch enumeration.
const { from } = (() => Array && Iterator)();
from([1, 2]);
