// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
let from, rest, fromEntries, inner;
({ Array: { from }, ...rest } = globalThis);
({ Object: { fromEntries, ...inner } } = globalThis);
