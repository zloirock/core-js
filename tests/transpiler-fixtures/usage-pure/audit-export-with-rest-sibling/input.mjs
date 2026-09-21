// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
export const { Array: { from }, ...rest } = globalThis;
[from, rest];
