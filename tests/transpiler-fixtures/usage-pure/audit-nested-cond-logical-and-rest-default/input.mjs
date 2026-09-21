// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
const guard = 1;
const { Array: { from, ...rest } } = guard && globalThis;
typeof from;
