import _Symbol from "@core-js/pure/actual/symbol/constructor";
// Template `${half}${half}ator` reuses the same `half` binding in two interpolation
// slots. Both slots independently resolve to 'iter', so `inner` folds to 'iteriterator' -
// not a known `Symbol.X` key, so the in-check stays as a plain `in`. `Symbol` receiver
// still gets the constructor polyfill on legacy targets
const half = 'iter';
const inner = `${half}${half}ator`;
_Symbol[inner] in obj;