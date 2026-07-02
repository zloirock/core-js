// A flatten-declaration sibling whose instance entry carries a default: the polyfilled receiver is
// memoized into a ref so the default-guard evaluates it once, matching the standalone byStatement emit
const { Array: { from } } = globalThis, { at = fallback } = getArr();
from([1]);
console.log(at);
