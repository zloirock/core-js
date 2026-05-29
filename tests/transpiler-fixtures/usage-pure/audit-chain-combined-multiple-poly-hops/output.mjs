import _filterMaybeArray from "@core-js/pure/actual/array/instance/filter";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _sliceMaybeArray from "@core-js/pure/actual/array/instance/slice";
var _ref, _ref2, _ref3, _ref4;
// two consecutive non-optional polyfillable hops (`.map(...).slice(...)`) between the optional
// inner and outer. each threads onto the running result, innermost first, while `_ref` slots are
// allocated outermost-first so the emit matches across both plugins even with more than one hop
const arr = [1, 2];
null == arr || null == (_ref = _flatMaybeArray(arr)) ? void 0 : _filterMaybeArray(_ref2 = _sliceMaybeArray(_ref3 = _mapMaybeArray(_ref4 = _ref.call(arr)).call(_ref4, x => x * 2)).call(_ref3, 1))?.call(_ref2, y => y > 4);