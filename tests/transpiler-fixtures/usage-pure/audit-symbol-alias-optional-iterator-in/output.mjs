import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _isIterable from "@core-js/pure/actual/is-iterable";
// `var Sym = Symbol;` aliases the global Symbol; `Sym?.iterator in obj` walks
// the alias through resolveBindingToGlobal and routes through is-iterable.
// the optional chain `?.` on a confirmed-non-null receiver is redundant but must not
// disturb the in-detection - asSymbolRef peels ChainExpression up front.
var Sym = _Symbol;
const x = _isIterable(obj);
export { x };