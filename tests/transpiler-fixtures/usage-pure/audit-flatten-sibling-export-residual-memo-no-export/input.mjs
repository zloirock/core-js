// An exported flatten-declaration whose sibling needs a receiver memo: the memo temp stays a
// non-exported `const` while the user bindings are re-exported, matching babel (the memo must not
// leak into the module's export namespace). sidecar layout: unplugin keeps source order; babel hoists
// the memo above earlier declarators (a side-effect reorder) and folds the rest - semantically identical
export const { Array: { from } } = globalThis, { at, other } = getArr();
from([1]);
console.log(at, other);
