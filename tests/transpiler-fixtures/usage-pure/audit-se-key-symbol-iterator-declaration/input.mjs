// an SE-prefix computed `[(eff++, Symbol.iterator)]` DECLARATION key: the extraction canon
// pulls the iterator-method read ahead of the pattern, the residual keeps the key SE
// re-read with the substituted symbol binding - the effect still runs exactly once
let eff = 0;
const arr = [1, 2];
const { [(eff++, Symbol.iterator)]: it } = arr;
export const r = [it, eff];
