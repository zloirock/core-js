import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2, _ref3;
// optional chain whose first two hops are BOTH optional (`arr?.flat()?.flatMap(...)`) before a
// non-optional tail. the outer transform folds the consecutive `?.` leads into its receiver and
// keeps none of the tail's dots optional. compose must locate each inner needle against that
// partially-deoptionalized receiver instead of re-stripping the surviving structural dots
const r = null == (_ref = arr == null ? void 0 : _flatMaybeArray(arr).call(arr)) ? void 0 : _includes(_ref2 = _at(_ref3 = _flatMapMaybeArray(_ref).call(_ref, f)).call(_ref3, 0)).call(_ref2, 1);