import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Set from "@core-js/pure/actual/set/constructor";
var _ref, _ref2;
// the hop that NAMES a ponyfilled constructor decides ONE claim, and that claim must answer the same
// however the key is spelled: dotted, static-string computed, a single-quasi template, a sequence whose
// prefix carries an effect, and a pure zero-argument call folded to its return. the folded spellings
// under-resolved and the swap read the constructor RAW off the proxy global (`_globalThis[(c++, "Set")]`
// - the target engines have no `Set` there); where the swap did fire it DROPPED the
// key's own effect instead of migrating it ahead of the binding.
// `.add` is deliberately a prototype method with NO pure entry of its own: one that has an entry resolves
// as an instance claim and never reaches the constructor swap. two owners per spelling - the plain read,
// and the same read under the receiver-wrapping `.name` helper. the last block re-spells the whole set
// through an optional chain-root CALL, whose tail is stitched onto a guard memo rather than re-emitted.
let c = 0;
const dotted = _Set.prototype.add;
const computed = _Set.prototype.add;
const template = _Set.prototype.add;
const sequence = (c += 1, _Set).prototype.add;
const iife = _Set.prototype.add;
const wrappedDotted = _nameMaybeFunction(_Set.prototype.add);
const wrappedSequence = _nameMaybeFunction((c += 10, _Set).prototype.add);
const guardedSequence = null == (_ref = (() => {
  c += 100;
  return _globalThis;
})()) ? void 0 : _nameMaybeFunction((c += 1000, _Set).prototype.add);
const guardedIife = null == (_ref2 = (() => {
  c += 10000;
  return _globalThis;
})()) ? void 0 : _nameMaybeFunction(_Set.prototype.add);
// a chain-assign ROOT below a folded key: the assignment is a RECEIVER effect, so the source runs it
// BEFORE the key it precedes. it re-emits through the swap's own absorber, which used to APPEND it -
// past the key effect harvested from the same sub-receiver, an order both emitters agreed on.
let target;
const assignFirst = (target = _globalThis, c += 1e5, _Set).prototype.add;
export { dotted, computed, template, sequence, iife, wrappedDotted, wrappedSequence, guardedSequence, guardedIife, assignFirst, target, c };