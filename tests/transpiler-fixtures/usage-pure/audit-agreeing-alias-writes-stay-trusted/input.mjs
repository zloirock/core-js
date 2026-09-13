// Repeated writes of the same realm object keep the alias trustworthy at both reads.
// The plain window.self navigation lands on the backed self entry while assignments remain.
// Pattern writes to M store different constructors; identity checks preserve the selected value.
let v, g, out, out2;
out = (g = globalThis, v = g.window.self)?.Promise.race.zzz;
out2 = (g = globalThis, v = g.window.self)?.Promise.race.zzz;
let M;
({ Map: M } = globalThis);
({ Promise: M } = globalThis);
export const untrusted = typeof M.groupBy;
export const read = [out, out2];
