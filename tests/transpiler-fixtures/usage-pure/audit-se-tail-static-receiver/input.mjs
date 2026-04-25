// SE-tail receiver: `Symbol` / `Map` / `Promise` in the tail of a SequenceExpression with
// SE-bearing preceding element. plugin's polyfill-emit subsumes the receiver Identifier; without
// a skippedNodes seed the identifier visitor queues a parallel `X -> _X` transform whose needle
// composes into the outer's `_X$Y` replacement text as `__X$Y` (substring `X` inside the outer's
// emit gets re-prefixed). expected: single-underscore polyfill identifiers, parity with babel
const a = (tag`hi`, Symbol).iterator in obj;
const b = (foo(), Map).groupBy([1], k => k);
const c = (x = 1, Promise).try(() => 1);
const d = (foo(), Symbol).asyncIterator;
export { a, b, c, d };
