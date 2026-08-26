import _copyWithinMaybeArray from "@core-js/pure/actual/array/instance/copy-within";
import _fillMaybeArray from "@core-js/pure/actual/array/instance/fill";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _toSplicedMaybeArray from "@core-js/pure/actual/array/instance/to-spliced";
import _globalThis from "@core-js/pure/actual/global-this";
import _keys from "@core-js/pure/actual/instance/keys";
// a kept WRITE as the receiver: it is a prefix of its own - the store happens ONCE and the nav then
// reads what it stored. the placement parts by leg exactly like any other prefix (babel carries it
// inside the dispatch, the other leg lifts it), and the STORE is observable, so every row exports the
// written binding too
let kept, keptSe, keptAssign, kwLoop, kwSlot, kwWrap, loopOut, slotOut;
const overWrite = _fillMaybeArray((kept = _globalThis, _globalThis.Array.prototype)); // an SE prefix INSIDE the stored value travels with the write
const overWriteSe = _keys((keptSe = (effect(), _globalThis), _globalThis.Array.prototype)); // the ASSIGNMENT host parts by ROUTE, not by placement: babel keeps the raw destructure with its
// post-statement overwrite, the other leg consumes it
let overWriteAssign;
keptAssign = _globalThis;
// a FOR-HEAD stores BEFORE it binds - the write leads the header on both legs (its init runs once)
overWriteAssign = _copyWithinMaybeArray(_globalThis.Array.prototype);
for (const fromLoop = _findLastIndexMaybeArray((kwLoop = _globalThis, _globalThis.Array.prototype)); !loopOut;) loopOut = typeof fromLoop;
// a CONTROL slot keeps the write inside the dispatch on both legs: the effect must stay conditional
if (1) var fromSlot = _flatMapMaybeArray((kwSlot = _globalThis, _globalThis.Array.prototype));
slotOut = typeof fromSlot;
// an ARRAY-WRAPPER slot: babel carries the write, the other leg lifts it WHOLE and leaves its TARGET
// in the slot, so the stored value is read once (leaving the VALUE there doubled the effect log)
const fromWrap = _toSplicedMaybeArray((kwWrap = _globalThis, _globalThis.Array.prototype));
export { kept, keptSe, keptAssign, kwLoop, kwSlot, kwWrap, loopOut, slotOut, overWrite, overWriteSe, overWriteAssign, fromSlot, fromWrap };