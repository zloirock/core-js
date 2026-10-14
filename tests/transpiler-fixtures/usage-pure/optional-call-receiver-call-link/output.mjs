import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
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
import _toFixedMaybeNumber from "@core-js/pure/actual/number/instance/to-fixed";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _ref10, _ref11, _ref12, _ref13, _ref14, _ref15, _ref16, _ref17, _ref18, _ref19, _ref20;
// the receiver's live `?.` can be an optional CALL: the callee's lookup takes the test and the call's
// result is read plainly by the method above it, so a result that comes out nullish throws there, as the
// source does. a method the build serves memoizes its lookup over the receiver - a tested receiver as a
// test of its own ahead of it - and one it does not keeps the plain member read
const box = _globalThis.box;
export const servedLookup = null == (_ref = _flatMaybeArray(_ref2 = box.list)) || null == (_ref3 = _flatMapMaybeArray(_ref4 = _ref.call(_ref2))) ? void 0 : _at(_ref5 = _ref3.call(_ref4, x => [x])).call(_ref5, 0);
export const rawLookup = null == (_ref6 = box.list, _ref7 = _ref6.pick) || null == (_ref8 = _toSortedMaybeArray(_ref9 = _ref7.call(_ref6))) ? void 0 : _includes(_ref10 = _ref8.call(_ref9)).call(_ref10, 1);
export const testedReceiver = null == (_ref11 = box.list) || null == (_ref12 = _toReversedMaybeArray(_ref11)) || null == (_ref13 = _findLastMaybeArray(_ref14 = _ref12.call(_ref11))) ? void 0 : _toFixedMaybeNumber(_ref15 = _ref13.call(_ref14, Boolean)).call(_ref15, 1);
export const behindMemberLink = null == box || null == (_ref16 = _toSplicedMaybeArray(_ref17 = box.list)) || null == (_ref18 = _withMaybeArray(_ref19 = _ref16.call(_ref17, 0, 1))) ? void 0 : _keys(_ref20 = _ref18.call(_ref19, 0, 1)).call(_ref20);