// `var Sym = Symbol;` aliases the global Symbol; `Sym?.iterator in obj` walks
// the alias through resolveBindingToGlobal and routes through is-iterable.
// the optional chain `?.` on a confirmed-non-null receiver is redundant but must not
// disturb the in-detection - asSymbolRef peels ChainExpression up front.
var Sym = Symbol;
const x = Sym?.iterator in obj;
export { x };
