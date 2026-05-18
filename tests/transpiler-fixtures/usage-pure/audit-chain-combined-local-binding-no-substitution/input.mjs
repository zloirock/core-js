// control for the direct-substitution branch: a LOCAL binding (not a proxy-global) must
// stay verbatim in the chain template. `resolveReceiverPolyfill` returns null for any
// Identifier shadowed by an in-scope binding via `scope.hasBinding`, so the directSubst
// check falls through and the receiver text comes from `unwrapParensSrc` unchanged
const arr = [1, 2];
arr.flat?.().includes(1);
