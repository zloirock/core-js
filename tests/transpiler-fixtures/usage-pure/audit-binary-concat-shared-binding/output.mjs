// `k`'s init chains a BinaryExpression `+`-concat reusing `half` twice. without fork'd
// `seen` per branch, left branch adds 'half' to the shared Set, right branch cycle-gates
// and returns null - parent resolveKey then returns null for `k` itself, plugin falls
// back to generic Symbol injection. with `new Set(seen)` per branch both halves resolve
// to 'iter' independently and `k` folds to 'iteriter' (not Symbol.X, so no polyfill fires)
const half = 'iter';
const k = half + half;
Symbol[k] in obj;