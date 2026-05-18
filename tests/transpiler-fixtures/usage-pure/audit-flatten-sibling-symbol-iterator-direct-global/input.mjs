// flatten + Symbol.iterator sibling with DIRECT proxy-global receiver (no aliasing).
// extractionReceiverSrc returns nodeSrc(tail) = 'globalThis'. natural visitor's
// 'globalThis -> _globalThis' substitution must compose into the rebuilt synth-extraction
// text so the final emit uses '_getIteratorMethod(_globalThis)' - otherwise old runtimes
// without native 'globalThis' fail at the extraction call. seedSkipped's
// 'skipReceiverTailSubtree' suppresses the receiver-tail visit, but the natural
// visitor's substitution happens via composition (the 'globalThis' Identifier is also
// visited as part of the standalone Identifier emit, which the rebuilt text incorporates
// via transform-queue compose)
const { Array: { from }, [Symbol.iterator]: iter } = globalThis;
console.log(from, iter);
