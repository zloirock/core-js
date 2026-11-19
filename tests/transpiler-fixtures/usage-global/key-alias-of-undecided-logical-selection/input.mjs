// In usage-global a key alias declared with an undecided logical selection may hold any arm it can
// read, so each one injects its method, as the selection spelled in the member does: `findLast` behind
// an `&&`, `findLastIndex` behind an `||`, `toSorted` behind a `??`
const behindAnd = flag && 'findLast';
export const viaAnd = (list, fn) => list[behindAnd](fn);
const behindOr = flag || 'findLastIndex';
export const viaOr = (list, fn) => list[behindOr](fn);
const behindNullish = flag ?? 'toSorted';
export const viaNullish = list => list[behindNullish]();
