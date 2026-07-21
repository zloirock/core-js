import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _filterMaybeArray from "@core-js/pure/actual/array/instance/filter";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _sliceMaybeArray from "@core-js/pure/actual/array/instance/slice";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6;
// optional chain with a non-optional intermediate hop between the optional inner and outer
// calls: `arr.flat?.().map(...).filter?.()`. the chain combine threads the surviving `.map(...)`
// onto the memoized inner result so the hop is preserved instead of dropped (a dropped hop would
// corrupt the value). the trailing `.some(...)` (native here, not polyfilled) rides the SUCCESS
// branch: a short-circuiting chain skips it natively, so a paren wrap severing it onto the
// ternary result would throw on the void 0 path where native yields undefined
const arr = [1, 2];
null == (_ref = _flatMaybeArray(arr)) ? void 0 : _filterMaybeArray(_ref2 = _mapMaybeArray(_ref3 = _ref.call(arr)).call(_ref3, x => x * 2))?.call(_ref2).some(x => x > 3);
// a CALL link inside an optional-root receiver keeps the fold: the call is its own dispatch
// whose guard-hoist already covers the nullish root - the single-root hoist is member-walk only
null == (_ref4 = arr == null ? void 0 : _flatMaybeArray(_ref5 = _sliceMaybeArray(arr).call(arr))) ? void 0 : _atMaybeArray(_ref6 = _ref4.call(_ref5)).call(_ref6, 0);