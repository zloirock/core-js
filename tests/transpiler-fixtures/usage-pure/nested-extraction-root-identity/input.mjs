// A written alias owns its user keys; a defaulted symbol leaf keeps the raw read.
let root = globalThis;
root = foreign;
let method;
({ y: { at: method } } = root);
({ Array: { [Symbol.iterator]: method = fallback() } } = globalThis);
