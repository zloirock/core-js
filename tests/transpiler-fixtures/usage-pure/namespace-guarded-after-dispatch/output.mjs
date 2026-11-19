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
      _pushMaybeArray(log).call(log, typeof first);
      return _globalThis;
    },
    get tail() {
      _pushMaybeArray(log).call(log, typeof Value);
      return 3;
    }
  };
  export const first = _atMaybeArray(_ref.array);
  const {
    realm: _ref2
  } = _ref;
  export const Value = _ref2 === _globalThis ? _WeakSet : _ref2.WeakSet;
  export const {
    tail
  } = _ref;
}
N;