// A fully served static mirror still rejects the stored nullish receiver.
let stored;
const { Map: { groupBy, absent = fallback() } } = stored = (record(), globalThis.window?.self);
use(stored, groupBy, absent);
