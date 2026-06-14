// a proxy-global HOP receiver (`globalThis.self.Array`) for a symbol-iterator + static-sibling
// destructure: the memoized receiver must COLLAPSE the redundant `self` hop to `_globalThis.Array`
// (the same collapse the retained-residual path applies) - `_globalThis.self.Array` would read `.Array`
// off a runtime-undefined `_globalThis.self` on ie:11 / Node
const { [Symbol.iterator]: it, from } = globalThis.self.Array;
it;
from([1]);
export { it, from };
