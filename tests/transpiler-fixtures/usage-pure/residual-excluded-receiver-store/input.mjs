// A stored optional receiver preserves the stored value and the guarded member read.
// Exclusion must not turn the native leaf into an unconditional constructor import.
let held;
const { Map: { missing = fallback() } } = held = (record(), globalThis.window?.self);
use(held, missing);
