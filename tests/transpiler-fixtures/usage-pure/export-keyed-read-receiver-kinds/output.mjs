import _Array$from from "@core-js/pure/actual/array/from";
import _at from "@core-js/pure/actual/instance/at";
// An exported computed static key over a known constructor runs the key effect and exports the pure
// static with no capture of the receiver. A reassigned alias, an unknown value and a member read keep
// their receiver: the static stays native, the instance read keeps its null rejection.
let A = Array;
A = pick();
const maybe = pick();
export const viaKnown = (effectful(), _Array$from);
export const {
  [(effectful(), 'of')]: viaReassigned
} = A;
export const viaUnknown = null == maybe ? maybe[""] : (effectful(), _at(maybe));
export const {
  [(effectful(), 'fromAsync')]: viaMember
} = holder.ctor;