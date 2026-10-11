// an install in an argument of an optional instance call is decided on the tree as the source wrote it, before
// pure rebuilds the call around it: it never runs, and the read after it takes the pure import
list?.at(typeof WeakSet == 'undefined' && (globalThis.WeakSet = WeakSetShim));
export const seen = new WeakSet();
