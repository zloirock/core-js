// `var Sym = Symbol;` aliases the global; `Sym?.iterator in obj` follows the alias back
// to `Symbol` and rewrites the `in` check as is-iterable. the redundant optional chain
// `?.` on a confirmed-non-null receiver is peeled before alias resolution
var Sym = Symbol;
const x = Sym?.iterator in obj;
export { x };
