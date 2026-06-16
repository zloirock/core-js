import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _isIterable from "@core-js/pure/actual/is-iterable";
// symbol-in fold where the LHS receiver is a sequence prefix followed by an impure chain-root call
// (zero-arg IIFE returning the global). the prefix lexically precedes the receiver, so it runs BEFORE
// the chain-root call - source order [prefix, IIFE], not [IIFE, prefix].
const r = (_pushMaybeArray(log).call(log, 'p'), (() => {
  _pushMaybeArray(log).call(log, 'r');
  return _globalThis;
})(), _isIterable([]));
export { r };