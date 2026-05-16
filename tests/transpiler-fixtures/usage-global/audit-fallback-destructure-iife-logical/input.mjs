// IIFE wrapping a LogicalExpression `&&` fallback shape: `(() => Array && Iterator)()`.
// distinct branch shape from ConditionalExpression -- exercises
// `resolveAndDestructureMeta` recursion after IIFE peel. `&&` is always conditional
// (right taken only when left is truthy, else falsy left), so `fromFallback` always
// fires when left/right resolve to different objects. both Array.from and Iterator.from
// polyfills emitted via per-branch enumeration.
const { from } = (() => Array && Iterator)();
from([1, 2]);
