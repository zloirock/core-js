// Nested destructure `const { Array: { from } } = self` - `self` works as a
// proxy-global just like `globalThis`. Plugin flattens through the nested pattern
// and rewrites `from` to the pure `Array.from` polyfill.
const { Array: { from } } = self;
from([1, 2, 3]);
