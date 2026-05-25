import _Array$from from "@core-js/pure/actual/array/from";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
// flatten + Symbol.iterator sibling with DIRECT proxy-global receiver (no aliasing).
// extractionReceiverSrc returns original-source slice(tail) = 'globalThis'. natural visitor's
// 'globalThis -> _globalThis' substitution must compose into the rebuilt synth-extraction
// text so the final emit uses '_getIteratorMethod(_globalThis)' - otherwise old runtimes
// without native 'globalThis' fail at the extraction call. seedSkipped's
// 'skipReceiverTailSubtree' suppresses the receiver-tail visit, but the natural
// visitor's substitution happens via composition (the 'globalThis' Identifier is also
// visited as part of the standalone Identifier emit, which the rebuilt text incorporates
// via transform-queue compose)
const from = _Array$from;
const iter = _getIteratorMethod(_globalThis);
console.log(from, iter);