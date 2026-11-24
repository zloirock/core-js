import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// Replacing a private constructor capture keeps it private.
namespace N {
  var _ref;
  export const before = effect(),
    method = null == _Set ? _Set[""] : (effect(), _getIteratorMethod(_Set)),
    {
      fallback: fallback
    } = {
      fallback: null == _WeakMap ? _WeakMap[""] : (other(), (_ref = _getIteratorMethod(_WeakMap)) === void 0 ? null : _ref)
    };
}
N;