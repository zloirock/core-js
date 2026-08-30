// TWO writes of the SAME proxy global are one value: the alias holds that global whichever write ran,
// so the read needs no sole-write proof. without the agreement arm the verdict flipped mid-file - this
// emitter rewrites the first write into its pure spelling, and the next read of the alias then saw a
// different write set than the read before it, so the two identical expressions below rendered
// differently (the first lost the probe the second kept).
// the negative is `M`: a PATTERN left stores a property of the global, never the global, so two such
// writes are two different constructors and stay untrusted
let v, g, out, out2;
out = (g = globalThis, v = g.window.self)?.Promise.race.zzz;
out2 = (g = globalThis, v = g.window.self)?.Promise.race.zzz;
let M;
({ Map: M } = globalThis);
({ Promise: M } = globalThis);
export const untrusted = typeof M.groupBy;
export const read = [out, out2];
