// assignment-cascade statement order (shared canon, probed per shape): an extraction from a
// TOP-LEVEL aliased or shorthand binding prop precedes the surviving residual, and a rest-forced
// sentinel keeps that order; a NESTED pattern prop's extraction follows the residual; with no
// residual, extractions keep source order
let a, b;
({ from: a, deep: { other: b } } = globalThis.Array);
use(a, b);

let s, f, x;
({ Symbol: s, Array: { from: f }, deep: { x } } = globalThis);
use(s, f, x);

let g;
({ of: g, ...rest } = globalThis.Array);
use(g, rest);

let inner;
({ fromEntries, ...inner } = globalThis.Object);
use(fromEntries, inner);
