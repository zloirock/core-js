// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
let sideEffectCount = 0;
const sideEffect = () => sideEffectCount++;
const { Array: { from }, ...rest } = (sideEffect(), globalThis);
