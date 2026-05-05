// followTypeAliasChain has a per-walk visited Set on declarations; cyclic alias `A = B; B = A`
// stops at second visit. With default type-params on each side, subst grows during traversal.
// The visited Set must catch the cycle BEFORE depth-bounds (which would burn O(64) frames per
// resolution). When cycle catches, the resolver returns the last-seen node which is itself a
// TSTypeReference to a cyclic name, falling through to generic dispatch
type A<T = B> = T;
type B<U = A> = U;
declare const r: A;
r.at?.(0);
r.includes?.('x');
