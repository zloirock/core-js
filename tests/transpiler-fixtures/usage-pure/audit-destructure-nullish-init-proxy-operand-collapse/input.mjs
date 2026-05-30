// retained `??` init: the left operand is a proxy-global member chain, the right a bare global.
// each operand is polyfilled in place (`_globalThis.Array ?? _Set`) so neither ReferenceErrors
const { from, other } = globalThis.Array ?? Set;
from([1]);
console.log(other);
