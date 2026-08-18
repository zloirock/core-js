import _Map from "@core-js/pure/actual/map/constructor";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Set from "@core-js/pure/actual/set/constructor";
import _Symbol$asyncIterator from "@core-js/pure/actual/symbol/async-iterator";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// a computed `Symbol.X` key kept inside an ANCHORED residual re-keys to the polyfilled
// symbol binding (the whole-prop render must not leak raw `Symbol` text - a ReferenceError
// on symbol-less engines): a well-known name uses its dedicated entry, an unknown name
// polyfills the constructor read, and a scope-shadowed `Symbol` stays the user's own object
const {
  [_Symbol$iterator]: a
} = _Map;
const fe = _Object$fromEntries;
a;
fe(x);
const {
  [_Symbol$asyncIterator]: b
} = _Set;
const fe2 = _Object$fromEntries;
b;
fe2(y);
const {
  [_Symbol.foo]: c
} = _WeakMap;
const fe3 = _Object$fromEntries;
c;
fe3(z);
function shadowed(Symbol) {
  const {
    [Symbol.iterator]: d
  } = _Map;
  const fe4 = _Object$fromEntries;
  return [d, fe4];
}
shadowed({
  iterator: 'k'
});
// the SPELLING of `Symbol` is the canon's question, not this render's: a capitalised const alias and
// a proxy-global access name the same global, so they re-key like the bare name - read as a bare
// Identifier only, they leaked raw `Symbol` text into the residual. a SLOT-mutated `Symbol` is the
// opposite direction and must NOT re-key: the user's replacement does not carry the well-known
// symbols, so the read stays on their object
const Sym = _Symbol;
const {
  [_Symbol$iterator]: aliased
} = _Map;
const fe6 = _Object$fromEntries;
aliased;
fe6(u1);
const {
  [_Symbol$iterator]: viaProxy
} = _Map;
const fe7 = _Object$fromEntries;
viaProxy;
fe7(u2);
const {
  [_Symbol$iterator]: viaHop
} = _Map;
const fe8 = _Object$fromEntries;
viaHop;
fe8(u3);
// the re-key must not depend on WHICH sibling dispatched the flatten (the key visitor may
// or may not have fired on the original before the residual is cloned / sliced), nor on the
// host kind - an assignment host re-keys the same way
const fe5 = _Object$fromEntries;
const {
  [_Symbol$iterator]: e
} = _Map;
fe5(w);
e;
let f2, g2;
g2 = _Object$fromEntries;
({
  [_Symbol$asyncIterator]: f2
} = _Set);
g2(v);
f2;