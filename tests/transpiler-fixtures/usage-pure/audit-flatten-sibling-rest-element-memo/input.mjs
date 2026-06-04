// A flatten-declaration sibling with a rest element: the polyfilled key is excluded via a synthetic
// placeholder and the receiver memoized, so the instance polyfill survives. sidecar layout: unplugin
// keeps source order; babel hoists the receiver memo above earlier declarators (a side-effect reorder)
// and folds the rest into one declaration - semantically identical, unplugin's order is faithful
const { Array: { from } } = globalThis, { at, ...rest } = getArr();
from([1]);
console.log(at, rest);
