// an EFFECT-bearing SLOT of a nested receiver is served because the residual it would have needed is
// DROPPED: what that residual would have evaluated, the dispatch evaluates instead, exactly once
const arr = [3, [1, 2]];
const { y: { at: viaNestedCall } } = { y: arr.flat() };
const { y: { at: viaTwoSlots } } = { z: 1, y: arr.flat() };
if (1) var { y: { at: viaBodylessCarried } } = { y: arr.flat() };
// the ASSIGNMENT host asks the same question of its own residual, which dies whole here - so the
// same effect-bearing slot is served, wrapper included: nothing survives to read the init twice
let viaAssignCall, viaAssignWrap, viaAssignBodyless;
({ y: { at: viaAssignCall } } = { y: arr.flat() });
([{ y: { at: viaAssignWrap } }] = [{ y: arr.flat() }]);
if (1) ({ y: { at: viaAssignBodyless } } = { y: arr.flat() });
// ... and it stands down wherever a reader SURVIVES the slot: a sibling binding, a sibling KEY off
// the same receiver, and a second effect-bearing part of the init the dispatch does not spell
let keptSibling, keptOther, keptKey, keptLen, twoEffects, twoEffectsZ;
({ y: { at: keptSibling }, o: keptOther } = { y: arr.flat(), o: 1 });
({ y: { at: keptKey, length: keptLen } } = { y: arr.flat() });
({ y: { at: twoEffects }, z: twoEffectsZ } = { y: arr.flat(), z: arr.flat() });
// ... and an element that SPELLS A SEQUENCE stands down on both legs: a claim INSIDE it renders by
// lifting its own prefix into the residual, so dropping that residual would drop the lift while
// keeping it would re-read what the dispatch spells
let out, seqElement;
([{ at: seqElement }] = [(out = 1, arr).flat()]);
// the assignment DISCARDED as a sequence element drops its residual by a route of its own, and it
// owes the same pairing: the dispatch carries the init, so the element must not re-emit it
let viaSeqElement, seqTail;
seqTail = (({ y: { at: viaSeqElement } } = { y: arr.flat() }), 5);
export { viaNestedCall, viaTwoSlots, viaBodylessCarried, out };
export { viaAssignCall, viaAssignWrap, viaAssignBodyless };
export { keptSibling, keptOther, keptKey, keptLen, twoEffects, twoEffectsZ };
export { seqElement, viaSeqElement, seqTail };
