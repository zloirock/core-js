import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// a nav whose LEAF is the environment probe (`globalThis.self.window?.X`): there is no ponyfilled leaf
// for the collapse plan to land on, so the descent used to stop and the emit kept `_globalThis.self
// .window` - a NATIVE `self` read off the ponyfill, undefined in Node, where the probe read one hop
// later throws. the hops BELOW the probe still collapse: their ponyfill takes their place and the probe
// read - with its own `?.` - stays exactly as written, which is the spelling the guard test already uses.
export const probeLeafRead = _self.window?.WeakRef;
export const probeLeafClaim = null == _self.window ? void 0 : _Symbol$iterator;
export const probeLeafTail = _self.window?.Array?.prototype;
// NEGATIVE: no `?.` at all - the whole navigation collapses, probe included (the multihop canon)
export const plainDeepNav = _globalThis.customKey;
// NEGATIVE: the probe is the FIRST hop, so the nav below it is just the root - the guarded render owns
// the shape and the test reads the probe off the ponyfill
export const firstHopProbe = (null == _globalThis.window ? void 0 : _self.window)?.BigInt;