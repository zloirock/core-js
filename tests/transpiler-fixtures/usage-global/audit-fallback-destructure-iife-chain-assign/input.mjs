// chain-assignment containing an IIFE: `x = (() => cond ? Array : Iterator)()`. the
// destructure receiver is a chain-assign whose RHS is an IIFE wrapping the conditional.
// `peelFallbackReceiver`'s loop alternates the chain-assign walk and IIFE peel until
// stable, landing on the ConditionalExpression for per-branch dispatch. validates that
// the peel order doesn't matter -- layered wrappers compose.
let x;
const { from } = x = (() => cond ? Array : Iterator)();
from([1, 2]);
