// a DESTRUCTURE over the swapped-hop chain: the guard tests the SHORTEST object carrying the
// unresolvable hop (the window prefix), never a raw ponyfillable hop read; the helper receives
// the guarded value and keeps the native throw on the short-circuit path
const dsw = () => globalThis;
const { at: pickedSwapAt } = dsw()?.window?.self?.Array.of(23);
export const viaDestructureOverSwap = pickedSwapAt;
