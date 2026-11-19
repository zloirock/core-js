// an IIFE body effect in a branch stays conditional - the mirror swaps the returned leaf
let c4 = Math.random() < 0.5;
let hits = 0;
const { Object: { groupBy: objGroupBy } } = c4 ? (() => { hits++; return globalThis; })() : globalThis;
export const viaIifeBody = objGroupBy([1, 2], v => v % 2);
