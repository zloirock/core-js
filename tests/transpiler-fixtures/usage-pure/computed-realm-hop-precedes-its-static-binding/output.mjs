import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _Reflect$has from "@core-js/pure/actual/reflect/has";
// The key observes the binding before initialization; the next sibling observes its new value.
export function read(log) {
  function key() {
    _pushMaybeArray(log).call(log, typeof resolve);
    return 'Promise';
  }
  var {
      globalThis: {
        [key()]: _unused
      } = _Reflect$has(_globalThis, "globalThis") ? void 0 : _globalThis
    } = _globalThis,
    resolve = _Promise$resolve,
    {
      next
    } = _globalThis;
  return [resolve, next];
}