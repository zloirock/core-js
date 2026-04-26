import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _isIterable from "@core-js/pure/actual/is-iterable";
// `var Sym = Symbol;` aliases the global; `Sym?.iterator in obj` follows the alias back
// to `Symbol` and rewrites the `in` check as is-iterable. the redundant optional chain
// `?.` on a confirmed-non-null receiver is peeled before alias resolution
var Sym = _Symbol;
const x = _isIterable(obj);
export { x };