// the const-alias-leaf canonicalization through the OBJECT-nested resolver (no array wrapper): a sibling
// code path to the array-wrapper one. `const A = Array; const { x: { from } } = { x: A }` must resolve the
// leaf `A` back to `Array` (via receiver-name resolution) so the static `from` polyfills - not drop on the alias
const A = Array;
const { x: { from } } = { x: A };
from([1, 2]);
