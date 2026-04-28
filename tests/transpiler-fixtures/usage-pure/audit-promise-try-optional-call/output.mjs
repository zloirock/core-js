import _Promise$try from "@core-js/pure/actual/promise/try";
// Promise.try?.(fn): optional call directly on a polyfilled static. since the pure
// polyfill binding is always defined, the `?.` guard is provably redundant - plugin
// drops it and emits an unconditional `_Promise$try(fn)` call. downstream optional
// chain on the resulting promise is preserved (it is on the user value, not polyfill)
const p = _Promise$try(fn);
p?.then(handler);