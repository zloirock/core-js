import _Iterator$from from "@core-js/pure/actual/iterator/from";
// Regression trap (verified non-bug): a proxy-global on the LEFT of `??` / `||`
// (`globalThis.Iterator ?? Array`) is treated like a bare `Iterator`. core-js PROVIDES
// the Iterator ponyfill, so the left always resolves and the `?? Array` fallback is dead.
// Emitting Iterator.from is correct, matching bare `Iterator ?? Array`.
const from = _Iterator$from;
from([1, 2, 3]);