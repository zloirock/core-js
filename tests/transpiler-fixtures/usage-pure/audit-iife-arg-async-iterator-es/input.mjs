// IIFE caller arg is `globalThis.AsyncIterator`: safe feature-detection access (yields
// undefined when missing instead of ReferenceError). in `mode: es` AsyncIterator is not
// in the polyfill set so the caller arg cannot be classified statically; the wrapper-default
// `= Array` provides the receiver type and `Array.from` resolves to its polyfill there.
// at runtime when `globalThis.AsyncIterator` is undefined the wrapper-default fires; user
// fallback `[]` is unreachable. `globalThis` itself is polyfilled in es mode
const r = (({ from = [] } = Array) => from([1, 2, 3]))(globalThis.AsyncIterator);
export { r };
