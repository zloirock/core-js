// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
const _unused = 'used';
const { from, ...rest } = Array;
