// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
const [{ [Symbol.iterator]: iterator, Array: { from }, ...rest }] = [globalThis];
export { iterator, from, rest };
