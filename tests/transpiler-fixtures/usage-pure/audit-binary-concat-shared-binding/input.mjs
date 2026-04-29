// `k = half + half` reuses `half` twice inside a `+`-concat. Both sides independently
// resolve to 'iter', so `k` folds to 'iteriter' - not a known `Symbol.X` key, so the
// `in obj` check is NOT routed through the symbol-keyed dispatch (e.g. is-iterable).
// `Symbol` receiver still needs its constructor polyfill on legacy targets
const half = 'iter';
const k = half + half;
Symbol[k] in obj;
