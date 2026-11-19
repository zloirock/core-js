// followTypeAliasChain visited Set bails on cycles like `type A = B; type B = A`.
// Verify the chain bails cleanly without exploding subst, and downstream resolution
// recovers via the generic polyfill path
// @ts-expect-error a cyclic type tsc refuses is the shape under test
type A = B;
// @ts-expect-error a cyclic type tsc refuses is the shape under test
type B = A;
declare const a: A;
a.someProp.at(0);
