// a paren around the CALLEE of an optional call is grouping, not a chain terminator: it short-circuits
// exactly like the bare spelling, so the chain combine looks through it and owns the whole span. left
// to the standalone channel the span was split inside the paren token and the build failed outright.
// a paren SEALING the optional sub-chain is the opposite - there the `?.` stops short-circuiting what
// follows, and the combine must still refuse.
const arr = [[1]];
const box = { pick: () => arr };
export const parenCalleeThenCall = (arr.flat)?.().at(0);
export const doubleParenCallee = ((arr.flat))?.().at(0);
export const parenCalleeThenGet = (arr.flat)?.().at;
export const parenCalleeAlone = (arr.flat)?.();
// NEGATIVE: the paren seals the optional sub-chain, so the tail reads the sealed value
export const sealedSubChain = (arr.flat?.()).includes(1);
// NEGATIVE: a non-polyfillable callee under the same parens
export const nonPolyParenCallee = (box.pick)?.().at(0);
