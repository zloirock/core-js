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
