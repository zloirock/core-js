// Capture-avoidance must NOT fire on a DEFAULT-valued colliding type-param. The default `Q = A`
// lives in the declaration scope, where the sibling type-param `A` SHADOWS the outer `type A`, so
// `Wrap<string>` makes `Q = A = string` per TS - even though an outer `type A = number[]` exists.
// The receiver `w.item` is therefore `string` and the STRING `at` helper must be emitted; resolving
// the default to the external alias (the explicit-collider path) would be wrong here.
type A = number[];
interface Wrap<A, Q = A> { item: Q; }
declare const w: Wrap<string>;
w.item.at(0);
