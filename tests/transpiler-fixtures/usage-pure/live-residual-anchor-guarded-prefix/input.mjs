// A prefix before an optional realm receiver runs before the guarded constructor read.
// Absence still throws before the residual evaluates its own default.
const { Map: { missing = fallback() } } = (record(), globalThis.window?.self);
use(missing);
