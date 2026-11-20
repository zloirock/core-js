// Reading Symbol.iterator from the result of a sealed chain throws when window is absent.
// An open chain skips the lookup. Both use the iterator helper on a present realm.
function eff() { return 0; }
export const sealed = (globalThis.window?.self.window)[Symbol.iterator];
export const live = globalThis.window?.self.window[Symbol.iterator];
// a discarded region's own claim stands down with the span it sits in
export const buried = ((Promise, globalThis).window?.self.window)[Symbol.iterator];
// NEGATIVE: a non-proxy leaf below the `?.` keeps the guard - the read happens off the hop
export const kept = globalThis.window?.self.window.Array[Symbol.iterator];
// NEGATIVE: a non-global root is the genuine argument
const o = { p: { q: [1] } };
export const plain = (o.p?.q)[Symbol.iterator];
// a KEPT root (a chain-assign storing a value that is not provably the global) re-hangs its guard
let w;
export const keptRoot = (w = globalThis.window)?.self[(eff(), Symbol.iterator)];
export { o, w };
