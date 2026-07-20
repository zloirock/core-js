// SE-bearing computed keys around the kept-assign claim: a key SE on the CLAIM hop folds into
// the claim sequence at its native slot; a key SE on a dropped PROXY hop rides the detection's
// side-effect channel (the emitters agree on order and differ only in sequence flattening -
// the sidecar carries the unflattened spelling)
let m;
let c = 0;
export const seClaimKey = (m = globalThis.window).self[(c++, 'Set')].name;
let p;
let k = 0;
export const seProxyKey = (p = globalThis.window)[(k++, 'self')].Map.name;
