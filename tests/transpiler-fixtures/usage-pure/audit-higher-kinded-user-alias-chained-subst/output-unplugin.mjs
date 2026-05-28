import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// HKT splice through two alias hops: Wrap2 forwards G/Y to Wrap, then Wrap splices G=Boxed.
// each hop accumulates subst, the splice fires on the final inner ref where G is bound
type Boxed<T> = { val: T };
type Wrap<F, X> = F<X>;
type Wrap2<G, Y> = Wrap<G, Y>;
declare const x: Wrap2<Boxed, string[]>;
_atMaybeArray(_ref = x.val).call(_ref, 0);