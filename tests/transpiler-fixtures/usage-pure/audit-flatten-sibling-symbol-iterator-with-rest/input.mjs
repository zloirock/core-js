// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
const obj = globalThis;
const { Array: { from }, [Symbol.iterator]: iter, ...rest } = obj;
console.log(from, iter, rest);
