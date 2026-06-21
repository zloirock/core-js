import _Array$from from "@core-js/pure/es/array/from";
import _globalThis from "@core-js/pure/es/global-this";
// IIFE caller arg is `globalThis.AsyncIterator` (safe feature-detection access). in
// `mode: es` AsyncIterator is not polyfilled so the arg can't be classified statically;
// the wrapper-default `= Array` supplies the receiver type and `Array.from` resolves to
// its polyfill. the wrapper-default fires when the arg is undefined; `globalThis` is polyfilled too
const r = (({
  from = []
} = {
  from: _Array$from
}) => from([1, 2, 3]))(_globalThis.AsyncIterator);
export { r };