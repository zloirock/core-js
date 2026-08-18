// a computed `Symbol.X` key kept inside an ANCHORED residual re-keys to the polyfilled
// symbol binding (the whole-prop render must not leak raw `Symbol` text - a ReferenceError
// on symbol-less engines): a well-known name uses its dedicated entry, an unknown name
// polyfills the constructor read, and a scope-shadowed `Symbol` stays the user's own object
const { Map: { [Symbol.iterator]: a }, Object: { fromEntries: fe } } = globalThis;
a;
fe(x);
const { Set: { [Symbol.asyncIterator]: b }, Object: { fromEntries: fe2 } } = globalThis;
b;
fe2(y);
const { WeakMap: { [Symbol.foo]: c }, Object: { fromEntries: fe3 } } = globalThis;
c;
fe3(z);
function shadowed(Symbol) {
  const { Map: { [Symbol.iterator]: d }, Object: { fromEntries: fe4 } } = globalThis;
  return [d, fe4];
}
shadowed({ iterator: 'k' });
// the SPELLING of `Symbol` is the canon's question, not this render's: a capitalised const alias and
// a proxy-global access name the same global, so they re-key like the bare name - read as a bare
// Identifier only, they leaked raw `Symbol` text into the residual. a SLOT-mutated `Symbol` is the
// opposite direction and must NOT re-key: the user's replacement does not carry the well-known
// symbols, so the read stays on their object
const Sym = Symbol;
const { Map: { [Sym.iterator]: aliased }, Object: { fromEntries: fe6 } } = globalThis;
aliased;
fe6(u1);
const { Map: { [globalThis.Symbol.iterator]: viaProxy }, Object: { fromEntries: fe7 } } = globalThis;
viaProxy;
fe7(u2);
const { Map: { [globalThis.self.Symbol.iterator]: viaHop }, Object: { fromEntries: fe8 } } = globalThis;
viaHop;
fe8(u3);
// the re-key must not depend on WHICH sibling dispatched the flatten (the key visitor may
// or may not have fired on the original before the residual is cloned / sliced), nor on the
// host kind - an assignment host re-keys the same way
const { Object: { fromEntries: fe5 }, Map: { [Symbol.iterator]: e } } = globalThis;
fe5(w);
e;
let f2, g2;
({ Object: { fromEntries: g2 }, Set: { [Symbol.asyncIterator]: f2 } } = globalThis);
g2(v);
f2;
