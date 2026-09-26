// a spread-shifted array-wrapper feeding an OBJECT-nested destructure resolves the ctor with the
// "inject-if-might" flag, matching the shallower ArrayPattern-rooted sibling: usage-global over-injects
// for the mid-spread and leading-spread shapes. distinct static per line
const [, { Array: { from } }] = [...[1], globalThis];
from([1]);
const [{ Array: { of } }] = [...[], globalThis];
of(2);
