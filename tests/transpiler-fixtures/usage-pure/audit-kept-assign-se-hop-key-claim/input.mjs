// SE-bearing computed keys around the kept-assign claim: both a key SE on the CLAIM hop and one on
// a DROPPED proxy hop fold into the claim sequence at their native slot - after the assignment, which
// is the object being read and so evaluates first. the dropped-hop key used to ride the detection's
// side-effect channel and got wrapped AROUND the whole render, running before the assignment.
// the emitters agree on order and differ only in memoizing the sequence - the sidecar carries that
let m;
let c = 0;
export const seClaimKey = (m = globalThis.window).self[(c++, 'Set')].name;
let p;
let k = 0;
export const seProxyKey = (p = globalThis.window)[(k++, 'self')].Map.name;
