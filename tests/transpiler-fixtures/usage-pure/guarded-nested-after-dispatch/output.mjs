import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _WeakSet from "@core-js/pure/actual/weak-set";
// The first nested dispatch and the later guarded slot share the original host.
// Neither may erase the source facts the other read still needs.
// A constructor escaping through the getter includes its static methods.
const log = [];
const _ref = {
  array: [41],
  get realm() {
    _pushMaybeArray(log).call(log, typeof first);
    return _globalThis;
  },
  get tail() {
    _pushMaybeArray(log).call(log, typeof Value);
    return 3;
  }
};
const first = _atMaybeArray(_ref.array);
const {
  realm: _ref2
} = _ref;
const Value = _ref2 === _globalThis ? _WeakSet : _ref2.WeakSet;
const {
  tail
} = _ref;
export { first, Value, tail, log };