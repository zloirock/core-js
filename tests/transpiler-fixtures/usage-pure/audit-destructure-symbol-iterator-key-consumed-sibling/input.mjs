// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
const { [Symbol.iterator]: it, from, ...rest } = globalThis.Array;
it;
from([1]);
export { it, from, rest };
