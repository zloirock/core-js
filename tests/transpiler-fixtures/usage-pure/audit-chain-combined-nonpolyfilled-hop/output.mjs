import _filterMaybeArray from "@core-js/pure/actual/array/instance/filter";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref, _ref2;
// intermediate hop whose method is native at the target (`.reverse()`, not polyfilled here): it
// threads as verbatim source appended to the inner result instead of being wrapped in a polyfill
// binding, while the polyfilled inner and outer still combine around it
const arr = [1, 2];
null == arr || null == (_ref = _flatMaybeArray(arr)) ? void 0 : _filterMaybeArray(_ref2 = _ref.call(arr).reverse())?.call(_ref2, y => y > 4);