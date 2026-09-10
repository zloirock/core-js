// a guard TEST over a run with NOTHING backed under it spells every hop the source wrote: the value
// the `?.` OBSERVES is the environment probe, exactly as a terminal realm hop is, so the read-through
// fold that owns a hop under a plain member has no run here to own. folded up to the `?.`, the test
// read one hop short of the source and answered `undefined` on exactly the hosts where that read
// throws - observable at runtime, never as an import set
let w, d, c, k;
export const twoHops = (w = globalThis.window.window?.Array)?.from([1]);
export const threeHops = (d = globalThis.window.window.window?.Array)?.from([2]);
export const literalKeyHop = (c = globalThis.window['window']?.Array)?.from([3]);
export const literalKeyBelow = (k = globalThis['window'].window?.Array)?.from([4]);

// NEGATIVE: a PLAIN member above the run READS THROUGH the hops, and the read-through fold owns
// them - the landing canon's reader rule, unchanged
let p;
export const plainReader = (p = globalThis.window.window.Array)?.from([5]);

// NEGATIVE: a BACKED hop under the run IS the landing, and only what stands above it keeps its slot
let b;
export const backedLanding = (b = globalThis.self.window?.Array)?.from([6]);
export { w, d, c, k, p, b };
