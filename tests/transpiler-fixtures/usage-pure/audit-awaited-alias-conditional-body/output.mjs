import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
// alias chain whose deepest body is a TSConditionalType: after type-arg substitution,
// the firing branch must be picked structurally so `Awaited<...Promise<X[]>>` peels to
// `X[]` rather than leaving the conditional unresolved as `Promise<number[]>`
type Cond<X> = X extends string ? never : Promise<X[]>;
type Wrap<Y> = Cond<Y>;
declare const v: Awaited<Wrap<number>>;
_atMaybeArray(v).call(v, 0);
_findLastMaybeArray(v).call(v, x => true);