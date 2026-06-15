import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _filterMaybeArray from "@core-js/pure/actual/array/instance/filter";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
var _ref, _ref2, _ref3, _ref4;
// Same TS non-null wrapper under the outer member, but with MORE intermediate poly hops between the
// optional `flat?.()` and the outer `.at` (map + filter). The marking walk must peel the `!` and
// reach the optional chainStart so every intermediate hop is marked; a wrapper-blind walk stopped at
// the `!`, left map/filter unmarked, re-matched the inner chain, and crashed the transform queue.
const arr: number[] = [1];
null == (_ref = _flatMaybeArray(arr)) ? void 0 : _atMaybeArray(_ref2 = _filterMaybeArray(_ref3 = _mapMaybeArray(_ref4 = _ref.call(arr)).call(_ref4, x => x)).call(_ref3, Boolean)).call(_ref2, -1);
