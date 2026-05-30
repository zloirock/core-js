// computed two-hop proxy-global chain: `globalThis['self']` resolves through to the global Array,
// so `Array.from(...)`'s return narrows the chained `.at(-1)` to Array-only (no ambiguous
// es.string.at). exercises the call-return narrow path across a computed proxy-global hop
globalThis["self"].Array.from(x).at(-1);
