import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// Capture-avoidance with a DEFAULT-valued colliding type-param: `Q = A` defaults to the external
// alias `A` (= number[]), but its name collides with the sibling param `A`. Without resolving the
// collider, transitive substitution would re-bind Q -> A -> string, so the receiver would mis-resolve
// to a string and emit the string `at` helper. Resolved correctly, the receiver is number[] and the
// array helper is emitted.
type A = number[];
interface Wrap<A, Q = A> {
  item: Q;
}
declare const w: Wrap<string>;
_atMaybeArray(_ref = w.item).call(_ref, 0);