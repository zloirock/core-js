// Captured literal navigation stays a native slot read before the instance dispatch.
let from, at;
({ C: { from }, entries: { at } } = { C: Array, entries: [1] });
use(from, at);
