// DEEP pristine hops over the provably pure call root: BOTH emitters drop the call and read
// the hops off the ponyfill leaf - a raw `.self` read would miss every engine
// the web.self ponyfill serves (the polyfill invariant), so the guard itself is ponyfill-backed
const dh = () => globalThis;
export const viaDeepHops = dh()?.self?.window?.Array.of(3).at(0);
