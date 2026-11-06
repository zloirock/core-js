// A chain assignment keeps its value - the left the selection always yields (`globalThis`), its dead
// `self` dropped - and its nested static still receives the pure method.
let w;
const { Array: { from } } = w = globalThis || self;
from([1]);
