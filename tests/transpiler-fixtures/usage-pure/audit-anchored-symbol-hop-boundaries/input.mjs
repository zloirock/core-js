// boundaries of the anchored symbol extraction: only the well-known ITERATOR key takes the
// synth route - an asyncIterator sibling keeps its re-keyed binding beside the extraction;
// a non-binding value keeps the whole prop with a polyfilled key; an effectful init folds
// too - its prefix lifts exactly once ahead of the anchored extraction
const { Map: { [Symbol.iterator]: a, [Symbol.asyncIterator]: b } } = globalThis;
a;
b;
const { Set: { [Symbol.iterator]: { next } } } = globalThis;
next;
const { WeakSet: { [Symbol.iterator]: c } } = (se(), globalThis);
c;
// a DEFAULTED value keeps the key-swap instead of extracting: the helper result can be
// defined where the raw read is undefined, so extracting would flip the default's side
const { Iterator: { [Symbol.iterator]: d = null } } = globalThis;
d;
const { Promise: { [Symbol.iterator]: { bind: bnd } = {} } } = globalThis;
bnd;
// a scope-shadowed `Symbol` is the user's own object: its computed key stays a plain
// property read off the anchored constructor - no iterator-helper extraction
{
  const Symbol = { iterator: 'own' };
  const { WeakMap: { [Symbol.iterator]: sw } } = globalThis;
  sw;
}
// an SE-BEARING key keeps the key-swap whenever the host anchors, values and defaults
// alike: the effect stays in the kept key, running exactly once off the rebuilt ctor
const { Set: { [(se2(), Symbol.iterator)]: e1 } } = globalThis;
e1;
const { WeakMap: { [(se3(), Symbol.iterator)]: e2 = null } } = globalThis;
e2;
