// an identity IIFE with an EFFECTFUL argument is not discardable (the call evaluation runs
// the argument, and the harvest does not rescue argument effects) - the mirror keeps the call
// and swaps the value leaf inside the argument, so the effect runs exactly as native
let c = 0;
const { Array: { from } } = (g => g)((c++, globalThis));
from([1]);
