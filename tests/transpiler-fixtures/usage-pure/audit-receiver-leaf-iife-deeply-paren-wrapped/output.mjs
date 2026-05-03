import _Array$from from "@core-js/pure/actual/array/from";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
// IIFE receiver wrapped in many paren layers: `((((() => Array))()).from(...)`. peelIIFEReturn
// (called from unwrapReceiverLeaf) must reach `Array` through the paren stack. uses two
// distinct invocations on different polyfillable receivers to surface the helper's behavior:
// Array.from and Promise.allSettled. depth here is below the 64-hop cap
const arr = _Array$from([1, 2]);
const settled = _Promise$allSettled([1, 2]);
arr;
settled;