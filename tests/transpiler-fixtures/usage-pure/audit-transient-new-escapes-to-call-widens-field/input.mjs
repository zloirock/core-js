// A transient `new C()` passed as a call argument ESCAPES: the callee could mutate its `items`
// field, so the instance-field narrow bails and `.at` inside `getFirst` gets the generic polyfill.
// Contrast the optional-call member-receiver case, where the transient is read-only and the narrow
// is kept.
declare function sink(x: unknown): void;
class C { items = [1, 2, 3]; getFirst() { return this.items.at(0); } }
const c = new C();
sink(new C());
c.getFirst();
