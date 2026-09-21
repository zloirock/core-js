// Computed keys under a constructor hop keep their original effects and receive pure statics.
// Sibling statics share the mirror; a missing native constructor must not cause an extra throw.
let n = 0;
const { Promise: { [(n++, 'race')]: sole } } = globalThis;
const { Promise: { [(n++, 'all')]: sibling, allSettled } } = globalThis;
export const result = [typeof sole, typeof sibling, typeof allSettled, n];
