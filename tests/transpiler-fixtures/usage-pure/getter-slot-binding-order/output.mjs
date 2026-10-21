import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _WeakSet from "@core-js/pure/actual/weak-set";
// Shared capture and receiver-default routes preserve independently supported claims.
// Getter reads and binding initialization keep their source order. Instance claims retain their own receivers.
export function readBeforeBinding(log) {
  const {
      w: _ref
    } = {
      get w() {
        _pushMaybeArray(log).call(log, typeof Value);
        return _globalThis;
      }
    },
    Value = _ref === _globalThis ? _WeakSet : _ref.WeakSet;
  return Value;
}