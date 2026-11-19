import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
import _withMaybeArray from "@core-js/pure/actual/array/instance/with";
import _toFixedMaybeNumber from "@core-js/pure/actual/number/instance/to-fixed";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _ref10, _ref11, _ref12, _ref13;
// a `!` inside the receiver continues its chain: the live `?.` below the assertion is still the link
// the guard tests, and the receiver past it is read plainly with the assertion kept where the source
// wrote it, so a receiver that comes out nullish there throws at the method read, as the source does
declare const box: {
  list: number[][];
  inner?: {
    list: number[];
  };
} | null;
export const afterLink = null == box || null == (_ref = _flatMapMaybeArray(_ref2 = box.list!)) ? void 0 : _atMaybeArray(_ref3 = _ref.call(_ref2, x => x)).call(_ref3, 0);
export const beforeLink = null == box! || null == (_ref4 = _flatMaybeArray(_ref5 = box!.list)) ? void 0 : _includesMaybeArray(_ref6 = _ref4.call(_ref5)).call(_ref6, 1);
export const onMethod = null == (_ref7 = box?.inner) || null == (_ref8 = _findLastMaybeArray(_ref9 = _ref7.list)) ? void 0 : _toFixedMaybeNumber(_ref10 = _ref8.call(_ref9, Boolean)).call(_ref10, 1);
export const betweenHops = null == box || null == (_ref11 = _toSortedMaybeArray(_ref12 = box.inner!.list)) ? void 0 : _withMaybeArray(_ref13 = _ref11.call(_ref12)).call(_ref13, 0, 1);