// The SPELLING of `Symbol` is the canon's question, not this render's: a capitalised const alias and a proxy-global access name
// the same global, so they re-key like the bare name - read as a bare Identifier only, they leaked raw `Symbol` text into the
// residual.
const Sym = Symbol;
const { Map: { [Sym.iterator]: aliased }, Object: { fromEntries: fe6 } } = globalThis;
aliased;
