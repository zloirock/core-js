// computed-key proxy global: `globalThis['Array']` resolves to the Array constructor, so the
// `.from(...)` return-type narrows the chained `.at(-1)` to Array-only (not the ambiguous
// Array|String `.at` that would also pull es.string.at)
globalThis["Array"].from(x).at(-1);
