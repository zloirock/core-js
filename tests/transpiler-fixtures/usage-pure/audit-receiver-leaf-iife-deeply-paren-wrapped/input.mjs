// IIFE receiver wrapped in many paren layers: `((((() => Array))()).from(...)`. peelIIFEReturn
// (called from unwrapReceiverLeaf) must reach `Array` through the paren stack. uses two
// distinct invocations on different polyfillable receivers to surface the helper's behavior:
// Array.from and Promise.allSettled. depth here is below the 64-hop cap
const arr = (((() => Array))()).from([1, 2]);

const settled = (((() => Promise))()).allSettled([1, 2]);

arr;
settled;
