// Fully-consumed nested-proxy flatten with a SE-prefix IIFE: the arrow body inside the SE
// prefix uses an instance-method polyfill needing `var _ref;` for receiver memoize, and that
// binding must live inside the lifted SE slice. If dropped, the lifted snippet references an
// undeclared `_ref` (ReferenceError); if queued at the original offset, the insert lands inside
// the parent overwrite and the bundler aborts.
const { Array: { from } } = ((() => [].values())(), globalThis);
from([]);
