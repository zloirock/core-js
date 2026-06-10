// a MULTI-declarator host: the sibling declarator is untouched, and the effectful `&&` init
// of the destructuring declarator gets the right-operand mirror - the per-declarator purity
// check must inspect the PROP's own init, not just single-declarator hosts (a shared-host
// check let the flatten silently drop the effect)
let m = 1;
let c = 0;
const a = 1, { Array: { from } } = (c++, m) && globalThis;
from([a]);
