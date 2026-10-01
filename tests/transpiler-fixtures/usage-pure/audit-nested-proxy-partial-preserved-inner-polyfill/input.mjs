// Both nested static bindings receive pure methods.
// Their imports are defined, so a default reading the original static remains dead.
const { Array: { from, of = Array.of } } = globalThis;
from([1, 2]);
of(3);
