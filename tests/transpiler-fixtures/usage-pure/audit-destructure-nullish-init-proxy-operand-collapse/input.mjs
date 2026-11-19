// retained `??` init: the left operand is a proxy-global member chain, the right a bare global. a left the
// build serves folds the init to it, the right dead - `globalThis.Array`, and `globalThis.Number`, a global
// core-js extends in place
const { from, other } = globalThis.Array ?? Set;
from([1]);
console.log(other);
const { isSafeInteger, other: kept } = globalThis.Number ?? Set;
isSafeInteger(1);
console.log(kept);
