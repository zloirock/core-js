import _filterMaybeArray from "@core-js/pure/actual/array/instance/filter";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
var _ref, _ref2, _ref3;
// trailing COMPUTED member access after a threaded chain: `chainResult[0]`. like the `.X`
// follow-shape, the `[0]` binds into the SUCCESS branch (`cond ? void 0 : b[0]`): the chain
// short-circuit skips it natively, so severing it onto the ternary result would throw on the
// void 0 path. the intermediate `.map(...)` hop is threaded onto the inner result, not dropped
const arr = [1, 2];
null == (_ref = _flatMaybeArray(arr)) ? void 0 : _filterMaybeArray(_ref2 = _mapMaybeArray(_ref3 = _ref.call(arr)).call(_ref3, x => x * 2))?.call(_ref2)[0];