import _at from "@core-js/pure/actual/instance/at";
var _ref;
// followTypeAliasChain visited Set bails on cycles like `type A = B; type B = A`.
// Verify the chain bails cleanly without exploding subst, and downstream resolution
// recovers via the generic polyfill path
type A = B;
type B = A;
declare const a: A;
_at(_ref = a.someProp).call(_ref, 0);