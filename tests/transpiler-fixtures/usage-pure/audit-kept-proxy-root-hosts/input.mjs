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

// A destructure SOURCE over the kept chain: the pattern is claimed by the extraction pipeline, but
// that pipeline renders a kept source verbatim (its own collapse entry gates off once the natural
// root rewrite lands), so the hop-collapse drive must NOT defer to it here - the migrated span
// composes into the extracted source by needle. resolvable navigations still defer (the pipeline
// owns those atomically).
let c4 = 0;
let ds;
export const { indexOf: idxOfKept } = ((ds = globalThis.window)?.[(c4++, 'self')].Array.prototype) ?? {};
export { c4 };

// A BARE proxy root under two dead proxy-hop optionals: the root is always defined, so every guard
// is dead and the whole navigation collapses with no memo at all.
export const bareDoubleOptional = globalThis.window?.self?.self.Array.prototype.flat.call([2, [3]]);

// An optional CALL between the hops leaves the SE-key fold NO surviving key to migrate the dropped
// hop's effect into, so the own `?.` stops riding that fold and the probe keeps its guard: flattened,
// the emit ran `oc++` and the call on the very branch native short-circuits past (measured off-window:
// the source answers `undefined` with `oc` untouched, the flat spelling throws with `oc` at 1).
let oc = 0;
let cb;
export const optionalCallHop = () => (cb = globalThis.window)?.[(oc++, 'self')]?.().Array;
export { oc };

// An ALIAS-carried kept root under two live-looking optionals: one memo at the root, keys migrate.
const galias = globalThis;
let alk;
export const aliasDoubleOptional = (alk = galias.window)?.self?.[(c3++, 'self')].Array.prototype.at.call([7], 0);

// NEGATIVE: an ordinary (non-proxy) double-optional chain keeps its leaf-nearest memo anchor -
// the inner `?.` lives inside the memoized expression, which is exactly its short-circuit meaning.
const holder = { p: { q: [4, [5]] } };
export const ordinaryDoubleOptional = holder.p?.q?.findLastIndex(v => Array.isArray(v));

// The ASSIGNMENT form of a destructure over the kept chain: same ownership rule as the declarator -
// the extraction claims the pattern, the drive still collapses the kept source under it.
let mapOfKept;
let asg;
({ map: mapOfKept } = ((asg = globalThis.window)?.[(c4++, 'self')].Array.prototype) ?? {});
export { mapOfKept };

// A NESTED pattern over the kept chain: the outer pattern is the claimed one; the source still
// collapses once, feeding both levels.
let nst;
export const { constructor: { of: ofNested } = {} } = ((nst = globalThis.window)?.[(c4++, 'self')].Array.prototype) ?? {};

// probed delete edges locked verbatim: a DOUBLE undefinable hop stands down (no single test
// spells the union), an OPAQUE call root keeps its raw guard, a nested value context rides
// the same canon as the statement form
export const delDoubleHop = delete globalThis.window?.frames?.customZ;
function opaqueRoot() { return globalThis; }
export const delOpaque = delete opaqueRoot()?.window?.customW;
export const delNested = [delete globalThis.window?.self.customV];

// a full-consume extraction discards the read the source performs, so an UNDEFINABLE probe nav
// init re-emits that read as a THROW probe off the guard value: every consuming position - the
// single-property extraction included - throws exactly where native does. the member read, the
// object read and the array pattern keep their guards as before
export const { trunc } = globalThis.window?.self.Math;
export const truncRead = globalThis.window?.self.Math.trunc;
export const mathRead = globalThis.window?.self.Math;
export const [firstOf] = globalThis.window?.self.Array.of(1);
