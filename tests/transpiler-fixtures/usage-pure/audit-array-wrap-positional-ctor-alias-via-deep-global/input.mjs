// DEEP array-wrap layers pair positionally too: the global slot folds even when nested two levels
const [[{ Promise: D }]] = [[globalThis]];
export const viaDeepGlobal = D.any([]);
