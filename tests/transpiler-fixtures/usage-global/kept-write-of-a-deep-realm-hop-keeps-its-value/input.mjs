// A kept write of a realm hop past another realm hop hides nothing from usage detection: the static,
// the constructor and the realm global each navigation reaches over the stored value pull their
// modules, whatever spells the root.
let v;
const g = globalThis;
const l = [1, 2];
export const viaFrom = (v = globalThis.self.window)?.window?.self.Array.from(l).length;
export const viaOf = (v = globalThis.self.window)?.window?.window?.self.Array.of(1);
export const viaCtor = new ((v = globalThis.self.window)?.window?.self.Set)(l);
export const viaAlias = (v = g.self.window)?.window?.self.Math.trunc(2.5);
export const viaSelf = (v = self.self.window)?.window?.self.Object.entries(l);
export const viaTypeof = typeof (v = globalThis.self.window)?.window?.self.Map;
