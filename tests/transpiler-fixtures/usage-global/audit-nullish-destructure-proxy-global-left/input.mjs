// Regression trap (verified non-bug), usage-global companion: a proxy-global LEFT of `??` / `||`
// (`globalThis.Iterator ?? Array`) resolves to Iterator, whose polyfill is injected; the `?? Array`
// fallback is dead because core-js provides Iterator, so Array.from is NOT injected. The destructure
// pattern is pre-formatted multiline so both emitters byte-converge.
const {
  from
} = globalThis.Iterator ?? Array;
from([1, 2, 3]);
