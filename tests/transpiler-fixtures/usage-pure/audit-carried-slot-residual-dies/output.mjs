import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// an EFFECT-bearing SLOT of a nested receiver is served because the residual it would have needed is
// DROPPED: what that residual would have evaluated, the dispatch evaluates instead, exactly once
const arr = [3, [1, 2]];
const viaNestedCall = _atMaybeArray(_flatMaybeArray(arr).call(arr));
const viaTwoSlots = _atMaybeArray(_flatMaybeArray(arr).call(arr));
if (1) var viaBodylessCarried = _atMaybeArray(_flatMaybeArray(arr).call(arr));
// the ASSIGNMENT host asks the same question of its own residual, which dies whole here - so the
// same effect-bearing slot is served, wrapper included: nothing survives to read the init twice
let viaAssignCall, viaAssignWrap, viaAssignBodyless;
viaAssignCall = _atMaybeArray(_flatMaybeArray(arr).call(arr));
viaAssignWrap = _atMaybeArray(_flatMaybeArray(arr).call(arr));
if (1) viaAssignBodyless = _atMaybeArray(_flatMaybeArray(arr).call(arr));
// ... and it stands down wherever a reader SURVIVES the slot: a sibling binding and a second
// effect-bearing part of the init the dispatch does not spell; a sibling KEY off the same receiver
// instead reads the slot's memo, which the claim reads too - the slot still evaluates once
let keptSibling, keptOther, keptKey, keptLen, twoEffects, twoEffectsZ;
({
  y: {
    at: keptSibling
  },
  o: keptOther
} = {
  y: _flatMaybeArray(arr).call(arr),
  o: 1
});
const _ref = _flatMaybeArray(arr).call(arr);
keptKey = _atMaybeArray(_ref);
({
  length: keptLen
} = _ref);
({
  y: {
    at: twoEffects
  },
  z: twoEffectsZ
} = {
  y: _flatMaybeArray(arr).call(arr),
  z: _flatMaybeArray(arr).call(arr)
});
// ... and an element that SPELLS A SEQUENCE keeps the whole sequence inside the dispatch: its prefix
// runs where the source ran it, once, and nothing re-reads what the dispatch spells
let out, seqElement;
// the assignment DISCARDED as a sequence element drops its residual by a route of its own, and it
// owes the same pairing: the dispatch carries the init, so the element must not re-emit it
seqElement = _atMaybeArray((out = 1, _flatMaybeArray(arr).call(arr)));
let viaSeqElement, seqTail;
seqTail = (viaSeqElement = _atMaybeArray(_flatMaybeArray(arr).call(arr)), 5);
export { viaNestedCall, viaTwoSlots, viaBodylessCarried, out };
export { viaAssignCall, viaAssignWrap, viaAssignBodyless };
export { keptSibling, keptOther, keptKey, keptLen, twoEffects, twoEffectsZ };
export { seqElement, viaSeqElement, seqTail };