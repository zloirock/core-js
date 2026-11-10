import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// Replacing a private constructor capture keeps it private.
namespace N {
  var _ref3;
  export const before = effect();
  const _ref = _Set;
  export const method = null == _ref ? _ref[""] : (effect(), _getIteratorMethod(_ref));
  const _ref2 = _WeakMap;
  export const fallback = null == _ref2 ? _ref2[""] : (other(), (_ref3 = _getIteratorMethod(_ref2)) === void 0 ? null : _ref3);
}
N;