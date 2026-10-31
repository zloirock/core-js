// Inner symbol claims share the stored guarded receiver with the residual.
// The native capture keeps the store, prefix and receiver read single-evaluated.
let held;
const { Map: { [Symbol.iterator]: iterator, missing = fallback() } } = held = (record(), globalThis.window?.self);
use(held, iterator, missing);

// A fully served static mirror still rejects the stored nullish receiver.
let stored;
const { Map: { groupBy, absent = fallback() } } = stored = (record(), globalThis.window?.self);
use(stored, groupBy, absent);

// A fully consumed constructor receiver retains the stored value's throwing read.
let constructor;
const { groupBy: group } = constructor = (record(), globalThis.window?.Map);
use(constructor, group);
