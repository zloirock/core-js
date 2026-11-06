import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
import _withMaybeArray from "@core-js/pure/actual/array/instance/with";
import _includes from "@core-js/pure/actual/instance/includes";
import _toExponentialMaybeNumber from "@core-js/pure/actual/number/instance/to-exponential";
import _toFixedMaybeNumber from "@core-js/pure/actual/number/instance/to-fixed";
import _padEndMaybeString from "@core-js/pure/actual/string/instance/pad-end";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _ref10;
// A `!` between two links ABOVE a claim continues the claim's chain: the guard its `?.` owes covers
// the continuation past the assertion - after a plain dispatch, past a stacked assertion, after a
// dispatch whose own optional call re-opens the chain, and after two optional dispatches joined into
// one guard. A `?.` after the assertion re-guards the result outside.
declare const nums: number[] | null;
declare const strs: string[] | null;
declare const lists: any[] | null;
nums == null ? void 0 : _toFixedMaybeNumber(_ref = _atMaybeArray(nums).call(nums, -1)).call(_ref, 2)!.length;
nums == null ? void 0 : _toExponentialMaybeNumber(_ref2 = _findLastIndexMaybeArray(nums).call(nums, Boolean)).call(_ref2, 1).toString()!!.length;
lists == null ? void 0 : _flatMaybeArray(_ref3 = lists[0])?.call(_ref3)!.length;
lists == null ? void 0 : _includes(_ref4 = lists[0])?.call(_ref4, 1)!.valueOf();
null == lists || null == (_ref5 = _flatMapMaybeArray(_ref6 = lists[1])) ? void 0 : _toSortedMaybeArray(_ref7 = _ref5.call(_ref6, x => [x]))?.call(_ref7)!.length;
null == lists || null == (_ref8 = _withMaybeArray(lists)) ? void 0 : _toReversedMaybeArray(_ref9 = _ref8.call(lists, 0, 2))?.call(_ref9)!.length;
(strs == null ? void 0 : _padEndMaybeString(_ref10 = _findLastMaybeArray(strs).call(strs, Boolean)).call(_ref10, 2))!?.toString();