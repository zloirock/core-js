// a DECLARATION array wrapper whose element cannot be spelled twice memoizes it, whatever the prop
// count and whatever the leaf: the residual keeps the element slot, so the memo is what gives that
// residual and the dispatch beside it the ONE read the source performs
const arr = [3, [1, 2]];
const hb = { get y() { return [3, [1, 2]]; } };
let out;
const [{ at: viaWrapOpaque }] = [arr.flat()];
const [{ at: viaWrapOpaqueDefault = null }] = [arr.flat()];
// ... and the memo may hoist only where no LATER declarator carries effects of its own: one that
// does would have its element read before this declarator's own key
const [{ at: viaWrapAheadOfPure }] = [arr.flat()], viaWrapPureTail = 1;
// ... and a SURVIVING residual pins its extraction beside itself when the source wrote a declarator
// BEHIND them: that trailing binding splits into a statement of its own, while a pattern left holding
// nothing but a rest reads through the memo from a statement of its own instead
const [{ at: viaKeptResidual, length: viaKeptLength }] = [hb.y], viaKeptTail = 1;
// ... and a receiver carrying a CLAIM OF ITS OWN memoizes what the tree holds AFTER that claim
// rendered, never the copy the plan captured - the rest below re-reads that one memo
const [{ at: viaSharedMemo, ...viaSharedRest }] = [hb.y.slice()];
// a wrapper element the PEEL reduces to a sequence TAIL: the residual keeps the whole sequence, so
// spelling that tail again would evaluate it twice - the shape this leg's OWN output takes on a
// second pass, where the prefix has been lifted to the top of the element
let viaPeeledTail;
([{ at: viaPeeledTail }] = [(out = 2, arr.flat())]);
// a DECLARATION host reads its receiver once whatever keeps the DECLARATION alive: a consumed
// declarator splits off beside its siblings, and a sole array WRAPPER takes the element whole
const { y: { at: viaDeclSibling } } = { y: hb.y }, viaDeclSiblingZ = 1;
const [{ y: { at: viaWrapSole } }] = [{ y: hb.y }];
// ... and a wrapper whose NEIGHBOUR still binds keeps the wrapper while THIS element goes empty: the
// read hoists into the memo the source reads it in, so the neighbour's own effect still runs after it
const [{ y: { at: viaWrapNeighbour } }, viaWrapNeighbourZ] = [{ y: hb.y }, hb.y];
// ... and where this claim's leaf is the wrapper's ONLY binding the residual dies whole and the
// dispatch performs the element's one read itself
const [{ y: { at: viaWrapCarried } }] = [{ y: arr.flat() }];
// ... while a reader that SURVIVES the slot - a rest, a sibling prop, a key with an effect of its
// own - makes the slot MEMOIZE instead: both readers then share the one read, the slot swapping to
// the ref in place. the residual it keeps holds every EFFECTFUL KEY under the consumed prop, not
// just the one at its top, since the removal takes the whole subtree
const [{ y: { at: viaWrapCarriedRest, ...viaWrapCarriedRestOther } }] = [{ y: arr.flat() }];
const [{ y: { at: viaWrapCarriedSib }, wz: viaWrapCarriedSibZ }] = [{ y: arr.flat(), wz: 1 }];
const [{ y: { [(out = 3, 'at')]: viaWrapCarriedKey } }] = [{ y: arr.flat() }];
// ... and a NEIGHBOUR element bearing effects of its own is no obstacle to that memo: the receiver
// answers for ITS element alone, and the neighbour evaluates where the source evaluates it
const [{ y: { at: viaWrapCarriedNeighbour } }, viaWrapCarriedNeighbourZ] = [{ y: arr.flat() }, arr.flat()];
export { viaWrapOpaque, viaWrapOpaqueDefault, viaWrapAheadOfPure, viaWrapPureTail, out };
export { viaKeptResidual, viaKeptLength, viaKeptTail, viaSharedMemo, viaSharedRest, viaPeeledTail };
export { viaDeclSibling, viaDeclSiblingZ, viaWrapSole, viaWrapNeighbour, viaWrapNeighbourZ };
export { viaWrapCarried, viaWrapCarriedRest, viaWrapCarriedRestOther };
export { viaWrapCarriedSib, viaWrapCarriedSibZ, viaWrapCarriedKey };
export { viaWrapCarriedNeighbour, viaWrapCarriedNeighbourZ };
