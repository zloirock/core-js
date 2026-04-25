// Same shape as `audit-iife-arg-with-existing-default` but caller-arg is
// `globalThis.AsyncIterator` - safe feature-detection access (returns undefined when
// AsyncIterator is missing instead of throwing ReferenceError on bare reference).
// In `mode: es` AsyncIterator isn't part of the polyfill set, so caller-arg can't be
// classified statically. Wrapper-default `= Array` provides the static receiver context:
// `Array.from` IS in es polyfill set, so synth-swap targets the wrapper-default. At runtime
// when `globalThis.AsyncIterator` is undefined, wrapper-default fires and `from` resolves
// to the polyfilled `_Array$from`; user fallback `[]` becomes dead code (the synth object
// is always defined). `globalThis` itself is also polyfilled in es mode
const r = (({ from = [] } = Array) => from([1, 2, 3]))(globalThis.AsyncIterator);
export { r };
