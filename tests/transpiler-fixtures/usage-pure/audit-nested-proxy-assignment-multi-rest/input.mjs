// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
let from, fromEntries, rest;
({ Array: { from }, Object: { fromEntries }, ...rest } = globalThis);
