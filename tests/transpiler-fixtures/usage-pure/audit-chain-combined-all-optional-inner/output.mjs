import _filterMaybeArray from "@core-js/pure/actual/array/instance/filter";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
var _ref, _ref2, _ref3;
// fully-optional chain where the combine's inner receiver is itself a polyfilled optional call
// (`arr?.flat?.()`): the inner method must still be polyfilled inside the memoized receiver rather
// than dropped. the receiver subtree is left visitable so its own polyfill emits
null == (_ref = arr == null ? void 0 : _flatMaybeArray(arr)?.call(arr)) || null == (_ref2 = _mapMaybeArray(_ref)) || null == (_ref3 = _ref2.call(_ref)) ? void 0 : _filterMaybeArray(_ref3)?.call(_ref3);