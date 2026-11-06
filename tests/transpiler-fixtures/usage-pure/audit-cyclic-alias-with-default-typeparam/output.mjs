import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// followTypeAliasChain has a per-walk visited Set on declarations; cyclic alias `A = B; B = A`
// stops at second visit. With default type-params on each side, subst grows during traversal.
// The visited Set must catch the cycle BEFORE depth-bounds (which would burn O(64) frames per
// resolution). When cycle catches, the resolver returns the last-seen node which is itself a
// TSTypeReference to a cyclic name, falling through to generic dispatch
type A<T = B> = T;
// @ts-expect-error a cyclic type tsc refuses is the shape under test
type B<U = A> = U;
declare const r: A;
// @ts-expect-error the member read is the probe, and the right answer is a type without it
_at(r)?.call(r, 0);
// @ts-expect-error the member read is the probe, and the right answer is a type without it
_includes(r)?.call(r, 'x');