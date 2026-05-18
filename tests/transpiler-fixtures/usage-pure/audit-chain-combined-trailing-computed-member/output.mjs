import _filterMaybeArray from "@core-js/pure/actual/array/instance/filter";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref, _ref2;
// trailing COMPUTED member access after chain emit: `chainEmit[0]`. like the `.X` case,
// without paren-wrap the `[0]` binds to the success branch only (`cond ? a : b[0]`),
// stranding `void 0` in the null path. babel emits the wrap so `[0]` accesses the
// conditional result. `chainEmitNeedsWrap` covers both `.X` and `[X]` follow-shapes
const arr = [1, 2];
(null == arr || null == (_ref = _flatMaybeArray(arr)) ? void 0 : _filterMaybeArray(_ref2 = _ref.call(arr))?.call(_ref2))[0];