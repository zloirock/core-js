import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
import _toSplicedMaybeArray from "@core-js/pure/actual/array/instance/to-spliced";
import _withMaybeArray from "@core-js/pure/actual/array/instance/with";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
import _keys from "@core-js/pure/actual/instance/keys";
import _values from "@core-js/pure/actual/instance/values";
// the inline-array spread flattens once per HOST, from the root pattern down every paired level -
// under an object hop, a second wrapper, a sibling slot - on every host kind the pattern may live
// in. one method per row, so a row's extraction is attributable to its own host shape
let viaAssign;
[,] = [...[nb]];
viaAssign = _at(nb.y);
for (const _ref2 of [[...[nb]]]) {
  const [_ref] = _ref2;
  const viaForOf = _flatMaybeArray(_ref.y);
  viaForOf;
}
try {
  throw [...[nb]];
} catch (_ref3) {
  let [_ref4] = _ref3;
  let viaCatch = _findLastMaybeArray(_ref4.y);
  viaCatch;
}
const [,,] = [...[nb, arr]];
const viaTwoSlotsA = _toSortedMaybeArray(nb.y);
const viaTwoSlotsB = _withMaybeArray(arr);
const [,] = [...[nb]];
const viaTwoDeclsA = _includes(nb.y);
const viaTwoDeclsB = _flatMapMaybeArray(arr);
const [[,]] = [...[[...[nb]]]];
const viaDouble = _toSplicedMaybeArray(nb.y);
const [,,] = [...[, nb]];
const viaHoleBefore = _findLastIndexMaybeArray(nb.y);
const [,,] = [...[eff(), nb]];
const viaEffectBefore = _keys(nb.y);
export { viaAssign, viaTwoSlotsA, viaTwoSlotsB, viaTwoDeclsA, viaTwoDeclsB, viaDouble, viaHoleBefore, viaEffectBefore };

// an object level a LATER spread may override pairs no key, so the pairing stops above it and the
// element renames positionally, reading whatever the spread left in that slot.
// The IIFE parameter captures its supplied array once, including a member-valued nested receiver.
const {
  k: [_ref5]
} = {
  k: [...[nb]],
  ...more
};
const viaLaterSpread = _values(_ref5.y);
class K {
  f = ((_ref6, _unused = void 0) => {
    let [_ref7] = _ref6;
    let viaClassField = _toReversedMaybeArray(_ref7.y);
    return viaClassField;
  })([...[nb]]);
}
export { viaLaterSpread, K };