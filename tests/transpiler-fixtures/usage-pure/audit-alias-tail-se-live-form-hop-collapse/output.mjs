import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _self from "@core-js/pure/actual/self";
import _Set from "@core-js/pure/actual/set";
// the redundant `.self` hop drops off an OWNERLESS alias nav, and the two legs then spell the
// receiver differently: babel inlines the alias to the pure root, the unplugin keeps `g` (whose
// declaration is rewritten to that root). the accepted kept-alias class, sidecar-held - the three
// realms read the same value either way, and both legs drop the same dead hop, which is the lock
let c = 0;
const g = _globalThis;
function id(a) {
  return a;
}

// live-read binding: an alias proxy nav with the side-effect buried in the hop TAIL is OWNERLESS (its value
// is not consumed by a dispatched method), so the redundant `.self` hop still drops off the kept alias name
const liveRead = (c++, _self).Array;
export const a = liveRead;

// the same nav as a call ARGUMENT is ownerless too (argument, not callee) - the hop drops, ctor leaf whole-swaps
const asArgument = id((c++, _Set));
export const b = asArgument;

// a deeper terminal read (`.prototype`) past the ctor leaf is still ownerless - no dispatched call consumes it
const deeperRead = (c++, _Map).prototype;
export const d = deeperRead;