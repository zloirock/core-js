// boundaries of the anchored symbol extraction: only the well-known ITERATOR key takes the
// synth route - an asyncIterator sibling keeps its re-keyed binding beside the extraction;
// a non-binding value keeps the whole prop with a polyfilled key; an effectful init keeps
// the nested form in place (the anchor reshaping requires an effect-free init)
const { Map: { [Symbol.iterator]: a, [Symbol.asyncIterator]: b } } = globalThis;
a;
b;
const { Set: { [Symbol.iterator]: { next } } } = globalThis;
next;
const { WeakSet: { [Symbol.iterator]: c } } = (se(), globalThis);
c;
