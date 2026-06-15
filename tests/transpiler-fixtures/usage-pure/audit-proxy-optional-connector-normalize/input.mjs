// An optional connector directly on a proxy-global root is redundant once the root is substituted
// to the always-defined `_globalThis` (the `?.` guarded against an undefined global, which the
// polyfill never is). Both emitters normalize `globalThis?.self?.Array` to `_globalThis.Array`
// (collapsed `.self` hop, normalized leaf connector) - a deeper `?.` on an unknown leaf stays.
const { from, ...rest } = globalThis?.self?.Array;
from([1]);
