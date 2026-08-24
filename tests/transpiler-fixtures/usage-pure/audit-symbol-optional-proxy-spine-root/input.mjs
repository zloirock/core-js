// a symbol-iterator RECEIVER that is an all-proxy spine over a resolvable global root collapses to
// that root, and the `?.` over an undefinable hop (`globalThis.window`) dies with the erased span -
// the substituted root is always defined. the shared provider fact (`symbolReceiverProxyRoot`)
// decides the root and the optional verdict ONCE, so all three emitters render the same shape.
// the NEGATIVES bound it: a non-proxy leaf below the `?.` is a read that must happen off the
// guarded value, so the guard survives; a non-global root is the genuine helper argument and stays
// whole; and a polyfillable read buried in the erased span (`Promise`) stands down with it instead
// of earning an import nothing spells.
function eff() { return 0; }
// sealed `?.` (paren-terminated) and live mid-chain `?.` reach the same root
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
