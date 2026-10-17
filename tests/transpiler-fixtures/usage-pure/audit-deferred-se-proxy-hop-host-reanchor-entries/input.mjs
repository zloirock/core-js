// an SE inside the host's own RHS folds too: the effect runs exactly once in both
// emitters (statement-lift vs in-place sequence is a print-only divergence)
let customW;
let c = 0;
export const { entries } = (({ Map: { customW } } = (c++, globalThis)), Object);
