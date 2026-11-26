// ArrayPattern-wrapped destructure at a non-zero element index (`[, { from, of }] = [Set,
// globalThis.Array]`); the init descent picks index 1 and resolves the proxy-global member
// leaf to `Array`, so the dep is injected
const [, { from, of }] = [Set, globalThis.Array];
from([1, 2, 3]);
of(1);
