// `({Array: {from}} = globalThis)` in a bare expression statement - the assignment value
// is discarded, so flattening replaces it with a direct `from = _Array$from;` (polyfill
// always wins). A per-key default `{from = _Array$from}` would pick native first on modern
// engines. The same assignment in an observable context (`console.log(...)`) bails
let from;
({ Array: { from } } = globalThis);
export const arr = from([1, 2, 3]);
