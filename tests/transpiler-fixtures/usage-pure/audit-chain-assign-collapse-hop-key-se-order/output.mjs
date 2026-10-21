import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
// Receiver prefixes and stored roots keep their existing static-call handling.
// Effectful realm keys retain source order: prefix, store, key, read.
let r,
  log = [];
function eff(t) {
  _pushMaybeArray(log).call(log, t);
  return 'self';
}
const single = (r = _globalThis)[eff('a'), 'self'].Array.of(1);
const prefix = (eff('b'), r = _globalThis, _Array$from)([2]);
const both = (eff('c'), r = _globalThis)[eff('d'), 'self'].Promise.resolve(3);
export { single, prefix, both, r, log };