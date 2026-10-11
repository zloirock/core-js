// A cast a user store holds is written around the value the store hands on: it stays over the swapped proxy hop,
// behind an effect prefix as well and where a member reads the store. A cast anywhere else goes with the swap.
let kept: any, keptSeq: any, viaRead: any, c = 0;
kept = globalThis.self as any;
keptSeq = (c++, globalThis.self as any);
export const viaPlan = (viaRead = (c++, globalThis.window.self as any)).Array.prototype.at;
export const declared = globalThis.self as any;
use(globalThis.self as any);
export { kept, keptSeq, viaRead };
