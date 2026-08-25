// an untouched leading statement anchors the comments below
const anchor = [1, 2];
export { anchor };

// NEGATIVE: an effect-bearing NEIGHBOUR element pins the order - native evaluates every element
// of the array literal before reading a property off any of them, while an extraction hoisted
// ahead of the declaration reads first. a receiver-reading claim therefore stays native
const [{ at, keys }, viaCall] = [arr, effect()];
export { at, keys, viaCall };

// ... a receiver-LESS static neither reads the element nor reorders anything, so the same
// neighbour leaves it free to extract
const [{ Set: PureSet }, viaSpread] = [globalThis, ...tail];
export { PureSet, viaSpread };

// a PURE neighbour pins nothing: the consumed props leave the residual (their extractions bind
// them, and a residual re-reading the same keys would fire their getters a second time)
const [{ at: at2, keys: keys2 }, plain] = [arr, 7];
export { at2, keys2, plain };

// ... while a receiver-less static keeps its sentinel there - it reads nothing to re-read
const [{ Array: { from } }, plain2] = [globalThis, 1];
export { from, plain2 };
