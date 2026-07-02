import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// Capture-avoidance THROUGH an alias chain: `Mid` forwards its params to `Wrap`, and the arg `A`
// (bound to Q) collides with the chain's own param `A`. The alias-chain walker accumulates each hop
// through the shared capture-avoiding builder, so the collider resolves at the hop instead of being
// recaptured downstream - the receiver resolves to the external interface and its array-typed method
// result drives the array helper.
interface A {
  rows(): string[];
}
interface Wrap<X, Q> {
  item: Q;
}
type Mid<A, Q> = Wrap<A, Q>;
declare const w: Mid<string, A>;
_atMaybeArray(_ref = w.item.rows()).call(_ref, 0);