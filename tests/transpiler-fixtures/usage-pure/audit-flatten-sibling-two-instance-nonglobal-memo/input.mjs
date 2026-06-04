// Two instance methods extracted off ONE non-global receiver in a flatten-declaration sibling: the
// receiver is memoized once. sidecar layout: unplugin keeps the memo at the sibling's source slot;
// babel hoists it above the flatten extraction (the general case reorders side effects across
// declarators) - benign here (the flatten init is pure), semantically identical, both single-eval
const { Array: { from } } = globalThis, { at, concat } = getArr();
from([1]);
console.log(at, concat);
