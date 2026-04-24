// Template `${half}${half}ator` reuses the same `half` binding in two interpolation
// slots. Both slots independently resolve to 'iter', so `inner` folds to
// 'iteriterator' - not a known `Symbol.X` key, so `Symbol[inner] in obj` is left
// untouched.
const half = 'iter';
const inner = `${half}${half}ator`;
Symbol[inner] in obj;