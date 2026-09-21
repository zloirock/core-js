// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
const [{ 'from': f, ...r }, o] = [Array, {}];
f([1]);
r;
o;
