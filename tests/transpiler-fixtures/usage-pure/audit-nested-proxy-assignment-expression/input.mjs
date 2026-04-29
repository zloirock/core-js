// `({Array: {from}} = globalThis)` in a bare expression statement - the assignment value
// is discarded by the surrounding statement, so flattening replaces it with a direct
// `from = _Array$from;` (polyfill always wins). A per-key destructure default
// `{from = _Array$from}` would pick native first on modern engines, contradicting the
// usage-pure "polyfill always wins" contract. The same assignment in a non-statement
// context (`console.log({Array:{from}} = G)`) bails since the value is observable
let from;
({ Array: { from } } = globalThis);
export const arr = from([1, 2, 3]);
