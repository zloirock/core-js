// `inner` init is `${half}${half}ator` - `half` binding appears twice as interpolation.
// before fork fix, resolveKey would add 'half' to the seen-Set on the first interpolation,
// then cycle-gate to null on the second - plugin would fail to statically reassemble
// the template and skip the Symbol[inner] in-check rewrite. with per-interpolation fork,
// both sides resolve to 'iter' and `inner` folds to 'iteriterator' (resolveKey succeeds
// even though this particular string isn't a Symbol.X key)
const half = 'iter';
const inner = `${half}${half}ator`;
Symbol[inner] in obj;