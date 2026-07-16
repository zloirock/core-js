// the HOST positions a kept proxy root can sit in. the rule is the same everywhere - the assignment stays
// as the root, its redundant proxy hops still drop - but each host reaches the collapse through its own
// emit path, so each has to be pinned separately: a `new` callee, a write target, a logical operand, a
// discarded for-x head, a template hole, and a spread argument. distinct methods / constructors per line.
let n;
export const newCallee = new (n = globalThis.window).self.Array(3);

let w;
(w = globalThis.window).self.Set = function () {};

let l;
export const logicalOperand = (l = globalThis.window)?.self.Array.prototype.flatMap || {};

let f;
for (const k in (f = globalThis.window)?.self.Array.prototype ?? {}) void k;

let t;
export const templateHole = `${ (t = globalThis.window)?.self.Array.prototype.includes.call([1], 1) }`;

let s;
export const spreadArg = Math.max(...((s = globalThis.window)?.self.Array.from?.([1, 2]) ?? [0]));

let d;
delete (d = globalThis.window)?.self.someUserKey;

export { w };

// an IIFE-arg SYNTH over a kept+SE-key chain: the swap renders the whole receiver (its own harvest),
// so the hop-collapse drive must yield to the claim - queueing its migrated span too nested a transform
// the swap's content could not compose (a build break)
let c2 = 0;
let ks;
export const ofSynthKept = (({ of } = {}) => of)((ks = globalThis.window)?.[(c2++, 'self')].Array ?? {});
export { c2 };
// NEGATIVES for the synth-claim yield: the same kept+SE-key chain in a LOGICAL and a TERNARY carrier
// with NO pending synth - the drive still owns the collapse (nothing claimed the receiver)
let c3 = 0;
let ln;
export const logicalNoSynth = ((ln = globalThis.window)?.[(c3++, 'self')].Array ?? Array).from([1]);

let tn;
export const ternaryNoSynth = (1 ? (tn = globalThis.window)?.[(c3++, 'self')].Array.prototype.findLast : 0).call([1, 2], v => v < 2);
export { c3 };
