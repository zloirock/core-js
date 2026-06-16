import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// Capture-avoidance for an explicit arg where the collider is NESTED inside a structural arg, not
// the whole arg: the explicit arg `{ item: A }` (bound to Q) names the external interface `A` but
// collides with the sibling param `A`. The arg is written in the CALLER scope, so the nested free
// `A` is the external decl, yet the transitive subst would recapture it through the param's mapping
// (Q -> { item: A } -> { item: string }). Resolving nested colliders against the external inline
// keeps `A` the interface, so the receiver resolves to its array-typed member and the array helper
// is emitted. Without it, the nested `A` recaptures to `string` and the call bails.
interface A {
  rows(): string[];
}
interface Wrap<A, Q> {
  item: Q;
}
declare const w: Wrap<string, {
  inner: A;
}>;
_atMaybeArray(_ref = w.item.inner.rows()).call(_ref, 0);