// A nested static before another static destructure retains both claims.
// Declaration rewriting must work in either sibling order.
const { Array: { from } } = globalThis, { of } = Array;
of;
from([1]);
