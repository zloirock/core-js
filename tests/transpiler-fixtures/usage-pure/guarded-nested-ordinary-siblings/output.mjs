import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _WeakSet from "@core-js/pure/actual/weak-set";
// Native getter leaves surround a served constructor at their original source positions.
// Each getter observes only the bindings already initialized before its own read.
const log = [];
const _ref = {
    get at() {
      _pushMaybeArray(log).call(log, 'first');
      return function () {
        return 41;
      };
    },
    get realm() {
      _pushMaybeArray(log).call(log, typeof first);
      return _globalThis;
    },
    get includes() {
      _pushMaybeArray(log).call(log, typeof Value);
      return function () {
        return 42;
      };
    }
  },
  {
    at: first
  } = _ref,
  {
    realm: _ref2
  } = _ref,
  Value = _ref2 === _globalThis ? _WeakSet : _ref2.WeakSet,
  {
    includes: last
  } = _ref;
export { first, Value, last, log };