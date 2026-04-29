// `||` / `??` with unknown capitalized primary + known fallback for a static-only key:
// `MyArray || Iterator` resolving `from`. The primary `MyArray.from` does not resolve
// (unknown receiver, no instance polyfill for `from`). The primary side gates its early
// return on actually resolving to a real polyfill; otherwise the fallback is tried and
// the `Iterator.from` static polyfill is registered as a fallback so it ships and
// runtime `from()` works when MyArray is falsy
const { from } = MyArray || Iterator;
from([1, 2, 3]);
