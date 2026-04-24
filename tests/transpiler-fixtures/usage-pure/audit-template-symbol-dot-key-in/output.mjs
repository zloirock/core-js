// `` `Symbol.${key}` in obj `` - a template literal that looks like `Symbol.<name>` is still
// just a string, not a symbol reference, and `obj` is unresolved, so no polyfill is emitted
const key = 'iter' + 'ator';
`Symbol.${key}` in obj;