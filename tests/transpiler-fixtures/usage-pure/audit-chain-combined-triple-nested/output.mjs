import _filterMaybeArray from "@core-js/pure/actual/array/instance/filter";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
var _ref, _ref2, _ref3;
// three optional levels in one chain: `arr.flat?.().map(...).filter?.().reduce?.(...)`. the
// combine fires at the outermost polyfilled optional call (`.filter?.()`) and threads the
// `.map(...)` hop onto the inner result, marking the consumed intermediates skipped so no
// duplicate chain emit queues at each one. the trailing native `.reduce?.(...)` and
// `.toString()` read off the parenthesized chain result; TS-annotated args pass through verbatim
const arr = [1, 2];
(null == (_ref = _flatMaybeArray(arr)) ? void 0 : _filterMaybeArray(_ref2 = _mapMaybeArray(_ref3 = _ref.call(arr)).call(_ref3, x => x * 2))?.call(_ref2)).reduce?.((a: number, b: number) => a + b, 0).toString();