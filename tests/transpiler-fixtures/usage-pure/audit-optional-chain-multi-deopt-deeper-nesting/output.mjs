import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2, _ref3, _ref4;
// deep optional chain with TWO separated optional clusters: a leading `?.` pair, then a run
// of non-optional hops, then a trailing `?.`. each nested polyfill combine collapses only the
// `?.` markers it folded and keeps the rest. compose must rebuild every inner needle in its
// partially-deoptionalized form across both clusters, not strip the whole chain at once
const r = null == (_ref = null == (_ref2 = arr == null ? void 0 : _flatMapMaybeArray(arr).call(arr, f)) ? void 0 : _includes(_ref3 = _at(_ref4 = _flatMaybeArray(_ref2).call(_ref2)).call(_ref4, 0)).call(_ref3, 1)) ? void 0 : _findLastMaybeArray(_ref).call(_ref, p);