import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
let c = 0;
const g = _globalThis;
function id(a) { return a; }

// live-read binding: an alias proxy nav with the side-effect buried in the hop TAIL is OWNERLESS (its value
// is not consumed by a dispatched method), so the redundant `.self` hop still drops off the kept alias name
const liveRead = (c++, g).Array;
export const a = liveRead;

// the same nav as a call ARGUMENT is ownerless too (argument, not callee) - the hop drops, ctor leaf whole-swaps
const asArgument = id((c++, _Set));
export const b = asArgument;

// a deeper terminal read (`.prototype`) past the ctor leaf is still ownerless - no dispatched call consumes it
const deeperRead = (c++, _Map).prototype;
export const d = deeperRead;