import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _isIterable from "@core-js/pure/actual/is-iterable";
// `const Sym = Symbol; Sym.iterator in obj` — alias chain resolves through resolveBindingToGlobal,
// asSymbolRef recognizes Sym as Symbol-ref and rewrites to is-iterable check
const Sym = _Symbol;
const ok = _isIterable({});
ok;