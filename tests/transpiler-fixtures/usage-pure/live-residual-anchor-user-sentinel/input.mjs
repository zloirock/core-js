// A user binding resembling a sentinel is not evidence that its property was consumed.
// The unknown Array leaf stays live beside the served constructor sibling.
const { Array: { missing: _unused }, Promise: P } = globalThis;
export { _unused, P };
