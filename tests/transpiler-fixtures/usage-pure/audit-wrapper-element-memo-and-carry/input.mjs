// Object-rest keeps the affected pattern native, including inside an array wrapper.
// Independent reads and key/default expressions still receive their own polyfills.
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
const [{ at: viaKeptResidual, length: viaKeptLength }] = [hb.y], viaKeptTail = 1;
const [{ at: viaSharedMemo, ...viaSharedRest }] = [hb.y.slice()];
// A wrapper element with a sequence prefix evaluates that prefix once before its method read.
let viaPeeledTail;
([{ at: viaPeeledTail }] = [(out = 2, arr.flat())]);
// A declaration reads each receiver once. An array wrapper captures its element before reading
// the nested property, while a neighbouring declarator keeps its own position.
const { y: { at: viaDeclSibling } } = { y: hb.y }, viaDeclSiblingZ = 1;
const [{ y: { at: viaWrapSole } }] = [{ y: hb.y }];
// The complete array initializer runs before either captured element is destructured.
const [{ y: { at: viaWrapNeighbour } }, viaWrapNeighbourZ] = [{ y: hb.y }, hb.y];
// A sole nested binding reads through the captured element; rest and computed keys retain
// their own native pattern work.
const [{ y: { at: viaWrapCarried } }] = [{ y: arr.flat() }];
const [{ y: { at: viaWrapCarriedRest, ...viaWrapCarriedRestOther } }] = [{ y: arr.flat() }];
const [{ y: { at: viaWrapCarriedSib }, wz: viaWrapCarriedSibZ }] = [{ y: arr.flat(), wz: 1 }];
const [{ y: { [(out = 3, 'at')]: viaWrapCarriedKey } }] = [{ y: arr.flat() }];
// An effectful neighbouring element finishes before the first captured property read.
const [{ y: { at: viaWrapCarriedNeighbour } }, viaWrapCarriedNeighbourZ] = [{ y: arr.flat() }, arr.flat()];
export { viaWrapOpaque, viaWrapOpaqueDefault, viaWrapAheadOfPure, viaWrapPureTail, out };
export { viaKeptResidual, viaKeptLength, viaKeptTail, viaSharedMemo, viaSharedRest, viaPeeledTail };
export { viaDeclSibling, viaDeclSiblingZ, viaWrapSole, viaWrapNeighbour, viaWrapNeighbourZ };
export { viaWrapCarried, viaWrapCarriedRest, viaWrapCarriedRestOther };
export { viaWrapCarriedSib, viaWrapCarriedSibZ, viaWrapCarriedKey };
export { viaWrapCarriedNeighbour, viaWrapCarriedNeighbourZ };
