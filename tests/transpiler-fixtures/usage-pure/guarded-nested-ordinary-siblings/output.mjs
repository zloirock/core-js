import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _WeakSet from "@core-js/pure/actual/weak-set";
// Ordinary instance reads on both sides join the nested guarded slot's schedule.
// The first method binds before the receiver getter, and the last sees the constructor.
// A constructor escaping through the getter includes its static methods.
const log = [];
const {
  at: first,
  realm: {
    WeakSet: Value
  },
  includes: last
} = {
  get at() {
    _pushMaybeArray(log).call(log, 'first');
    return function () {
      return 41;
    };
  },
  get realm() {
    _pushMaybeArray(log).call(log, typeof first);
    return {
      WeakSet: _WeakSet
    };
  },
  get includes() {
    _pushMaybeArray(log).call(log, typeof Value);
    return function () {
      return 42;
    };
  }
};
export { first, Value, last, log };