// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
const { Array: { from }, ...rest } = globalThis;
const xs = from('hi');
xs.at(0);
xs.includes('h');
xs.flat();
