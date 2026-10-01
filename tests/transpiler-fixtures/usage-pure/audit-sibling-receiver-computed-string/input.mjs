// the sibling-receiver-refs filter excluded only non-computed member access
// (`globalThis.Map`), letting computed-string `globalThis['Map']` through. result
// raced with the outer member-access `_Map` rewrite, corrupted to `__Map`. fixed
// filter: skip both `obj.Map` and `obj['Map']` shapes
const { Array: { from } } = globalThis, y = globalThis['Map'];
export { from, y };
