// an EFFECT-bearing SLOT of a nested receiver is served because the residual it would have needed is
// DROPPED: what that residual would have evaluated, the dispatch evaluates instead, exactly once
const arr = [3, [1, 2]];
const { y: { at: viaNestedCall } } = { y: arr.flat() };
const { y: { at: viaTwoSlots } } = { z: 1, y: arr.flat() };
if (1) var { y: { at: viaBodylessCarried } } = { y: arr.flat() };
// An assignment reads the effect-bearing source once. The array-wrapped form captures its
// element before the nested method read.
let viaAssignCall, viaAssignWrap, viaAssignBodyless;
({ y: { at: viaAssignCall } } = { y: arr.flat() });
([{ y: { at: viaAssignWrap } }] = [{ y: arr.flat() }]);
if (1) ({ y: { at: viaAssignBodyless } } = { y: arr.flat() });
// ... and it stands down wherever a reader SURVIVES the slot: a sibling binding and a second
// effect-bearing part of the init the dispatch does not spell; a sibling KEY off the same receiver
// instead reads the slot's memo, which the claim reads too - the slot still evaluates once
let keptSibling, keptOther, keptKey, keptLen, twoEffects, twoEffectsZ;
({ y: { at: keptSibling }, o: keptOther } = { y: arr.flat(), o: 1 });
({ y: { at: keptKey, length: keptLen } } = { y: arr.flat() });
({ y: { at: twoEffects }, z: twoEffectsZ } = { y: arr.flat(), z: arr.flat() });
// A sequence in the source element runs its prefix once before the method read.
let out, seqElement;
([{ at: seqElement }] = [(out = 1, arr).flat()]);
// A discarded assignment inside a sequence keeps its own source read before the final value.
let viaSeqElement, seqTail;
seqTail = (({ y: { at: viaSeqElement } } = { y: arr.flat() }), 5);
export { viaNestedCall, viaTwoSlots, viaBodylessCarried, out };
export { viaAssignCall, viaAssignWrap, viaAssignBodyless };
export { keptSibling, keptOther, keptKey, keptLen, twoEffects, twoEffectsZ };
export { seqElement, viaSeqElement, seqTail };
