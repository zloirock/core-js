// hops SWAPPED (the unresolvable window hop before the ponyfillable self hop): both optional
// objects share the window hop as their only source of undefined, so ONE nested test on the
// window prefix guards the chain and the branch still reads the ponyfill leaf
const dw = () => globalThis;
export const viaHopOrderSwap = dw()?.window?.self?.Array.of(12).at(0);
