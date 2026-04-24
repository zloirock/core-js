import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _isIterable from "@core-js/pure/actual/is-iterable";
// `const Sym = Symbol; Sym.iterator in obj` - a local alias of `Symbol` should still be
// treated as a symbol reference, so the `in`-check rewrites through the is-iterable polyfill
const Sym = _Symbol;
const ok = _isIterable({});
ok;