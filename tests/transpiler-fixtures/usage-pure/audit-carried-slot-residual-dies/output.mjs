import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref, _ref3;
// an EFFECT-bearing SLOT of a nested receiver is served because the residual it would have needed is
// DROPPED: what that residual would have evaluated, the dispatch evaluates instead, exactly once
const arr = [3, [1, 2]];
const viaNestedCall = _atMaybeArray(_flatMaybeArray(arr).call(arr));
const viaTwoSlots = _atMaybeArray(_flatMaybeArray(arr).call(arr));
if (1) var viaBodylessCarried = _atMaybeArray(_flatMaybeArray(arr).call(arr));
// An assignment reads the effect-bearing source once. The array-wrapped form captures its
// element before the nested method read.
let viaAssignCall, viaAssignWrap, viaAssignBodyless;
viaAssignCall = _atMaybeArray(_flatMaybeArray(arr).call(arr));
[_ref] = [{
  y: _flatMaybeArray(arr).call(arr)
}];
viaAssignWrap = _atMaybeArray(_ref.y);
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
const _ref2 = _flatMaybeArray(arr).call(arr);
keptKey = _atMaybeArray(_ref2);
({
  length: keptLen
} = _ref2);
({
  y: {
    at: twoEffects
  },
  z: twoEffectsZ
} = {
  y: _flatMaybeArray(arr).call(arr),
  z: _flatMaybeArray(arr).call(arr)
});
// A sequence in the source element runs its prefix once before the method read.
let out, seqElement;
[_ref3] = [_flatMaybeArray((out = 1, arr)).call(arr)];
// A discarded assignment inside a sequence keeps its own source read before the final value.
seqElement = _atMaybeArray(_ref3);
let viaSeqElement, seqTail;
seqTail = (viaSeqElement = _atMaybeArray(_flatMaybeArray(arr).call(arr)), 5);
export { viaNestedCall, viaTwoSlots, viaBodylessCarried, out };
export { viaAssignCall, viaAssignWrap, viaAssignBodyless };
export { keptSibling, keptOther, keptKey, keptLen, twoEffects, twoEffectsZ };
export { seqElement, viaSeqElement, seqTail };