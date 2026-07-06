// A flatten-declaration sibling with a rest element: the polyfilled key is excluded via a synthetic
// placeholder and the receiver memoized, so the instance polyfill survives. both emitters keep the
// receiver memo at the sibling's source slot (after earlier declarators), so the outputs converge and
// there is no sidecar
const { Array: { from } } = globalThis, { at, ...rest } = getArr();
from([1]);
console.log(at, rest);
