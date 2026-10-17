// bodyless-if assignment host with a DEFAULTED symbol leaf: the key-swap rebuild keeps the
// slot bodyless (single-statement anchored shape)
let bif;
if (cond) ({ Iterator: { [Symbol.iterator]: bif = null } } = globalThis);
export const r = [bif];
