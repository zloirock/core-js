let c = 0;
const g = globalThis;
function id(a) { return a; }

// live-read binding: an alias proxy nav with the side-effect buried in the hop TAIL is OWNERLESS (its value
// is not consumed by a dispatched method), so the redundant `.self` hop still drops off the kept alias name
const liveRead = (c++, g.self).Array;
export const a = liveRead;

// the same nav as a call ARGUMENT is ownerless too (argument, not callee) - the hop drops, ctor leaf whole-swaps
const asArgument = id((c++, g.self).Set);
export const b = asArgument;

// a deeper terminal read (`.prototype`) past the ctor leaf is still ownerless - no dispatched call consumes it
const deeperRead = (c++, g.self).Map.prototype;
export const d = deeperRead;
