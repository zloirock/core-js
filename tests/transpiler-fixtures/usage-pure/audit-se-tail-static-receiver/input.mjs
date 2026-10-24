// comma-tail receiver: `Symbol` / `Map` / `Promise` in the tail of a comma expression
// with a side-effect-bearing prefix. the polyfill emit subsumes the receiver identifier;
// without seeding it as skipped the identifier visitor queues a parallel `X -> _X` rewrite
// that re-prefixes `X` inside the outer's `_X$Y` emit as `__X$Y`. expected: single-underscore
// identifiers, parity with babel.
const a = (tag`hi`, Symbol).iterator in obj;
const b = (foo(), Map).groupBy([1], k => k);
const c = (x = 1, Promise).try(() => 1);
const d = (foo(), Symbol).asyncIterator;
export { a, b, c, d };
