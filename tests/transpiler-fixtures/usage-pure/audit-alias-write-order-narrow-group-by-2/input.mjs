// NEGATIVE: an alias hop CAPTURES its source before the aliasing write - the registered span
// gate must anchor at the hop declarator, where the source still holds undefined
let M2;
const HopBefore = M2;
({ Map: M2 } = globalThis);
export const b = HopBefore.groupBy(items, keyFn);
