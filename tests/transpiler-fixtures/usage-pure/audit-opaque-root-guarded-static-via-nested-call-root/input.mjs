// a NESTED provable wrapper (`f` returns `g()` which returns the global) proves through the
// same inline canon, layer by layer
const ng = () => globalThis;
const nf = () => ng();
export const viaNestedCallRoot = nf()?.window?.self?.Array.of(21).at(0);
