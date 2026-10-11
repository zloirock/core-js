// A cast a user store holds is written around the value the store hands on, and a cast elsewhere over a proxy hop
// is the source's own spelling too: the source stays as written and the realm the hops read is injected.
let kept: any, keptSeq: any, viaRead: any, c = 0;
kept = globalThis.self as any;
keptSeq = (c++, globalThis.self as any);
export const viaPlan = (viaRead = (c++, globalThis.window.self as any)).Array.prototype.at;
export const declared = globalThis.self as any;
use(globalThis.self as any);
export { kept, keptSeq, viaRead };
