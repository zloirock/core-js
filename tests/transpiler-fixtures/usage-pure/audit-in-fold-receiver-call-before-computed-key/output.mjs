import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
// in-fold where the RHS receiver is an impure chain-root call (zero-arg IIFE returning the global)
// followed by a computed key carrying its own side effect. native evaluates the receiver (object)
// BEFORE the computed key, so the scope-aware chain-root call must INTERLEAVE at the object terminus,
// not append after the structural key effect.
const r = ((() => {
  _pushMaybeArray(log).call(log, 'r');
  return _globalThis;
})(), _pushMaybeArray(log).call(log, 'k'), true);
export { r };