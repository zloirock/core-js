// A nested static and an instance destructure share one declaration.
// Each claim keeps its own receiver and polyfill when the declaration is rewritten.
const { at } = getArr(), { Array: { from } } = globalThis;
at;
from([1]);
