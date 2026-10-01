// A flatten-declaration sibling with a residual (non-polyfilled) prop: the receiver is memoized and
// the residual stays a destructure off the memo, so the instance polyfill survives. both emitters keep
// the receiver memo at the sibling's source slot (after earlier declarators), so the outputs converge
// and there is no sidecar
const { Array: { from } } = globalThis, { at, other } = getArr();
from([1]);
console.log(at, other);
