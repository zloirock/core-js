// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
let from, rest;
({ Array: { from }, ...rest } = globalThis);
export { from, rest };
