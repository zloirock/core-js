import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _WeakSet from "@core-js/pure/actual/weak-set";
// A private capture stays private after an earlier nested extraction drains.
const log = [];
namespace N {
  const _ref = {
    array: [41],
    get realm() {
      (_pushMaybeArray(log) || 0).call(log, typeof first, typeof N.first);
      return _globalThis;
    },
    get tail() {
      (_pushMaybeArray(log) || 0).call(log, typeof Value, typeof N.Value);
      return 3;
    }
  };
  let _ref2;
  export const {
      value: {
        first: first
      }
    } = {
      value: {
        first: _atMaybeArray(_ref.array)
      }
    },
    {
      value: {
        Value: Value
      }
    } = {
      value: {
        Value: ({
          realm: _ref2
        } = _ref, _ref2 === _globalThis ? _WeakSet : _ref2.WeakSet)
      }
    },
    {
      tail
    } = _ref;
}
N;