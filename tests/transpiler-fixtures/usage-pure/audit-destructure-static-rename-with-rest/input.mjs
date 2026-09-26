// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
const { from: customFrom, ...rest } = Array;
const xs = customFrom('hi');
xs.at(0);
xs.findLastIndex(p => p);
xs.flat();
