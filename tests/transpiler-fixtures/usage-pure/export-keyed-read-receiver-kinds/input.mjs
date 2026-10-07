// An exported computed static key over a known constructor runs the key effect and exports the pure
// static with no capture of the receiver. A reassigned alias, an unknown value and a member read keep
// their receiver: the static stays native, the instance read keeps its null rejection.
let A = Array;
A = pick();
const maybe = pick();
export const { [(effectful(), 'from')]: viaKnown } = Array;
export const { [(effectful(), 'of')]: viaReassigned } = A;
export const { [(effectful(), 'at')]: viaUnknown } = maybe;
export const { [(effectful(), 'fromAsync')]: viaMember } = holder.ctor;
