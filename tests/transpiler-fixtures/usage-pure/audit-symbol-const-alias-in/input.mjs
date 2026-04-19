// `const Sym = Symbol; Sym.iterator in obj` — alias chain resolves through resolveBindingToGlobal,
// asSymbolRef recognizes Sym as Symbol-ref and rewrites to is-iterable check
const Sym = Symbol;
const ok = Sym.iterator in {};
ok;
