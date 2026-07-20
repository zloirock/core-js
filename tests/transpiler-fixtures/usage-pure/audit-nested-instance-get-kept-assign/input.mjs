// kept-assign / reused-guard roots with a nested instance-GET: the guard, the composition and the
// resolution degree all agree - the memo's registered write re-types the tail on both emitters,
// so typed dispatch survives the capture (only a primitive value-read widens to the common
// helper), claimable statics read through the ponyfill INSIDE the guard (a raw read would miss
// the polyfill exactly where the target engine lacks the native), a non-claimable nav drops its
// redundant hops, and a claim through the kept assignment spells the ponyfill sequence when the
// root is non-optional or its value nav resolves
let n;
let t;
let c;
let s;
let m;
let g;
let f;
export const keptProto = (n = globalThis.window)?.self.Array.prototype.at.name;
export const iifeStatic = (() => globalThis)()?.self.Set.name.at(0);
export const keptTriple = (t = globalThis.window)?.self.Array.prototype.at.name.at(0);
export const keptCallTail = (c = globalThis.window)?.self.Array.from([2]).at(0);
export const keptCtorLeaf = (s = globalThis.window)?.self.Set.name.includes('S');
export const keptNonOptional = (m = globalThis.window).self.Map.name;
export const keptResolvable = (g = globalThis)?.self.Set.name;
export const keptResolvableCall = (f = globalThis)?.self.Array.from([3]).at(-1);
