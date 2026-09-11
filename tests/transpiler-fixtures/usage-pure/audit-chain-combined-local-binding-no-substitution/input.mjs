// control for the direct-substitution branch: a LOCAL binding (not a proxy-global) must
// stay verbatim in the chain template. receiver-polyfill resolution returns null for any
// Identifier shadowed by an in-scope binding via `scope.hasBinding`, so the direct-subst
// check falls through and the receiver text comes from a paren-peel unchanged
const arr = [1, 2];
arr.flat?.().includes(1);
