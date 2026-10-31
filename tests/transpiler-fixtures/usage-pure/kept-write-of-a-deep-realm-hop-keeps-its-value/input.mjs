// A kept write stores what it reads, so the realm hop it stores is an observable read even past
// another realm hop: the guard stays on the stored value, and the write keeps that value rather
// than the realm the run would fold to - for a static past more realm hops, a constructor, a
// `typeof` and an aliased or `self` root alike.
let v;
const g = globalThis;
const l = [1, 2];
export const viaFrom = (v = globalThis.self.window)?.window?.self.Array.from(l).length;
export const viaOf = (v = globalThis.self.window)?.window?.window?.self.Array.of(1);
export const viaCtor = new ((v = globalThis.self.window)?.window?.self.Set)(l);
export const viaAlias = (v = g.self.window)?.window?.self.Math.trunc(2.5);
export const viaSelf = (v = self.self.window)?.window?.self.Object.entries(l);
export const viaTypeof = typeof (v = globalThis.self.window)?.window?.self.Map;
