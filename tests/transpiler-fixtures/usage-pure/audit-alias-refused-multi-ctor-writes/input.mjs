// ONE binding written from TWO different destructured globals is dirty - its registration is
// refused and member reads stay raw; the value swaps still land in write order
let M;
({ Map: M } = globalThis);
({ Promise: M } = globalThis);
export const r = typeof M.try;
export const q = typeof M.groupBy;
