import _filterMaybeArray from "@core-js/pure/actual/array/instance/filter";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
var _ref, _ref2, _ref3;
// intermediate hop with a NON-optional outer call (`.filter(...)`, no `?.`): the chain still
// combines because the inner `flat?.()` introduces the `?.`, and the `.map(...)` hop threads onto
// the inner result; the outer emits a plain `.call` rather than the `?.call` short-circuit form
const arr = [1, 2];
null == (_ref = _flatMaybeArray(arr)) ? void 0 : _filterMaybeArray(_ref2 = _mapMaybeArray(_ref3 = _ref.call(arr)).call(_ref3, x => x * 2)).call(_ref2, y => y > 4);