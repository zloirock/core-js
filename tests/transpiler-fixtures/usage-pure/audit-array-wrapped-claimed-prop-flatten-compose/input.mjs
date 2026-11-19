// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
const [{ 'from': f, [Symbol.iterator]: it, ...r }] = [Array];
f([1]);
it;
r;
