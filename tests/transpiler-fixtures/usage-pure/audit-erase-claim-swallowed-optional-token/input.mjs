// an erase claim widens its span past the node to swallow the optional token of the hop above it,
// so the survivor reads plainly. that leaves a needle ending in a lone `?`, which an enclosing
// render that deoptionalized the same hop no longer carries - it has to be located without the
// token. dotted and computed survivors take a different number of characters, and the sequence /
// chain-assign roots reach the same claim through their own render
function g() { return globalThis; }
function eff() {}
const dh = () => globalThis;
let w;
let x = [];
export const dottedTail = g()?.Number.MAX_SAFE_INTEGER?.toFixed(2);
export const computedTail = g()?.Number.MAX_SAFE_INTEGER?.['toFixed'](2);
export const seqRoot = (eff(), globalThis)?.Number.MAX_SAFE_INTEGER?.toFixed(2);
export const plainSeqRoot = (eff(), globalThis).Number.MAX_SAFE_INTEGER?.toFixed(2);
export const assignRoot = (w = globalThis)?.Number.MAX_SAFE_INTEGER?.toFixed(2);
export const collapsedHopClaim = dh().self?.Array.prototype.at.call(x, 0);
