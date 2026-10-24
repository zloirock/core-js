// the same hop AFTER the write reads the live constructor - narrows like the direct form
let M3;
({ Map: M3 } = globalThis);
const HopAfter = M3;
export const c = HopAfter.groupBy(items, keyFn);
