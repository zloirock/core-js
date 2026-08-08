import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// capture-avoidance when the collider is NESTED inside a structural arg `{ item: A }` (not the
// whole arg): the nested free `A` is the external interface, but the sibling param is also `A`.
// the nested collider must resolve against the caller-scope external decl, not recapture through
// the param mapping to `string` - so the receiver stays array-typed and the array helper emits.
interface A { rows(): string[]; }
interface Wrap<A, Q> { item: Q; }
declare const w: Wrap<string, { inner: A }>;
_atMaybeArray(_ref = w.item.inner.rows()).call(_ref, 0);