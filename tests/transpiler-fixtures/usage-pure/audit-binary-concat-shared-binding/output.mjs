// `k = half + half` reuses `half` twice inside a `+`-concat. Both sides independently
// resolve to 'iter', so `k` folds to 'iteriter' - not a known `Symbol.X` key.
// `Symbol[k] in obj` is left untouched (no polyfill fires for the unknown key).
const half = 'iter';
const k = half + half;
Symbol[k] in obj;