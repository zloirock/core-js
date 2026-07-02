// `const Sym = Symbol; Sym.iterator in obj` - a local alias of `Symbol` should still be
// treated as a symbol reference, so the `in`-check rewrites through the is-iterable polyfill
const Sym = Symbol;
const ok = Sym.iterator in {};
ok;
