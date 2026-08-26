// a kept WRITE as the receiver: it is a prefix of its own - the store happens ONCE and the nav then
// reads what it stored. the placement parts by leg exactly like any other prefix (babel carries it
// inside the dispatch, the other leg lifts it), and the STORE is observable, so every row exports the
// written binding too
let kept, keptSe, keptAssign, kwLoop, kwSlot, kwWrap, loopOut, slotOut;
const { Array: { prototype: { fill: overWrite } } } = (kept = globalThis);
// an SE prefix INSIDE the stored value travels with the write
const { Array: { prototype: { keys: overWriteSe } } } = (keptSe = (effect(), globalThis));
// the ASSIGNMENT host parts by ROUTE, not by placement: babel keeps the raw destructure with its
// post-statement overwrite, the other leg consumes it
let overWriteAssign;
({ Array: { prototype: { copyWithin: overWriteAssign } } } = (keptAssign = globalThis));
// a FOR-HEAD stores BEFORE it binds - the write leads the header on both legs (its init runs once)
for (const { Array: { prototype: { findLastIndex: fromLoop } } } = (kwLoop = globalThis); !loopOut;) loopOut = typeof fromLoop;
// a CONTROL slot keeps the write inside the dispatch on both legs: the effect must stay conditional
if (1) var { Array: { prototype: { flatMap: fromSlot } } } = (kwSlot = globalThis);
slotOut = typeof fromSlot;
// an ARRAY-WRAPPER slot: babel carries the write, the other leg lifts it WHOLE and leaves its TARGET
// in the slot, so the stored value is read once (leaving the VALUE there doubled the effect log)
const [{ Array: { prototype: { toSpliced: fromWrap } } }] = [(kwWrap = globalThis)];
export { kept, keptSe, keptAssign, kwLoop, kwSlot, kwWrap, loopOut, slotOut, overWrite, overWriteSe, overWriteAssign, fromSlot, fromWrap };
