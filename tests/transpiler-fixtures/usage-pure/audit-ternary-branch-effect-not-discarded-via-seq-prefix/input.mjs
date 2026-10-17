// a sequence prefix in a branch runs only on that branch - the mirror keeps it in place
let c3 = Math.random() < 0.5;
let eff = () => {};
const { Map: { groupBy: mapGroupBy } } = c3 ? (eff(), globalThis) : globalThis;
export const viaSeqPrefix = mapGroupBy([1, 2], v => v % 2);
