// Excluding the realm leaf keeps its native property read behind the window guard.
// The prefix runs once; a nullish receiver throws before the nested default.
const { Map: { missing = fallback() } } = (record(), globalThis.window?.self);
use(missing);
