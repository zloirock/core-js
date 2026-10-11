// an install in an object literal an instance call pushes is decided on the tree as the source wrote it, before
// pure rebuilds the call around it: it never runs, and the read after it takes the pure import
[].push({ shim: typeof Set == 'undefined' && (globalThis.Set = SetShim) });
export const unique = new Set(list);
