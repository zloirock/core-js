// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order. Instance claims retain their own receivers.
const anchor = [1, 2];
export { anchor };

const [{ at, keys }, viaCall] = [arr, effect()];
export { at, keys, viaCall };

const [{ Set: PureSet }, viaSpread] = [globalThis, ...tail];
export { PureSet, viaSpread };

const [{ at: at2, keys: keys2 }, plain] = [arr, 7];
export { at2, keys2, plain };

const [{ Array: { from } }, plain2] = [globalThis, 1];
export { from, plain2 };
