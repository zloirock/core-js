import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _WeakSet from "@core-js/pure/actual/weak-set";
// A getter supplying the realm runs before its nested constructor binding is initialized.
// Reading that binding inside the getter must still observe its temporal dead zone.
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