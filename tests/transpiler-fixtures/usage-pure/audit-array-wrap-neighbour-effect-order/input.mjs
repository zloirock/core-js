// Call and spread neighbours run before the destructure reads any array element.
// Instance leaves share their captured element; constructor and static wrapper reads remain native.
const anchor = [1, 2];
export { anchor };

// An effectful neighbour evaluates before the extracted property reads.
// Both extractions follow the original RHS; the unchanged receiver needs no capture.
const [{ at, keys }, viaCall] = [arr, effect()];
export { at, keys, viaCall };

// A realm constructor beside a spread keeps its native property read and iteration.
const [{ Set: PureSet }, viaSpread] = [globalThis, ...tail];
export { PureSet, viaSpread };

// a PURE neighbour pins nothing: the consumed props leave the residual (their extractions bind
// them, and a residual re-reading the same keys would fire their getters a second time)
const [{ at: at2, keys: keys2 }, plain] = [arr, 7];
export { at2, keys2, plain };

// A static-only element with a neighbour retains its native property read.
const [{ Array: { from } }, plain2] = [globalThis, 1];
export { from, plain2 };
