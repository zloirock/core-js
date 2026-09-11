// A realm run stored in a KEPT WRITE, landed on the deepest span pure can back: what that span
// spells BELOW its own key is discarded with it, so a sequence prefix and the write under the run
// survive the landing. A `?.` INSIDE the span leaves no landing - the collapse spells the run
// instead, lowering the probe into a guard test and folding the backed hop, an SE-bearing hop key
// running in that test. The last line is the negative: a span of nothing but hops lands whole.
let c = 0;
let k = 0;

let seqStored;
export const seqPrefixAhead = (seqStored = (c++, globalThis).self.window?.Array)?.from([1]);

let root;
let writeStored;
export const writeUnderTheRun = (writeStored = (root = globalThis).self.window?.Promise)?.resolve(1);

let probeStored;
export const probeInsideTheSpan = (probeStored = globalThis.window?.self.Object)?.keys({});

let keyStored;
export const seKeyInsideTheSpan = (keyStored = (c++, globalThis).window?.[(k++, 'self')].Number)?.isInteger(1);

let plainStored;
export const plainSpanLandsWhole = (plainStored = globalThis.self.window?.Array)?.of(4);

export { c, k, root };
