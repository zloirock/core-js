// `'from' in (Array ?? Object)` reads its decided left - `Array` always yields - and folds like `'from' in
// Array`, as does a left the build serves off the realm (`globalThis.Number`, which core-js extends in place);
// over a left it does not serve (`globalThis.WeakRef`) the test cannot fold to a single static receiver and
// stays raw, though only the right has the key. The `Array.from` / `Object.fromEntries` usages in the
// following statements get polyfilled independently either way.
const a = 'from' in (Array ?? Object);
const b = Array.from(src);
const c = Object.fromEntries(pairs);
export { a, b, c };
const d = 'isInteger' in (globalThis.Number ?? Object);
export { d };
const e = 'groupBy' in (globalThis.WeakRef ?? Object);
export { e };
