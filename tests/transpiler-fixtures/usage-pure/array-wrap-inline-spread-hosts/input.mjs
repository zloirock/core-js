// the inline-array spread flattens once per HOST, from the root pattern down every paired level -
// under an object hop, a second wrapper, a sibling slot - on every host kind the pattern may live
// in. one method per row, so a row's extraction is attributable to its own host shape
let viaAssign;
([{ y: { at: viaAssign } }] = [...[nb]]);
for (const [{ y: { flat: viaForOf } }] of [[...[nb]]]) viaForOf;
try { throw [...[nb]]; } catch ([{ y: { findLast: viaCatch } }]) { viaCatch; }
const [{ y: { toSorted: viaTwoSlotsA } }, { with: viaTwoSlotsB }] = [...[nb, arr]];
const [{ y: { includes: viaTwoDeclsA } }] = [...[nb]], [{ flatMap: viaTwoDeclsB }] = [...[arr]];
const [[{ y: { toSpliced: viaDouble } }]] = [...[[...[nb]]]];
const [, { y: { findLastIndex: viaHoleBefore } }] = [...[, nb]];
const [, { y: { keys: viaEffectBefore } }] = [...[eff(), nb]];
export { viaAssign, viaTwoSlotsA, viaTwoSlotsB, viaTwoDeclsA, viaTwoDeclsB, viaDouble, viaHoleBefore, viaEffectBefore };

// NEGATIVES: an object level a LATER spread may override pairs no key, so the level below it stays
// as written; an IIFE parameter's nested leaf mirrors only into a LITERAL receiver - `nb.y` is a
// member read the mirror cannot spell, and the flattened argument prints the same on both legs
// (the file injects elsewhere)
const { k: [{ y: { values: viaLaterSpread } }] } = { k: [...[nb]], ...more };
class K { f = (([{ y: { toReversed: viaClassField } }]) => viaClassField)([...[nb]]); }
export { viaLaterSpread, K };
