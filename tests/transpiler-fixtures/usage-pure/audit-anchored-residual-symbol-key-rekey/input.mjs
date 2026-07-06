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
