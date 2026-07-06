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