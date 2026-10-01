// Global presence guard; the pure twin exercises receiver capture.
// A retained assignment reuses its captured selecting receiver for both instance reads.
// A user-written alias with a similar name still needs a snapshot before getter effects.
let name, values;
({ name, values } = globalThis.vv || Object);
let _ref = source;
const { other, at } = _ref;
use(name, values, other, at);
