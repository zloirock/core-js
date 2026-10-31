// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
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
