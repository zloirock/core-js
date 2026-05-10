// chain-assignment buried inside the receiver chain, not at its top level;
// the assignment must still run when the polyfill replaces the receiver
let a;
const r = ((a = globalThis).Array).from([1, 2, 3]);
[r, a];
