// inner ObjectPattern sits at index 1 of the array wrapper, not 0 - the receiver must be the
// element at index 1 (`Array`), so `from` resolves to Array.from. a blind `[0]` descent would
// pick `Object` and miss the polyfill
const [, { from }] = [Object, Array];
from([1, 2, 3]);
