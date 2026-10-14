import _fillMaybeArray from "@core-js/pure/actual/array/instance/fill";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
import _toSplicedMaybeArray from "@core-js/pure/actual/array/instance/to-spliced";
import _withMaybeArray from "@core-js/pure/actual/array/instance/with";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
import _keys from "@core-js/pure/actual/instance/keys";
import _toExponentialMaybeNumber from "@core-js/pure/actual/number/instance/to-exponential";
import _toFixedMaybeNumber from "@core-js/pure/actual/number/instance/to-fixed";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _ref10, _ref11, _ref12, _ref13, _ref14, _ref15, _ref16, _ref17, _ref18, _ref19, _ref20;
// an optional method call whose receiver carries a live `?.` short-circuits at that link alone: the
// guard tests the link's object and the method is read off the receiver plainly past it, so a receiver
// that comes out nullish below the link throws at the method read, as the source does. a `?.` on the
// method member itself tests the receiver's own value instead
const box = _globalThis.box;
const key = 'list';
export const optionalOuter = null == box || null == (_ref = _flatMapMaybeArray(_ref2 = box.list)) ? void 0 : _toSortedMaybeArray(_ref3 = _ref.call(_ref2, x => [x]))?.call(_ref3);
export const plainOuter = null == box || null == (_ref4 = _flatMaybeArray(_ref5 = box.list)) ? void 0 : _at(_ref6 = _ref4.call(_ref5)).call(_ref6, 0);
export const optionalResult = null == box || null == (_ref7 = _findLastMaybeArray(_ref8 = box.list)?.call(_ref8, Boolean)) ? void 0 : _toFixedMaybeNumber(_ref7).call(_ref7, 1);
export const getTail = null == box || null == (_ref9 = _toReversedMaybeArray(_ref10 = box.list)) ? void 0 : _withMaybeArray(_ref9.call(_ref10));
export const computedLink = null == box || null == (_ref11 = _findLastIndexMaybeArray(_ref12 = box[key])) ? void 0 : _toExponentialMaybeNumber(_ref13 = _ref11.call(_ref12, Boolean)).call(_ref13, 1);
export const deeperLink = null == (_ref14 = box?.inner) || null == (_ref15 = _toSplicedMaybeArray(_ref16 = _ref14.list)) ? void 0 : _includes(_ref17 = _ref15.call(_ref16, 0, 1)).call(_ref17, 1);
// NEGATIVE: the method member's own `?.` tests the receiver value
export const ownOptional = null == (_ref18 = box?.list) || null == (_ref19 = _fillMaybeArray(_ref18)) ? void 0 : _keys(_ref20 = _ref19.call(_ref18, 0)).call(_ref20);