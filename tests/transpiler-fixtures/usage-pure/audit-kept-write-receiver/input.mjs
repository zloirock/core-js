// A kept write used as a receiver runs once before the selected instance method is read.
// Each stored binding is exported so preserving the assigned value remains observable.
let kept, keptSe, keptAssign, kwLoop, kwSlot, kwWrap, loopOut, slotOut;
const { Array: { prototype: { fill: overWrite } } } = (kept = globalThis);
// An effect inside the stored value runs once as part of the write.
const { Array: { prototype: { keys: overWriteSe } } } = (keptSe = (effect(), globalThis));
// An assignment host also keeps the receiver store before the target method binding.
let overWriteAssign;
({ Array: { prototype: { copyWithin: overWriteAssign } } } = (keptAssign = globalThis));
// A for-init header stores the receiver before binding its method; initialization runs once.
for (const { Array: { prototype: { findLastIndex: fromLoop } } } = (kwLoop = globalThis); !loopOut;) loopOut = typeof fromLoop;
// A bodyless control slot keeps the store and instance read conditional.
if (1) var { Array: { prototype: { flatMap: fromSlot } } } = (kwSlot = globalThis);
slotOut = typeof fromSlot;
// An array wrapper captures its stored element before reading the selected prototype slot.
// The write and any effect inside its value must not be duplicated.
const [{ Array: { prototype: { toSpliced: fromWrap } } }] = [(kwWrap = globalThis)];
export { kept, keptSe, keptAssign, kwLoop, kwSlot, kwWrap, loopOut, slotOut, overWrite, overWriteSe, overWriteAssign, fromSlot, fromWrap };
