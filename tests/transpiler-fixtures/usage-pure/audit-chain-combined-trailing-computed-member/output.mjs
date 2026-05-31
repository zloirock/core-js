import _filterMaybeArray from "@core-js/pure/actual/array/instance/filter";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
var _ref, _ref2, _ref3;
// trailing COMPUTED member access after a threaded chain: `chainResult[0]`. like the `.X`
// follow-shape, without a paren-wrap the `[0]` would bind to the success branch only
// (`cond ? a : b[0]`), stranding the null path; the wrap targets the conditional result. the
// intermediate `.map(...)` hop is threaded onto the inner result, not dropped
const arr = [1, 2];
(null == (_ref = _flatMaybeArray(arr)) ? void 0 : _filterMaybeArray(_ref2 = _mapMaybeArray(_ref3 = _ref.call(arr)).call(_ref3, x => x * 2))?.call(_ref2))[0];