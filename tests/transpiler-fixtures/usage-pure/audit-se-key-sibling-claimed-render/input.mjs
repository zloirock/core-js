// A computed-key destructure keeps its key effect and polyfilled read in the original declaration slot.
// Earlier and later siblings retain their order across ordinary, exported, and bodyless hosts.
const { at, other } = getArr(), { [(e1(), 'flat')]: f } = arr;
export const { findLast } = getList(), { [(e2(), 'flatMap')]: fm } = arr2;
const { includes } = getSet(), { [(e3(), 'toReversed')]: tr } = arr3, { tail } = obj;
// A leading computed-key slot finishes before the next receiver is evaluated.
const { [(e4(), 'toSpliced')]: ts } = arr4, { findLastIndex } = getColl();
console.log(at, other, f, fm, findLast, includes, tr, tail, ts, findLastIndex);
