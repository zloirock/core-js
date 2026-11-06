// The served constructor sibling leaves the user-named unknown leaf in its native pattern.
// The unknown Array leaf stays live beside the served constructor sibling.
const { Array: { missing: _unused }, Promise: P } = globalThis;
export { _unused, P };
