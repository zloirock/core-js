// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
const { from, ...rest } = Array;
const arr = from('hi');
arr.at(-1);
arr.findLast(p => p);
arr.copyWithin(0, 1);
