// optional-call IIFE returning `Promise`, then `.resolve(1)` on it. KNOWN SEMANTIC SHIFT:
// the source `?.()` short-circuits when `fn` is null/undefined, but the emit lowers the
// receiver to a SequenceExpression and unconditionally calls `_Promise$resolve(1)`, so a null
// `fn` now returns a resolved Promise. Accepted under "polyfill always wins"; kept as a marker.
let calls = 0;
const fn = () => { calls++; return Promise; };
const r = fn?.().resolve(1);
[r, calls];
