import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _self from "@core-js/pure/actual/self";
// A cast a user store holds is written around the value the store hands on: it stays over the swapped proxy hop,
// behind an effect prefix as well and where a member reads the store. A cast anywhere else goes with the swap.
let kept: any,
  keptSeq: any,
  viaRead: any,
  c = 0;
kept = _self as any;
keptSeq = (c++, _self as any);
export const viaPlan = _atMaybeArray((viaRead = (c++, _self as any)).Array.prototype);
export const declared = _self;
use(_self);
export { kept, keptSeq, viaRead };