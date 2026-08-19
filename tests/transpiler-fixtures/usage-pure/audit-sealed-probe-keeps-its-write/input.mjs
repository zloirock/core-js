// a kept write riding a sealed probe nav stores the very value the probe test reads, so it belongs
// INSIDE that test - native writes before the read. left to the effect channel it landed after the
// probe, reversing the pair; dropped from the plan entirely it took the whole probe with it and the
// read the seal makes observable was gone.
// the corpus cannot hold these: native THROWS on them, and a throwing native is vacuous there.
let s;
let t;
let m;
let q;
export const writeUnderSeal = ((s = globalThis.window)?.self).Array.of(5);
export const writeUnderSealTail = ((t = globalThis.window)?.self).Array.of(5).at(0);
// NEGATIVE: the same seal without a write - the probe was always spelled here
export const sealNoWrite = (globalThis.window?.self).Array.of(5);
// NEGATIVE: no `?.` over the write, so there is no short-circuit to reproduce and no probe
export const writeNoOptional = (m = globalThis.window).self.Array.of(5);
// NEGATIVE: no seal, so the claim collapses under its own guard and the write rides the test there
export const writeNoSeal = (q = globalThis.window)?.self.Array.of(5);
// an effect BELOW the probe hops rides INSIDE the collapsed value, ahead of the base. the guard base
// substitutes the whole prefix for an always-defined ponyfill (the owner-decided price), so an effect
// left outside it runs after a read that can throw - or, for a write the plan dropped, never at all
let u;
let z;
let k = 0;
export const writeBelowProbeHops = ((u = globalThis).self.window?.self)?.Array.of(5);
export const writeBelowProbeHopsRead = ((z = globalThis).self.window?.self).Symbol?.iterator;
// the same rule with a sequence prefix instead of a write: one slot, one order
export const seqBelowProbeHops = ((k++, globalThis).self.window?.self)?.Array.of(5);
export { u, z, k };
