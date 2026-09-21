// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
let from, mapped, others;
({ Array: { from }, mapped = [10].flatMap(String), ...others } = globalThis);
from([11]);
mapped;
