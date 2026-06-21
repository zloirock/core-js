// IIFE caller arg is `globalThis.AsyncIterator` (safe feature-detection access). in
// `mode: es` AsyncIterator is not polyfilled so the arg can't be classified statically;
// the wrapper-default `= Array` supplies the receiver type and `Array.from` resolves to
// its polyfill. the wrapper-default fires when the arg is undefined; `globalThis` is polyfilled too
const r = (({ from = [] } = Array) => from([1, 2, 3]))(globalThis.AsyncIterator);
export { r };
