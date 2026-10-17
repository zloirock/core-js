// a paren-scoped optional whose subject is ENTIRELY proxy navigation over a chain-assign root is
// dead: the subject collapses to the always-defined pure root, so the `?.` deopts and the collapse
// owns the emit (a kept guard would memoize the raw `.self` hop - undefined off-engine, silently
// swallowing the polyfill)
let r;
export const optionalRebind = ((r = globalThis).self)?.Array.prototype.findLast;
