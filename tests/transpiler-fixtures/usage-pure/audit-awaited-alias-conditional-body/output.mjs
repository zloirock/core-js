import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
// Multi-hop alias chain whose deepest body is a TSConditionalType. After applySubst
// substitutes the type-arg, resolveAwaitedAnnotation must structurally pick the firing
// branch (post-subst checkType vs extendsType) and recurse on the AST so Awaited semantics
// applies to the picked branch's `Promise<X[]>` -> `X[]`. Without conditional-aware peel,
// resolveAnnotationInContext evaluates the conditional AS-IS and outer Awaited is lost,
// leaving v as Promise<number[]> instead of number[]. Distinct methods per line so each
// trace is unambiguous
type Cond<X> = X extends string ? never : Promise<X[]>;
type Wrap<Y> = Cond<Y>;
declare const v: Awaited<Wrap<number>>;
_atMaybeArray(v).call(v, 0);
_findLastMaybeArray(v).call(v, x => true);