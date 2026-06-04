// A flatten-declaration sibling with a residual (non-polyfilled) prop: the receiver is memoized and
// the residual stays a destructure off the memo, so the instance polyfill survives. sidecar layout:
// unplugin keeps source order; babel hoists the receiver memo above earlier declarators (a side-effect
// reorder) and folds the rest into one declaration - semantically identical, unplugin's order is faithful
const { Array: { from } } = globalThis, { at, other } = getArr();
from([1]);
console.log(at, other);
