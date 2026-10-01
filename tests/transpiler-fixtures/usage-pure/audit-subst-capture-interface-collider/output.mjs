import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref;
// Capture-avoidance with an INTERFACE collider: the explicit arg `E` (bound to Q) names the external
// interface `E`, but collides with the sibling param `E`. Resolving the collider kind-independently
// (the interface's structural members) lets the receiver resolve to the interface, so its array-typed
// method result drives the array helper. Without it, Q recaptures to `number` and the call bails.
interface E {
  tags(): string[];
}
interface Wrap<E, Q> {
  item: Q;
}
declare const w: Wrap<number, E>;
_includesMaybeArray(_ref = w.item.tags()).call(_ref, "x");