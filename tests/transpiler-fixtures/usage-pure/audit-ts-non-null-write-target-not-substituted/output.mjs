import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// usage-pure cannot rewrite a global at a write position to a frozen import binding. a TS-non-null
// assertion keeps the identifier in a read-looking slot, so the write checks peel the wrapper
// first: the assignment target `Map!` and the for-of head `Set!` stay the global (no import),
// while a genuine read - `new WeakMap!()` - is still substituted to the polyfill
Map! = createMap();
for (Set! of collections) noop();
const live = new _WeakMap();