// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
const { [Symbol.iterator]: it, from, of, ...rest } = globalThis.Array;
it;
from([1]);
of(2, 3);
export { it, from, of, rest };
