// Object-rest keeps the affected assignment pattern native and preserves its RHS value.
// Independent reads and key/default expressions still receive their own polyfills.
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
