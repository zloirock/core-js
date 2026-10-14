import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _fillMaybeArray from "@core-js/pure/actual/array/instance/fill";
import _findIndexMaybeArray from "@core-js/pure/actual/array/instance/find-index";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _joinMaybeArray from "@core-js/pure/actual/array/instance/join";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$getOwnPropertyNames from "@core-js/pure/actual/object/get-own-property-names";
import _Object$values from "@core-js/pure/actual/object/values";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
// `window` read through a backed realm hop is the realm's self-reference the collapse assumes present,
// so the navigation through it folds whole and keeps no test of its own - however many instance calls
// run past the static it reaches, through an alias of the realm, a sequence or a `typeof` alike. A
// probe read straight off the realm keeps its test.
const realm = _globalThis;
let effects = 0;
export const joined = _joinMaybeArray(_ref = _mapMaybeArray(_ref2 = _Array$from([1, 2])).call(_ref2, String)).call(_ref);
export const flatAt = _atMaybeArray(_ref3 = _flatMaybeArray(_ref4 = _Array$of(1, [2])).call(_ref4)).call(_ref3, 0);
export const found = _findLastMaybeArray(_ref5 = _toSortedMaybeArray(_ref6 = (effects++, _Object$values)([3])).call(_ref6)).call(_ref5, Boolean);
export const kind = typeof _includesMaybeArray(_fillMaybeArray(_ref7 = _Object$getOwnPropertyNames([4])).call(_ref7, 0));
export const probed = null == _globalThis.window ? void 0 : _findIndexMaybeArray(_ref8 = _toReversedMaybeArray(_ref9 = _Object$entries([5, 6])).call(_ref9)).call(_ref8, Boolean);