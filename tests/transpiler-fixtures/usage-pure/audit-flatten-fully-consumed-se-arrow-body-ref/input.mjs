// Fully-consumed nested-proxy flatten with a SE-prefix IIFE: the arrow body inside the
// SE prefix uses an instance-method polyfill that needs `var _ref;` for receiver memoize.
// That `_ref` binding lives inside the lifted SE slice, not the surrounding declaration.
// If it is dropped, the lifted snippet references an undeclared `_ref` and throws
// ReferenceError at runtime; if it is queued at the original offset, the bundler aborts
// on an insert that lands inside the parent overwrite.
const { Array: { from } } = ((() => [].values())(), globalThis);
from([]);
