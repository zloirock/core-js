// Two instance methods extracted off ONE non-global receiver in a flatten-declaration sibling: the
// receiver is memoized once, at the sibling's source slot (after the flatten extraction) on both
// emitters - single-eval, source order kept, no sidecar
const { Array: { from } } = globalThis, { at, concat } = getArr();
from([1]);
console.log(at, concat);
