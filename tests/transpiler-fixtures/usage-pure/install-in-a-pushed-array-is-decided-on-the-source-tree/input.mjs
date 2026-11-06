// an install in an array literal an instance call pushes is decided on the tree as the source wrote it, before
// pure rebuilds the call around it: it never runs, and the read after it takes the pure import
[].push([typeof WeakMap == 'undefined' && (globalThis.WeakMap = WeakMapShim)]);
export const cache = new WeakMap();
