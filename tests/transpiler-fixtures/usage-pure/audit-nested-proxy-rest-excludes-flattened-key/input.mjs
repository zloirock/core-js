// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
const { Array: { from }, ...rest } = globalThis;
export { from, rest };
