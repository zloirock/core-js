// computed Symbol keys built from a template literal AND a binary `+` concatenation must
// fold to the static string `'iterator'` so the `in` check routes to the iterator
// polyfill. each fold path uses an independent cycle guard
const suffix = 'to';
// template-literal `itera${suffix}r` -> 'iterator'
const a = Symbol[`itera${suffix}r`] in [];
// binary `+`: 'iter' + 'ator' -> 'iterator'
const k = 'iter' + 'ator';
const b = Symbol[k] in new Set();
export { a, b };
