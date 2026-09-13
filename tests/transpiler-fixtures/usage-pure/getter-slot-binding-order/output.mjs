import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _WeakSet from "@core-js/pure/actual/weak-set";
// The getter executes while the destructured declaration is still uninitialized.
// Reading that binding must keep its temporal-dead-zone failure after rewriting.
// A constructor escaping through the getter includes its static methods.
export function readBeforeBinding(log) {
  const {
    w: {
      WeakSet: Value
    }
  } = {
    get w() {
      _pushMaybeArray(log).call(log, typeof Value);
      return {
        WeakSet: _WeakSet
      };
    }
  };
  return Value;
}