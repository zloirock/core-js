import _Array$from from "@core-js/pure/actual/array/from";
(0, () => Array)();
// `(0, () => Array)()` - SequenceExpression-wrapped IIFE callee. the runtime-transparent
// peel stops at SE; the zero-arg IIFE peel used to bail because callee.type !== Arrow
// after only paren / TS peel. extended to also peel SE-tail (then re-peel) so the IIFE
// recognition fires through comma-prefix wrappers and lifts the body's Array reference,
// surfacing the polyfill import for the chained `.from` static
const from = _Array$from;
from([1, 2, 3]);