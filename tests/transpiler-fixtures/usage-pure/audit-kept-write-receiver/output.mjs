import _copyWithinMaybeArray from "@core-js/pure/actual/array/instance/copy-within";
import _fillMaybeArray from "@core-js/pure/actual/array/instance/fill";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _keysMaybeArray from "@core-js/pure/actual/array/instance/keys";
import _toSplicedMaybeArray from "@core-js/pure/actual/array/instance/to-spliced";
import _globalThis from "@core-js/pure/actual/global-this";
// A kept write used as a receiver runs once before the selected instance method is read.
// Each stored binding is exported so preserving the assigned value remains observable.
let kept, keptSe, keptAssign, kwLoop, kwSlot, kwWrap, loopOut, slotOut;
const overWrite = _fillMaybeArray((kept = _globalThis, _globalThis.Array.prototype)); // An effect inside the stored value runs once as part of the write.
const overWriteSe = _keysMaybeArray((keptSe = (effect(), _globalThis), _globalThis.Array.prototype)); // An assignment host also keeps the receiver store before the target method binding.
let overWriteAssign;
keptAssign = _globalThis;
// A for-init header stores the receiver before binding its method; initialization runs once.
overWriteAssign = _copyWithinMaybeArray(_globalThis.Array.prototype);
for (const fromLoop = _findLastIndexMaybeArray((kwLoop = _globalThis, _globalThis.Array.prototype)); !loopOut;) loopOut = typeof fromLoop;
// A bodyless control slot keeps the store and instance read conditional.
if (1) var fromSlot = _flatMapMaybeArray((kwSlot = _globalThis, _globalThis.Array.prototype));
slotOut = typeof fromSlot;
// An array wrapper captures its stored element before reading the selected prototype slot.
// The write and any effect inside its value must not be duplicated.
const [_ref] = [kwWrap = _globalThis];
const fromWrap = _toSplicedMaybeArray(_globalThis.Array.prototype);
export { kept, keptSe, keptAssign, kwLoop, kwSlot, kwWrap, loopOut, slotOut, overWrite, overWriteSe, overWriteAssign, fromSlot, fromWrap };