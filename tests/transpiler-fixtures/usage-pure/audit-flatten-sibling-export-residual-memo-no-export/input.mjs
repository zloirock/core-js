// An exported flatten-declaration whose sibling needs a receiver memo: the memo temp stays a
// non-exported `const` while the user bindings are re-exported, matching babel (the memo must not
// leak into the module's export namespace). both emitters keep the memo at the sibling's source slot
// (after earlier declarators), so the outputs converge and there is no sidecar
export const { Array: { from } } = globalThis, { at, other } = getArr();
from([1]);
console.log(at, other);
