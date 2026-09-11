// chain-assignment rhs holding an IIFE-prefix-SE: `(a = IIFE()).resolve(1)` where IIFE
// returns Promise. The emitter preserves the chain-assignment as a SequenceExpression
// prefix; member-resolution must not push the inner root call onto sideEffects again
// (the outer `(a = IIFE())` already preserves it), so `calls++` runs exactly once.
let a;
let calls = 0;
const r = (a = (() => { calls++; return Promise; })()).resolve(1);
[r, a, calls];
