// a MUTATED ctor (`globalThis.Map = Shim` in-file) must read off the PATCHED native binding, not the pure
// import - the user's replacement wins. the multi-ctor anchor bails the mutated ctor (mirrors the single-ctor
// anchorSlotMutated bail), so the pattern stays on the native residual; the poly sibling still extracts
globalThis.Map = function () {};
const { Array: { from }, Map: { customY } } = globalThis;
export const out = [from, customY];
