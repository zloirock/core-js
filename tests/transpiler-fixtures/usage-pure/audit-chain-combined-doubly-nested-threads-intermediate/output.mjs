import _filterMaybeArray from "@core-js/pure/actual/array/instance/filter";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
var _ref, _ref2, _ref3;
// optional chain with a non-optional intermediate hop between the optional inner and outer
// calls: `arr.flat?.().map(...).filter?.()`. the chain combine threads the surviving `.map(...)`
// onto the memoized inner result so the hop is preserved instead of dropped (a dropped hop would
// corrupt the value). the trailing `.some(...)` (native here, not polyfilled) forces a paren-wrap
// so it binds to the conditional result, not the success branch alone, restoring native semantics
const arr = [1, 2];
(null == arr || null == (_ref = _flatMaybeArray(arr)) ? void 0 : _filterMaybeArray(_ref2 = _mapMaybeArray(_ref3 = _ref.call(arr)).call(_ref3, x => x * 2))?.call(_ref2)).some(x => x > 3);