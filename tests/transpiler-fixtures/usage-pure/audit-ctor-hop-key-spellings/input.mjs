// the hop that NAMES a ponyfilled constructor decides ONE claim, and that claim must answer the same
// however the key is spelled: dotted, static-string computed, a single-quasi template, a sequence whose
// prefix carries an effect, and a pure zero-argument call folded to its return. the folded spellings
// under-resolved and the swap read the constructor RAW off the proxy global (`_globalThis[(c++, "Set")]`
// - the target engines have no `Set` there); where the swap did fire on the text emitter it DROPPED the
// key's own effect instead of migrating it ahead of the binding.
// `.add` is deliberately a prototype method with NO pure entry of its own: one that has an entry resolves
// as an instance claim and never reaches the constructor swap. two owners per spelling - the plain read,
// and the same read under the receiver-wrapping `.name` helper. the last block re-spells the whole set
// through an optional chain-root CALL, whose tail is stitched onto a guard memo rather than re-emitted.
let c = 0;
const dotted = globalThis.self.Set.prototype.add;
const computed = globalThis.self["Set"].prototype.add;
const template = globalThis.self[`Set`].prototype.add;
const sequence = globalThis.self[(c += 1, "Set")].prototype.add;
const iife = globalThis.self[(() => "Set")()].prototype.add;
const wrappedDotted = globalThis.self.Set.prototype.add.name;
const wrappedSequence = globalThis.self[(c += 10, "Set")].prototype.add.name;
const guardedSequence = (() => { c += 100; return globalThis; })()?.self[(c += 1000, "Set")].prototype.add.name;
const guardedIife = (() => { c += 10000; return globalThis; })()?.self[(() => "Set")()].prototype.add.name;
// a chain-assign ROOT below a folded key: the assignment is a RECEIVER effect, so the source runs it
// BEFORE the key it precedes. it re-emits through the swap's own absorber, which used to APPEND it -
// past the key effect harvested from the same sub-receiver, an order both emitters agreed on.
let target;
const assignFirst = (target = globalThis).self[(c += 1e5, "Set")].prototype.add;
export { dotted, computed, template, sequence, iife, wrappedDotted, wrappedSequence, guardedSequence, guardedIife, assignFirst, target, c };
