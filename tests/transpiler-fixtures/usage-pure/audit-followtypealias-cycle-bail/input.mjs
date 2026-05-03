// followTypeAliasChain visited Set bails on cycles like `type A = B; type B = A`.
// Verify the chain bails cleanly without exploding subst, and downstream resolution
// recovers via the generic polyfill path
type A = B;
type B = A;
declare const a: A;
a.someProp.at(0);
