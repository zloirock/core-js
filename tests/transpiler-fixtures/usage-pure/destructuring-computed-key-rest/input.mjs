// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
const key = 'from';
const { [key]: value, ...rest } = Array;
